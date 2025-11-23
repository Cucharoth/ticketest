package service

import (
	"context"
	"net/http"

	"github.com/cucharoth/ticketest/internal/domain"
)

// HTTPTicketService implements domain.TicketService by delegating to the
// package-level helper functions. It is intentionally minimal; a custom
// HTTP client can be added later if needed.
type HTTPTicketService struct {
	// Client is kept for future extensions but is currently unused.
	Client *http.Client
}

// Ensure at compile time that HTTPTicketService implements domain.TicketService.
var _ domain.TicketService = (*HTTPTicketService)(nil)

// NewHTTPTicketService constructs an HTTPTicketService. The provided client is
// stored but not strictly required by the current implementation.
func NewHTTPTicketService(client *http.Client) *HTTPTicketService {
	return &HTTPTicketService{Client: client}
}

// VerifyAvailability delegates to the package-level VerifyAvailability.
func (s *HTTPTicketService) VerifyAvailability(ctx context.Context, baseURL, id string) (bool, error) {
	return VerifyAvailability(ctx, baseURL, id)
}

// ReserveEvent delegates to the package-level ReserveEvent.
func (s *HTTPTicketService) ReserveEvent(ctx context.Context, baseURL, eventId, attendeeId string, ticket *domain.Ticket) (*domain.Attendee, *domain.Ticket, *domain.Event, error) {
	return ReserveEvent(ctx, baseURL, eventId, attendeeId, ticket)
}

// UpdateTicketInformation delegates to the package-level UpdateTicketInformation.
func (s *HTTPTicketService) UpdateTicketInformation(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]interface{}) (*domain.Ticket, error) {
	return UpdateTicketInformation(ctx, baseURL, ticketId, updatedInfo)
}
