t package transport

import (
    "context"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/cucharoth/ticketest/internal/domain"
    "github.com/stretchr/testify/assert"
)

// mockService implements domain.TicketService for integration-style tests
type mockService struct{}

func (m *mockService) VerifyAvailability(ctx context.Context, baseURL, id string) (bool, error) {
    // Always return available in this simple integration test
    return true, nil
}

func (m *mockService) ReserveEvent(ctx context.Context, baseURL, eventId, attendeeId string, ticket *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error) {
    // Minimal implementation to satisfy interface; not used by this test
    att := &domain.Attendee{Id: attendeeId}
    tk := &domain.Ticket{Id: "t-1"}
    ev := &domain.Event{Id: eventId}
    return att, tk, ev, nil
}

func (m *mockService) UpdateTicketInformation(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]interface{}) (*domain.Ticket, error) {
    return &domain.Ticket{Id: ticketId}, nil
}

func TestAvailabilityEndpointIntegration(t *testing.T) {
    t.Parallel()

    svc := &mockService{}
    router := NewRouter(svc, "")

    req := httptest.NewRequest(http.MethodGet, "/events/evt-1/availability", nil)
    w := httptest.NewRecorder()

    router.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)

    var body map[string]bool
    if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
        t.Fatalf("failed to decode response body: %v", err)
    }

    available, ok := body["available"]
    if !ok {
        t.Fatalf("response JSON missing 'available' field: %s", w.Body.String())
    }
    assert.True(t, available)
}
