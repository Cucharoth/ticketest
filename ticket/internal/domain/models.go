package domain

type Event struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Date        string `json:"date"`
	Place       string `json:"place"`
	TicketMax   int    `json:"ticket_max"`
	TicketsLeft int    `json:"tickets_left"`
	TicketSold  int    `json:"ticket_sold"`
	TypeId      string `json:"type_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type Ticket struct {
	Id        string  `json:"id"`
	Price     float64 `json:"price"`
	TypeId    string  `json:"type_id"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

type TicketType struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type Attendee struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Cellphone string `json:"cellphone"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type AttendeeEvent struct {
	AttendeeId string `json:"attendee_id"`
	EventId    string `json:"event_id"`
	Confirmed  bool   `json:"confirmed"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

func NewTicket(id string, price float64, typeId string, createdAt string, updatedAt string) *Ticket {
	return &Ticket{
		Id:        id,
		Price:     price,
		TypeId:    typeId,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func (t *Ticket) IsValid() bool {
	if t.Price < 0 {
		return false
	}
	if t.TypeId == "" {
		return false
	}
	return true
}
