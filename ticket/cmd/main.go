package main

import (
	"log"
	"os"

	"github.com/cucharoth/ticketest/internal/http/transport"
	"github.com/cucharoth/ticketest/internal/service"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env from project root if present. Ignore error so production
	// environments relying on real env vars are unaffected.
	_ = godotenv.Load()

	baseURL := os.Getenv("DOWNSTREAM_BASE_URL")

	// Create a concrete HTTP-backed ticket service. Passing nil uses the default client.
	svc := service.NewHTTPTicketService(nil)

	// Build the Gin router wired with the ticket handler/routes.
	router := transport.NewRouter(svc, baseURL)

	// Port configuration (optional environment override).
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port

	log.Printf("starting ticket service on %s (downstream=%s)", addr, baseURL)
	if err := router.Run(addr); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
