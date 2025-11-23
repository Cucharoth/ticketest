package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"slices"
	"time"

	"github.com/cucharoth/ticketest/internal/domain"
)

// httpClientTimeout is the timeout used for outbound HTTP calls.
const httpClientTimeout = 10 * time.Second

func newHTTPClient() *http.Client {
	return &http.Client{Timeout: httpClientTimeout}
}

// doRequest executes an HTTP request with the provided method, URL and body.
// If out is non-nil the response body is decoded as JSON into out.
// expected is a list of acceptable HTTP statuses; if omitted, http.StatusOK is expected.
func doRequest(ctx context.Context, client *http.Client, method, url string, body any, out any, expected ...int) (int, error) {
	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return 0, fmt.Errorf("marshal body: %w", err)
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return 0, fmt.Errorf("new request: %w", err)
	}

	// set content headers when sending JSON, accept JSON by default
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	status := resp.StatusCode

	// Determine acceptable statuses
	if len(expected) == 0 {
		expected = []int{http.StatusOK}
	}
	ok := slices.Contains(expected, status)

	// If not ok, return an error with response body to help debugging
	if !ok {
		// read up to a reasonable limit to avoid memory explosions
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 4*1024))
		// treat 404 specifically
		if status == http.StatusNotFound {
			return status, domain.ErrNotFound
		}
		return status, fmt.Errorf("unexpected status %d: %s", status, string(b))
	}

	// If caller requested decoding and there is a body, decode it.
	if out != nil {
		// If no content, simply return nil (some endpoints return 204)
		if status == http.StatusNoContent {
			return status, nil
		}
		dec := json.NewDecoder(resp.Body)
		if err := dec.Decode(out); err != nil {
			// if EOF and no bytes, treat as no body rather than an error
			if errors.Is(err, io.EOF) {
				return status, nil
			}
			return status, fmt.Errorf("decode response: %w", err)
		}
	}

	return status, nil
}

// VerifyAvailability checks whether tickets are available for the given event
// by calling the events service endpoint GET /events/{id}/availability.
func VerifyAvailability(ctx context.Context, baseURL, id string) (bool, error) {
	client := newHTTPClient()
	url := fmt.Sprintf("%s/events/%s/availability", baseURL, id)

	var ev domain.Event
	_, err := doRequest(ctx, client, http.MethodGet, url, nil, &ev, http.StatusOK)
	if err != nil {
		return false, err
	}

	// Business checks
	if ev.TicketsLeft <= 0 {
		return false, nil
	}
	if ev.TicketSold >= ev.TicketMax {
		return false, nil
	}
	return true, nil
}

// ReserveEvent reserves a ticket for attendeeId on eventId. It is a best-effort
// Note: This is not transactional; callers should handle compensations or retries as needed.
func ReserveEvent(ctx context.Context, baseURL, eventId, attendeeId string, ticketReq *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error) {
	client := newHTTPClient()

	// 1) Check if attendee already has a reservation for the event.
	checkURL := fmt.Sprintf("%s/attendee-events/%s/attendees/%s", baseURL, eventId, attendeeId)
	_, err := doRequest(ctx, client, http.MethodGet, checkURL, nil, nil, http.StatusOK, http.StatusNoContent)
	if err == nil {
		// 200 OK -> attendee already reserved
		return nil, nil, nil, fmt.Errorf("attendee %s already has a reservation for event %s", attendeeId, eventId)
	}

	// 2) Create ticket for the event
	createTicketURL := fmt.Sprintf("%s/events/%s/tickets", baseURL, eventId)
	var createdTicket domain.Ticket
	_, err = doRequest(ctx, client, http.MethodPost, createTicketURL, ticketReq, &createdTicket, http.StatusCreated, http.StatusOK)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("create ticket: %w", err)
	}

	// 3) Create attendee-event mapping
	attendeeEventCreateURL := fmt.Sprintf("%s/attendee-events", baseURL)
	attendeeEventBody := map[string]string{
		"event_id":    eventId,
		"attendee_id": attendeeId,
		"ticket_id":   createdTicket.Id,
	}
	_, err = doRequest(ctx, client, http.MethodPost, attendeeEventCreateURL, attendeeEventBody, nil, http.StatusCreated, http.StatusOK)
	if err != nil {
		// If mapping fails, we should consider a compensation (e.g., delete ticket).
		// For now, propagate error to caller for them to reconcile.
		return nil, &createdTicket, nil, fmt.Errorf("create attendee-event mapping: %w", err)
	}

	// 4) Fetch current event and update counters atomically via the events service.
	eventURL := fmt.Sprintf("%s/events/%s", baseURL, eventId)
	var ev domain.Event
	_, err = doRequest(ctx, client, http.MethodGet, eventURL, nil, &ev, http.StatusOK)
	if err != nil {
		return nil, &createdTicket, nil, fmt.Errorf("fetch event: %w", err)
	}

	// perform local availability check before requesting the update
	if ev.TicketsLeft <= 0 || ev.TicketSold >= ev.TicketMax {
		return nil, &createdTicket, &ev, fmt.Errorf("no tickets available for event %s", eventId)
	}

	updateEventBody := map[string]int{
		"tickets_left": ev.TicketsLeft - 1,
		"ticket_sold":  ev.TicketSold + 1,
	}
	var updatedEvent domain.Event
	_, err = doRequest(ctx, client, http.MethodPatch, eventURL, updateEventBody, &updatedEvent, http.StatusOK)
	if err != nil {
		// If decrement fails, consider compensation for createdTicket and mapping.
		return nil, &createdTicket, &ev, fmt.Errorf("update event counters: %w", err)
	}

	// 5) Update attendee status to confirmed (best effort; treat failure as error)
	attendeeURL := fmt.Sprintf("%s/attendees/%s", baseURL, attendeeId)
	attendeeUpdate := map[string]bool{"confirmed": true}
	var updatedAttendee domain.Attendee
	_, err = doRequest(ctx, client, http.MethodPatch, attendeeURL, attendeeUpdate, &updatedAttendee, http.StatusOK, http.StatusAccepted)
	if err != nil {
		// Return created ticket and event so caller can reconcile; updating attendee failed.
		return nil, &createdTicket, &updatedEvent, fmt.Errorf("update attendee: %w", err)
	}

	// 6) Send notification (non-fatal)
	notificationURL := fmt.Sprintf("%s/notifications", baseURL)
	notification := map[string]string{
		"attendee_id": attendeeId,
		"subject":     "Reservation confirmed",
		"body":        fmt.Sprintf("Your ticket for event %s has been reserved (ticket id: %s).", eventId, createdTicket.Id),
	}
	// ignore notification errors; log or surface in the future
	_, _ = doRequest(ctx, client, http.MethodPost, notificationURL, notification, nil, http.StatusCreated, http.StatusOK)

	// 7) Return the updated attendee, the ticket and the updated event
	return &updatedAttendee, &createdTicket, &updatedEvent, nil
}

// UpdateTicketInformation updates a ticket resource by calling PATCH /tickets/{ticketId}.
// updatedInfo is a map with the fields to update. Returns the updated Ticket.
func UpdateTicketInformation(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]interface{}) (*domain.Ticket, error) {
	client := newHTTPClient()
	ticketURL := fmt.Sprintf("%s/tickets/%s", baseURL, ticketId)

	var updatedTicket domain.Ticket
	_, err := doRequest(ctx, client, http.MethodPatch, ticketURL, updatedInfo, &updatedTicket, http.StatusOK, http.StatusAccepted)
	if err != nil {
		return nil, fmt.Errorf("update ticket: %w", err)
	}

	return &updatedTicket, nil
}
