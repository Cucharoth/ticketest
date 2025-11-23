from pydantic import BaseModel
from typing import Literal

class SendNotificationRequest(BaseModel):
    attendee_id: str
    message: str

    ## 30000000-0000-0000-0000-000000000001 email
    ## 30000000-0000-0000-0000-000000000002 sms
    type: Literal["30000000-0000-0000-0000-000000000001", "30000000-0000-0000-0000-000000000002"] ## email and sms

class NotificationHistoryResponse(BaseModel):
    id: int
    attendee_id: str
    type: str
    status: str
    timestamp: str

