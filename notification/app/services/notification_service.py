import httpx
from app.dto.notification_dto import SendNotificationRequest
from app.utils.logger import Logger
from app.config import settings
from app.utils.exceptions import AttendeeNotFoundException
from app.services.email_service import EmailService

logger = Logger()
DB_SERVICE_URL = settings.DB_SERVICE_URL

class NotificationService:
    async def send_notification(self, request: SendNotificationRequest) -> dict:
        attendee = self._get_attendee(request.attendee_id)
        
        email = attendee.get('email') if attendee else None
        await self._send_message(request.type, request.attendee_id, request.message, email)
        self._log_notification(request.attendee_id, request.message, request.type)
        
        return {
            "status": "sent",
            "recipient_id": request.attendee_id,
            "type": request.type
        }

    def get_history(self) -> list[dict]:
        logger.info("[NotificationService] Fetching notification history")
        try:
            with httpx.Client() as client:
                response = client.get(f"{DB_SERVICE_URL}/notifications")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"[NotificationService] Error fetching history: {str(e)}")
            return []

    def _get_attendee(self, attendee_id: str) -> dict:
        logger.info(f"[NotificationService] Fetching contact info for attendee_id={attendee_id}")
        try:
            with httpx.Client() as client:
                response = client.get(f"{DB_SERVICE_URL}/attendees/{attendee_id}")
                if response.status_code == 404:
                    logger.error(f"[NotificationService] Attendee {attendee_id} not found")
                    raise AttendeeNotFoundException(attendee_id)
                response.raise_for_status()
                attendee = response.json()
                logger.info(f"[NotificationService] Found attendee: {attendee.get('email')}")
                return attendee
        except httpx.RequestError as e:
             logger.error(f"[NotificationService] Network error fetching attendee: {str(e)}")
             raise e
        except AttendeeNotFoundException:
            raise
        except Exception as e:
             logger.error(f"[NotificationService] Unexpected error fetching attendee: {str(e)}")
             raise e

    async def _send_message(self, type: str, attendee_id: str, message: str, recipient_email: str = None):
        if type == "email" and recipient_email:
             email_service = EmailService()
             await email_service.send_email(recipient_email, "Notification from Ticketest", message)
        else:
            # Mock sending logic for other types (FR-NOT-001)
            logger.info(f"[NotificationService] Sending {type} to attendee_id={attendee_id}: {message}")

    def _log_notification(self, attendee_id: str, message: str, type: str):
        logger.info(f"[NotificationService] Logging notification to history for attendee_id={attendee_id}")
        try:
            with httpx.Client() as client:
                notification_data = {
                    "attendeeId": attendee_id,
                    "message": message,
                    "type": type
                }
                response = client.post(f"{DB_SERVICE_URL}/notifications", json=notification_data)
                response.raise_for_status()
                logger.info("[NotificationService] Notification logged successfully")
        except Exception as e:
            logger.error(f"[NotificationService] Error logging notification: {str(e)}")


