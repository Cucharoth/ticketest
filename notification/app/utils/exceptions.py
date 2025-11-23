class AttendeeNotFoundException(Exception):
    def __init__(self, attendee_id: str):
        self.attendee_id = attendee_id
        self.message = f"Attendee with ID {attendee_id} not found"
        super().__init__(self.message)
