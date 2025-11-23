from app.dto.notification_dto import SendNotificationRequest
from app.utils.logger import Logger

logger = Logger()

class NotificationService:
    def send_notification(self, request: SendNotificationRequest) -> dict:
        # Mock fetching assistant info (FR-NOT-002)
        # In a real scenario, this would call the DB Module: GET /assistants/{id}
        logger.info(f"[NotificationService] Fetching contact info for assistant_id={request.assistant_id}")
        
        # Mock sending logic (FR-NOT-001)
        logger.info(f"[NotificationService] Sending {request.type} to assistant_id={request.assistant_id}: {request.message}")
        
        # Mock logging to DB (FR-NOT-003)
        # In a real scenario, this would call the DB Module: POST /notifications
        logger.info(f"[NotificationService] Logging notification to history for assistant_id={request.assistant_id}")
        
        return {
            "status": "sent",
            "recipient_id": request.assistant_id,
            "type": request.type
        }

    def get_history(self) -> list[dict]:
        # Mock fetching history from DB (FR-NOT-004)
        # In a real scenario, this would call the DB Module: GET /notifications
        logger.info("[NotificationService] Fetching notification history")
        
        return [
            {
                "id": 1,
                "assistant_id": 101,
                "type": "email",
                "status": "sent",
                "timestamp": "2023-10-27T10:00:00Z"
            },
            {
                "id": 2,
                "assistant_id": 102,
                "type": "sms",
                "status": "sent",
                "timestamp": "2023-10-27T10:05:00Z"
            }
        ]

