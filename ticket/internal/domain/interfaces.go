package domain

import (
	"context"
	"errors"
)

// Predefined errors for common failure scenarios.
var (
	ErrNotFound = errors.New("resource not found")
	BadRequest  = errors.New("bad request")
)

// TicketService defines the behavior required to manage ticket reservations
// and updates. Creating an interface allows callers to depend on the
// contract and makes it easy to mock the service in tests.
type TicketService interface {
	// VerifyAvailability returns whether the event identified by `id` has
	// tickets available.
	VerifyAvailability(ctx context.Context, baseURL, id string) (bool, error)

	// ReserveEvent performs the reservation flow for an attendee on an event.
	// It returns the (possibly updated) attendee, the created ticket and the
	// updated event, or an error.
	ReserveEvent(ctx context.Context, baseURL, eventId, attendeeId string, ticket *Ticket) (*Attendee, *Ticket, *Event, error)

	// UpdateTicketInformation updates a ticket resource identified by ticketId
	// with the provided fields and returns the updated ticket.
	UpdateTicketInformation(ctx context.Context, baseURL, ticketId string, updatedInfo map[string]interface{}) (*Ticket, error)
}
