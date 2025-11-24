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

	// 1) Check if attendee-event mapping exists and inspect confirmed flag.
	checkURL := fmt.Sprintf("%s/attendee-events/%s/attendees/%s", baseURL, eventId, attendeeId)

	// mapping will contain the existing attendee-event mapping when present.
	var mapping map[string]interface{}
	_, err := doRequest(ctx, client, http.MethodGet, checkURL, nil, &mapping, http.StatusOK)
	if err != nil {
		// If mapping not found, instruct caller to register attendee to the event first.
		if errors.Is(err, domain.ErrNotFound) {
			return nil, nil, nil, fmt.Errorf("attendee-event mapping not found for attendee %s and event %s; attendee must be registered to the event first", attendeeId, eventId)
		}
		return nil, nil, nil, fmt.Errorf("check attendee-event mapping: %w", err)
	}

	// When mapping is present, inspect the confirmed flag.
	// Default to false when the field is missing or not a boolean.
	if v, ok := mapping["confirmed"]; ok {
		if confirmed, ok := v.(bool); ok && confirmed {
			return nil, nil, nil, fmt.Errorf("attendee %s already confirmed for event %s", attendeeId, eventId)
		}
	}

	// extract mapping ID to allow updating the existing mapping
	var mappingID string
	if idv, ok := mapping["id"].(string); ok {
		mappingID = idv
	} else if idv, ok := mapping["id"].(float64); ok {
		// JSON numbers may decode as float64; convert to integer-like string if present.
		mappingID = fmt.Sprintf("%.0f", idv)
	} else {
		mappingID = ""
	}

	// 2) Create ticket for the event
	createTicketURL := fmt.Sprintf("%s/events/%s/tickets", baseURL, eventId)
	var createdTicket domain.Ticket
	_, err = doRequest(ctx, client, http.MethodPost, createTicketURL, ticketReq, &createdTicket, http.StatusCreated, http.StatusOK)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("create ticket: %w", err)
	}

	// 3) Update existing attendee-event mapping to attach the created ticket.
	if mappingID == "" {
		// Without a mapping ID we cannot patch the existing record; return an error
		// and provide the created ticket so the caller can reconcile/compensate.
		return nil, &createdTicket, nil, fmt.Errorf("attendee-event mapping id not present for attendee %s and event %s", attendeeId, eventId)
	}

	attendeeEventPatchURL := fmt.Sprintf("%s/attendee-events/%s", baseURL, mappingID)
	attendeeEventBody := map[string]string{
		"ticket_id": createdTicket.Id,
	}
	_, err = doRequest(ctx, client, http.MethodPatch, attendeeEventPatchURL, attendeeEventBody, nil, http.StatusOK, http.StatusAccepted)
	if err != nil {
		// If mapping update fails, consider compensation for created ticket.
		return nil, &createdTicket, nil, fmt.Errorf("update attendee-event mapping: %w", err)
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
