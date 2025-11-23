package transport

import (
	"net/http"

	"github.com/cucharoth/ticketest/internal/domain"
	"github.com/cucharoth/ticketest/internal/handler"
	"github.com/gin-gonic/gin"
)

func NewRouter(svc domain.TicketService, baseURL string) *gin.Engine {
	// Create router with logger and recovery middleware
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	r.GET("/health", func(c *gin.Context) { c.Status(http.StatusOK) })

	// Create handler and register module routes
	h := handler.New(svc, baseURL)
	h.RegisterRoutes(r)

	return r
}
