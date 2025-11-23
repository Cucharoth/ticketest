# ---- Build stage ----
FROM golang:1.25.4 AS builder

# Optional: set a module cache to speed up repeated builds
ENV CGO_ENABLED=0 \
  GOFLAGS="-mod=mod"

WORKDIR /app

# Copy go.mod/go.sum first to leverage Docker layer caching when dependencies don't change
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the binary. Adjust -o and package path as needed.
# Use -ldflags to strip debug info and -trimpath to make builds more reproducible.
RUN GOOS=linux GOARCH=amd64 \
  go build -trimpath -ldflags="-s -w" -o /ticket-service ./cmd

# ---- Final stage ----
FROM alpine:3.18

# Install CA certs for outbound HTTPS requests
RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy binary from builder
COPY --from=builder /ticket-service /app/ticket-service

# Use a non-root user where possible
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose default port (can be overridden with PORT env at runtime)
EXPOSE 8080

# Entry point
ENTRYPOINT ["/app/ticket-service"]
