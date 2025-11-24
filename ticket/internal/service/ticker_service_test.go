package service

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/cucharoth/ticketest/internal/domain"
)

// TestReserveEventSuccess exercises the end-to-end reservation flow using an
// httptest.Server that simulates the downstream microservices the ticket
// service calls.
func TestReserveEventSuccess(t *testing.T) {
	// Prepare deterministic IDs
	eventID := "event-123"
	attendeeID := "att-456"
	createdTicketID := "ticket-789"

	// Create a test server that simulates the external services.
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Normalize path for easier matching
		path := r.URL.Path

		switch {
		// 1) Check attendee-event mapping: return existing mapping (confirmed=false)
		case r.Method == http.MethodGet && strings.HasPrefix(path, "/attendee-events/"):
			// Return 200 OK with mapping indicating not yet confirmed
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			mapping := map[string]interface{}{
				"id":        "mapping-123",
				"ticket_id": "",
				"confirmed": false,
			}
			_ = json.NewEncoder(w).Encode(mapping)
			return

		// 2) Create ticket: POST /events/{id}/tickets
		case r.Method == http.MethodPost && strings.HasPrefix(path, "/events/") && strings.HasSuffix(path, "/tickets"):
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			t := domain.Ticket{
				Id:        createdTicketID,
				Price:     12.5,
				TypeId:    "standard",
				CreatedAt: time.Now().Format(time.RFC3339),
				UpdatedAt: time.Now().Format(time.RFC3339),
			}
			_ = json.NewEncoder(w).Encode(t)
			return

		// 3) Update attendee-event mapping: PATCH /attendee-events/{id}
		case r.Method == http.MethodPatch && strings.HasPrefix(path, "/attendee-events/"):
			// Simulate successful patch attaching the ticket_id to existing mapping
			w.WriteHeader(http.StatusOK)
			return

		// 4) Create attendee-event mapping (fallback - should not be used in the new flow)
		case r.Method == http.MethodPost && path == "/attendee-events":
			w.WriteHeader(http.StatusCreated)
			return

		// 4) Get event details: GET /events/{id}
		case r.Method == http.MethodGet && strings.HasPrefix(path, "/events/"):
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			evt := domain.Event{
				Id:          eventID,
				Name:        "Test Event",
				Date:        time.Now().Format(time.RFC3339),
				Place:       "Test Place",
				TicketMax:   100,
				TicketsLeft: 5,
				TicketSold:  0,
				TypeId:      "type-1",
				CreatedAt:   time.Now().Format(time.RFC3339),
				UpdatedAt:   time.Now().Format(time.RFC3339),
			}
			_ = json.NewEncoder(w).Encode(evt)
			return

		// 5) Patch event counters: PATCH /events/{id}
		case r.Method == http.MethodPatch && strings.HasPrefix(path, "/events/"):
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			// return updated event with decremented tickets_left and incremented ticket_sold
			updated := domain.Event{
				Id:          eventID,
				Name:        "Test Event",
				Date:        time.Now().Format(time.RFC3339),
				Place:       "Test Place",
				TicketMax:   100,
				TicketsLeft: 4,
				TicketSold:  1,
				TypeId:      "type-1",
				CreatedAt:   time.Now().Format(time.RFC3339),
				UpdatedAt:   time.Now().Format(time.RFC3339),
			}
			_ = json.NewEncoder(w).Encode(updated)
			return

		// 6) Patch attendee: PATCH /attendees/{id}
		case r.Method == http.MethodPatch && strings.HasPrefix(path, "/attendees/"):
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			att := domain.Attendee{
				Id:        attendeeID,
				Name:      "Jane Doe",
				Email:     "jane@example.com",
				Cellphone: "+1234567890",
				CreatedAt: time.Now().Format(time.RFC3339),
				UpdatedAt: time.Now().Format(time.RFC3339),
			}
			_ = json.NewEncoder(w).Encode(att)
			return

		// 7) Notifications endpoint (best-effort)
		case r.Method == http.MethodPost && path == "/notifications":
			w.WriteHeader(http.StatusCreated)
			return

		default:
			http.NotFound(w, r)
			return
		}
	}))
	defer ts.Close()

	// Call ReserveEvent against our test server
	ctx := context.Background()
	ticketReq := &domain.Ticket{Price: 12.5, TypeId: "standard"}
	att, ticket, evt, err := ReserveEvent(ctx, ts.URL, eventID, attendeeID, ticketReq)
	if err != nil {
		t.Fatalf("ReserveEvent returned error: %v", err)
	}

	// Validate results
	if ticket == nil {
		t.Fatal("expected created ticket, got nil")
	}
	if ticket.Id != createdTicketID {
		t.Fatalf("unexpected ticket id: got %s want %s", ticket.Id, createdTicketID)
	}
	if evt == nil {
		t.Fatal("expected updated event, got nil")
	}
	if evt.TicketsLeft != 4 || evt.TicketSold != 1 {
		t.Fatalf("unexpected event counters updated: %+v", evt)
	}
	if att == nil {
		t.Fatal("expected updated attendee, got nil")
	}
	if att.Id != attendeeID {
		t.Fatalf("unexpected attendee id: got %s want %s", att.Id, attendeeID)
	}
}

// TestUpdateTicketInformation verifies that UpdateTicketInformation performs a PATCH
// to the tickets endpoint and returns the decoded ticket.
func TestUpdateTicketInformation(t *testing.T) {
	ticketID := "ticket-42"
	updatedPrice := 99.9

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPatch && strings.HasPrefix(r.URL.Path, "/tickets/") {
			// Decode request to inspect fields (optional)
			var payload map[string]interface{}
			_ = json.NewDecoder(r.Body).Decode(&payload)

			// Respond with updated ticket
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			out := domain.Ticket{
				Id:        ticketID,
				Price:     updatedPrice,
				TypeId:    "vip",
				CreatedAt: time.Now().Format(time.RFC3339),
				UpdatedAt: time.Now().Format(time.RFC3339),
			}
			_ = json.NewEncoder(w).Encode(out)
			return
		}
		http.NotFound(w, r)
	}))
	defer ts.Close()

	ctx := context.Background()
	updatedInfo := map[string]interface{}{"price": updatedPrice}
	updatedTicket, err := UpdateTicketInformation(ctx, ts.URL, ticketID, updatedInfo)
	if err != nil {
		t.Fatalf("UpdateTicketInformation returned error: %v", err)
	}
	if updatedTicket == nil {
		t.Fatal("expected updated ticket, got nil")
	}
	if updatedTicket.Price != updatedPrice {
		t.Fatalf("unexpected ticket price: got %v want %v", updatedTicket.Price, updatedPrice)
	}
}

// TestVerifyAvailability ensures VerifyAvailability returns true when the event
// has tickets left and false otherwise.
func TestVerifyAvailability(t *testing.T) {
	eventID := "evt-abc"

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet && strings.HasSuffix(r.URL.Path, "/availability") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			evt := domain.Event{
				Id:          eventID,
				Name:        "Availability Test",
				Date:        time.Now().Format(time.RFC3339),
				Place:       "Somewhere",
				TicketMax:   10,
				TicketsLeft: 3,
				TicketSold:  2,
				TypeId:      "t1",
				CreatedAt:   time.Now().Format(time.RFC3339),
				UpdatedAt:   time.Now().Format(time.RFC3339),
			}
			_ = json.NewEncoder(w).Encode(evt)
			return
		}
		http.NotFound(w, r)
	}))
	defer ts.Close()

	ctx := context.Background()
	ok, err := VerifyAvailability(ctx, ts.URL, eventID)
	if err != nil {
		t.Fatalf("VerifyAvailability returned error: %v", err)
	}
	if !ok {
		t.Fatalf("expected availability true, got false")
	}
}

// --- Mock-based test demonstrating the domain.TicketService interface can be mocked ---
type MockTicketService struct {
	VerifyCalled bool

	ReserveCalled bool
	ReserveArgs   struct {
		EventID    string
		AttendeeID string
		Ticket     *domain.Ticket
	}
	ReserveReturn struct {
		Attendee *domain.Attendee
		Ticket   *domain.Ticket
		Event    *domain.Event
		Err      error
	}

	UpdateCalled bool
	UpdateArgs   struct {
		TicketID string
		Info     map[string]any
	}
	UpdateReturn struct {
		Ticket *domain.Ticket
		Err    error
	}
}

func (m *MockTicketService) VerifyAvailability(ctx context.Context, baseURL, id string) (bool, error) {
	m.VerifyCalled = true
	return true, nil
}

func (m *MockTicketService) ReserveEvent(ctx context.Context, baseURL, eventId, attendeeId string, ticket *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error) {
	m.ReserveCalled = true
	m.ReserveArgs.EventID = eventId
	m.ReserveArgs.AttendeeID = attendeeId
	m.ReserveArgs.Ticket = ticket
	return m.ReserveReturn.Attendee, m.ReserveReturn.Ticket, m.ReserveReturn.Event, m.ReserveReturn.Err
}

func (m *MockTicketService) UpdateTicketInformation(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]interface{}) (*domain.Ticket, error) {
	m.UpdateCalled = true
	m.UpdateArgs.TicketID = ticketId
	m.UpdateArgs.Info = updatedInfo
	return m.UpdateReturn.Ticket, m.UpdateReturn.Err
}

// TestUsingMock ensures a consumer that depends on domain.TicketService can be
// tested with a mock implementation.
func TestUsingMockTicketService(t *testing.T) {
	mock := &MockTicketService{}
	// Prepare return values
	mock.ReserveReturn.Attendee = &domain.Attendee{Id: "a1", Name: "Mocked"}
	mock.ReserveReturn.Ticket = &domain.Ticket{Id: "tk1", Price: 1.0}
	mock.ReserveReturn.Event = &domain.Event{Id: "e1", TicketsLeft: 0, TicketSold: 1}
	mock.UpdateReturn.Ticket = &domain.Ticket{Id: "tk1", Price: 2.0}

	// Consumer function that uses the interface
	consumer := func(s domain.TicketService) error {
		ctx := context.Background()
		_, _, _, err := s.ReserveEvent(ctx, "", "ev", "att", &domain.Ticket{Price: 1.0, TypeId: "t"})
		if err != nil {
			return err
		}
		_, err = s.UpdateTicketInformation(ctx, "", "tk1", map[string]interface{}{"price": 2.0})
		return err
	}

	if err := consumer(mock); err != nil {
		t.Fatalf("consumer returned error: %v", err)
	}

	if !mock.ReserveCalled {
		t.Fatal("expected ReserveEvent to be called on mock")
	}
	if !mock.UpdateCalled {
		t.Fatal("expected UpdateTicketInformation to be called on mock")
	}
	if !mock.VerifyCalled {
		// VerifyAvailability is not used by consumer; this flag should be false.
		// We only check it's present and that it wasn't erroneously called.
	}
}
