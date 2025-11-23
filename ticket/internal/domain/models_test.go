package domain_test

import (
	"testing"

	"github.com/cucharoth/ticketest/internal/domain"
	"github.com/stretchr/testify/assert"
)

func TestNewTicket(t *testing.T) {
	t.Parallel()

	tk := domain.NewTicket("id-123", 15.75, "type-1", "2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z")

	assert.NotNil(t, tk)
	assert.Equal(t, "id-123", tk.Id)
	assert.Equal(t, 15.75, tk.Price)
	assert.Equal(t, "type-1", tk.TypeId)
	assert.Equal(t, "2025-01-01T00:00:00Z", tk.CreatedAt)
	assert.Equal(t, "2025-01-01T00:00:00Z", tk.UpdatedAt)
}

func TestTicket_IsValid(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		tk   *domain.Ticket
		want bool
	}{
		{"valid ticket", &domain.Ticket{Price: 10.0, TypeId: "type-1"}, true},
		{"zero price is valid", &domain.Ticket{Price: 0.0, TypeId: "type-1"}, true},
		{"negative price invalid", &domain.Ticket{Price: -1.0, TypeId: "type-1"}, false},
		{"empty type id invalid", &domain.Ticket{Price: 5.0, TypeId: ""}, false},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.tk.IsValid())
		})
	}
}
