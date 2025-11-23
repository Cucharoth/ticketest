from fastapi import APIRouter, HTTPException
from app.dto.notification_dto import SendNotificationRequest
from app.services.notification_service import NotificationService
from app.utils.logger import Logger

router = APIRouter()
notification_service = NotificationService()
logger = Logger()

@router.post("/notifications/send", status_code=200)
def send_notification(request: SendNotificationRequest):
    """
    Send a notification to an assistant.
    """
    try:
        logger.info(f"[NotificationRouter] Received send request for assistant_id={request.assistant_id}")
        result = notification_service.send_notification(request)
        return result
    except Exception as e:
        logger.error(f"[NotificationRouter] Error sending notification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notifications/history", status_code=200)
def get_history():
    """
    Get the notification history.
    """
    try:
        logger.info("[NotificationRouter] Received history request")
        result = notification_service.get_history()
        return result
    except Exception as e:
        logger.error(f"[NotificationRouter] Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

