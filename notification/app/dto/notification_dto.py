from pydantic import BaseModel
from typing import Literal

class SendNotificationRequest(BaseModel):
    assistant_id: int
    message: str
    type: Literal["email", "sms"]

class NotificationHistoryResponse(BaseModel):
    id: int
    assistant_id: int
    type: str
    status: str
    timestamp: str

