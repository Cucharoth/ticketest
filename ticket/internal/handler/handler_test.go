package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/cucharoth/ticketest/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

type mockService struct {
	VerifyAvailabilityFn      func(ctx context.Context, baseURL, id string) (bool, error)
	ReserveEventFn            func(ctx context.Context, baseURL, eventId, attendeeId string, ticket *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error)
	UpdateTicketInformationFn func(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]any) (*domain.Ticket, error)
}

func (m *mockService) VerifyAvailability(ctx context.Context, baseURL, id string) (bool, error) {
	if m.VerifyAvailabilityFn != nil {
		return m.VerifyAvailabilityFn(ctx, baseURL, id)
	}
	return false, nil
}

func (m *mockService) ReserveEvent(ctx context.Context, baseURL, eventId, attendeeId string, ticket *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error) {
	if m.ReserveEventFn != nil {
		return m.ReserveEventFn(ctx, baseURL, eventId, attendeeId, ticket)
	}
	return nil, nil, nil, nil
}

func (m *mockService) UpdateTicketInformation(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]interface{}) (*domain.Ticket, error) {
	if m.UpdateTicketInformationFn != nil {
		return m.UpdateTicketInformationFn(ctx, baseURL, ticketId, updatedInfo)
	}
	return nil, nil
}

func setupRouter(svc domain.TicketService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := New(svc, "http://example.com")
	h.RegisterRoutes(r)
	return r
}

func TestVerifyAvailability_Success(t *testing.T) {
	t.Parallel()

	ms := &mockService{
		VerifyAvailabilityFn: func(ctx context.Context, baseURL, id string) (bool, error) {
			assert.Equal(t, "http://example.com", baseURL)
			assert.Equal(t, "ev1", id)
			return true, nil
		},
	}

	router := setupRouter(ms)

	req := httptest.NewRequest(http.MethodGet, "/events/ev1/availability", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var body map[string]bool
	err := json.Unmarshal(w.Body.Bytes(), &body)
	assert.NoError(t, err)
	assert.Equal(t, true, body["available"])
}

func TestVerifyAvailability_ErrorFromService(t *testing.T) {
	t.Parallel()

	ms := &mockService{
		VerifyAvailabilityFn: func(ctx context.Context, baseURL, id string) (bool, error) {
			return false, errors.New("service failure")
		},
	}

	router := setupRouter(ms)

	req := httptest.NewRequest(http.MethodGet, "/events/ev1/availability", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var body map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &body)
	assert.NoError(t, err)
	assert.Contains(t, body["error"], "service failure")
}

func TestReserveTicket_InvalidJSON(t *testing.T) {
	t.Parallel()

	ms := &mockService{}
	router := setupRouter(ms)

	req := httptest.NewRequest(http.MethodPost, "/events/ev1/tickets", bytes.NewBufferString("not json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var body map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &body)
	assert.NoError(t, err)
	assert.Contains(t, body["error"], "invalid request body")
}

func TestReserveTicket_MissingTicketPayload(t *testing.T) {
	t.Parallel()

	ms := &mockService{}
	router := setupRouter(ms)

	payload := map[string]string{"attendee_id": "att-1"}
	b, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/events/ev1/tickets", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var body map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &body)
	assert.NoError(t, err)
	// The request binding fails because `ticket` is required in the JSON schema,
	// so the handler responds with the generic invalid request body error.
	assert.Equal(t, "invalid request body", body["error"])
}

func TestReserveTicket_ConflictAndGoneErrors(t *testing.T) {
	t.Parallel()

	// Conflict case
	msConflict := &mockService{
		ReserveEventFn: func(ctx context.Context, baseURL, eventId, attendeeId string, ticket *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error) {
			return nil, nil, nil, errors.New("attendee already has a reservation")
		},
	}
	routerConflict := setupRouter(msConflict)
	payload := map[string]interface{}{
		"attendee_id": "att-1",
		"ticket": map[string]interface{}{
			"price":   10.0,
			"type_id": "type-1",
		},
	}
	b, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/events/ev1/tickets", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	routerConflict.ServeHTTP(w, req)

	assert.Equal(t, http.StatusConflict, w.Code)
	var body map[string]string
	_ = json.Unmarshal(w.Body.Bytes(), &body)
	assert.Contains(t, body["error"], "already has a reservation")

	// Gone case
	msGone := &mockService{
		ReserveEventFn: func(ctx context.Context, baseURL, eventId, attendeeId string, ticket *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error) {
			return nil, nil, nil, errors.New("no tickets available for this event")
		},
	}
	routerGone := setupRouter(msGone)
	req2 := httptest.NewRequest(http.MethodPost, "/events/ev1/tickets", bytes.NewBuffer(b))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	routerGone.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusGone, w2.Code)
	_ = json.Unmarshal(w2.Body.Bytes(), &body)
	assert.Contains(t, body["error"], "no tickets available")
}

func TestReserveTicket_Success(t *testing.T) {
	t.Parallel()

	expectedAttendee := &domain.Attendee{Id: "a1", Name: "John", Email: "j@example.com"}
	expectedTicket := &domain.Ticket{Id: "t1", Price: 12.5, TypeId: "type-1"}
	expectedEvent := &domain.Event{Id: "e1", Name: "Concert"}

	ms := &mockService{
		ReserveEventFn: func(ctx context.Context, baseURL, eventId, attendeeId string, ticket *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error) {
			assert.Equal(t, "ev1", eventId)
			assert.Equal(t, "att-1", attendeeId)
			// Basic sanity on incoming ticket
			if ticket == nil {
				return nil, nil, nil, errors.New("ticket missing")
			}
			return expectedAttendee, expectedTicket, expectedEvent, nil
		},
	}

	router := setupRouter(ms)

	payload := map[string]interface{}{
		"attendee_id": "att-1",
		"ticket": map[string]interface{}{
			"price":   12.5,
			"type_id": "type-1",
		},
	}
	b, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/events/ev1/tickets", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var body map[string]json.RawMessage
	err := json.Unmarshal(w.Body.Bytes(), &body)
	assert.NoError(t, err)

	var gotAtt domain.Attendee
	var gotTick domain.Ticket
	var gotEvent domain.Event

	err = json.Unmarshal(body["attendee"], &gotAtt)
	assert.NoError(t, err)
	err = json.Unmarshal(body["ticket"], &gotTick)
	assert.NoError(t, err)
	err = json.Unmarshal(body["updated_event"], &gotEvent)
	assert.NoError(t, err)

	assert.Equal(t, expectedAttendee.Id, gotAtt.Id)
	assert.Equal(t, expectedTicket.Id, gotTick.Id)
	assert.Equal(t, expectedEvent.Id, gotEvent.Id)
}

func TestUpdateTicket_InvalidJSON(t *testing.T) {
	t.Parallel()

	ms := &mockService{}
	router := setupRouter(ms)

	req := httptest.NewRequest(http.MethodPatch, "/tickets/t1", bytes.NewBufferString("invalid"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var body map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &body)
	assert.Contains(t, body["error"], "invalid request body")
}

func TestUpdateTicket_ServiceError(t *testing.T) {
	t.Parallel()

	ms := &mockService{
		UpdateTicketInformationFn: func(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]interface{}) (*domain.Ticket, error) {
			return nil, errors.New("update failed")
		},
	}
	router := setupRouter(ms)

	reqBody := map[string]interface{}{"price": 20.0}
	b, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPatch, "/tickets/t1", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var body map[string]string
	_ = json.Unmarshal(w.Body.Bytes(), &body)
	assert.Contains(t, body["error"], "update failed")
}

func TestUpdateTicket_Success(t *testing.T) {
	t.Parallel()

	expected := &domain.Ticket{Id: "t1", Price: 20.0, TypeId: "type-2"}

	ms := &mockService{
		UpdateTicketInformationFn: func(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]interface{}) (*domain.Ticket, error) {
			assert.Equal(t, "t1", ticketId)
			// Echo back a ticket merging provided fields (simplified)
			return expected, nil
		},
	}

	router := setupRouter(ms)

	reqBody := map[string]interface{}{"price": 20.0}
	b, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPatch, "/tickets/t1", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var got domain.Ticket
	err := json.Unmarshal(w.Body.Bytes(), &got)
	assert.NoError(t, err)
	assert.Equal(t, expected.Id, got.Id)
	assert.Equal(t, expected.Price, got.Price)
	assert.Equal(t, expected.TypeId, got.TypeId)
}
