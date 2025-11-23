package transport

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/cucharoth/ticketest/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestNewRouter(t *testing.T) {
	// Setup
	t.Parallel()

	// Create a mock service
	mockService := new(domain.TicketService)
	baseURL := "http://localhost:8080"

	// Create router
	router := NewRouter(*mockService, baseURL)

	// Test health endpoint
	t.Run("Health endpoint", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// Test router construction and basic properties
	t.Run("Router construction", func(t *testing.T) {
		// Verify router was created and is the expected type
		assert.NotNil(t, router)
		assert.IsType(t, &gin.Engine{}, router)
	})
}
