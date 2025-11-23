from pydantic import BaseModel
from typing import Literal

class SendNotificationRequest(BaseModel):
    attendee_id: str
    message: str
    type: Literal["Email", "SMS"]

class NotificationHistoryResponse(BaseModel):
    id: int
    attendee_id: str
    type: str
    status: str
    timestamp: str

