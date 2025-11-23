package handler

import (
	"net/http"
	"strings"

	"github.com/cucharoth/ticketest/internal/domain"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	Service domain.TicketService
	// BaseURL is forwarded to the service implementation when the interface
	// methods require a baseURL. Keep it empty to let the concrete service
	// implementation decide (some constructors may embed the baseURL already).
	BaseURL string
}

// New creates a new Handler.
func New(svc domain.TicketService, baseURL string) *Handler {
	return &Handler{
		Service: svc,
		BaseURL: baseURL,
	}
}

func (h *Handler) RegisterRoutes(r *gin.Engine) {
	// Events group
	events := r.Group("/events")
	{
		events.GET("/:id/availability", h.verifyAvailability)
		events.POST("/:id/tickets", h.reserveTicket)
	}

	// Tickets group
	tickets := r.Group("/tickets")
	{
		tickets.PATCH("/:id", h.updateTicket)
	}
}

// verifyAvailability handles GET /events/:id/availability
func (h *Handler) verifyAvailability(c *gin.Context) {
	eventID := c.Param("id")
	ctx := c.Request.Context()

	ok, err := h.Service.VerifyAvailability(ctx, h.BaseURL, eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"available": ok})
}

type reserveRequest struct {
	AttendeeID string         `json:"attendee_id" binding:"required"`
	Ticket     *domain.Ticket `json:"ticket" binding:"required"`
}

func (h *Handler) reserveTicket(c *gin.Context) {
	eventID := c.Param("id")
	var req reserveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body", "details": err.Error()})
		return
	}
	if req.Ticket == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ticket payload required"})
		return
	}

	ctx := c.Request.Context()
	attendee, ticket, updatedEvent, err := h.Service.ReserveEvent(ctx, h.BaseURL, eventID, req.AttendeeID, req.Ticket)
	if err != nil {
		// Try to infer meaningful HTTP status codes from common error messages.
		// Concrete service implementations can return richer error types; adapt as needed.
		switch {
		// conflict: attendee already has a reservation
		case containsIgnoreCase(err.Error(), "already has a reservation"):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		// no tickets available
		case containsIgnoreCase(err.Error(), "no tickets available"):
			c.JSON(http.StatusGone, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// On success return created ticket and updated event (and attendee if available)
	c.JSON(http.StatusCreated, gin.H{
		"attendee":      attendee,
		"ticket":        ticket,
		"updated_event": updatedEvent,
	})
}

// updateTicket handles PATCH /tickets/:id
// Accepts partial fields as JSON and returns the updated ticket.
func (h *Handler) updateTicket(c *gin.Context) {
	ticketID := c.Param("id")
	var updatedInfo map[string]interface{}
	if err := c.ShouldBindJSON(&updatedInfo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body", "details": err.Error()})
		return
	}

	ctx := c.Request.Context()
	updated, err := h.Service.UpdateTicketInformation(ctx, h.BaseURL, ticketID, updatedInfo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}

// containsIgnoreCase is a tiny helper to perform case-insensitive substring checks.
func containsIgnoreCase(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}
