import pytest
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timezone
import httpx

from app.services.notification_service import NotificationService
from app.dto.notification_dto import SendNotificationRequest
from app.utils.exceptions import AttendeeNotFoundException


@pytest.fixture
def notification_service():
    return NotificationService()


@pytest.fixture
def sample_request():
    return SendNotificationRequest(
        attendee_id="a1000000-0000-0000-0000-000000000001",
        message="Test notification message",
        type="30000000-0000-0000-0000-000000000001"  # Email UUID
    )


@pytest.fixture
def sample_attendee():
    return {
        "id": "a1000000-0000-0000-0000-000000000001",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "cellphone": "+1234567890"
    }


class TestNotificationService:
    """Test suite for NotificationService"""

    @pytest.mark.asyncio
    async def test_send_notification_success(self, notification_service, sample_request, sample_attendee):
        """Test successful notification sending"""
        with patch('app.services.notification_service.httpx.Client') as mock_client:
            # Mock attendee fetch
            mock_get_response = Mock()
            mock_get_response.status_code = 200
            mock_get_response.json.return_value = sample_attendee
            
            # Mock notification logging
            mock_post_response = Mock()
            mock_post_response.status_code = 201
            
            mock_context = Mock()
            mock_context.__enter__ = Mock(return_value=mock_context)
            mock_context.__exit__ = Mock(return_value=False)
            mock_context.get.return_value = mock_get_response
            mock_context.post.return_value = mock_post_response
            
            mock_client.return_value = mock_context
            
            # Mock email service
            with patch('app.services.notification_service.EmailService') as mock_email:
                mock_email_instance = AsyncMock()
                mock_email.return_value = mock_email_instance
                
                result = await notification_service.send_notification(sample_request)
                
                assert result["status"] == "sent"
                assert result["recipient_id"] == sample_request.attendee_id
                assert result["type"] == sample_request.type
                mock_email_instance.send_email.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_notification_attendee_not_found(self, notification_service, sample_request):
        """Test notification sending when attendee is not found"""
        with patch('app.services.notification_service.httpx.Client') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 404
            
            mock_context = Mock()
            mock_context.__enter__ = Mock(return_value=mock_context)
            mock_context.__exit__ = Mock(return_value=False)
            mock_context.get.return_value = mock_response
            
            mock_client.return_value = mock_context
            
            with pytest.raises(AttendeeNotFoundException) as exc_info:
                await notification_service.send_notification(sample_request)
            
            assert sample_request.attendee_id in str(exc_info.value)

    def test_get_attendee_success(self, notification_service, sample_attendee):
        """Test successful attendee retrieval"""
        with patch('app.services.notification_service.httpx.Client') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = sample_attendee
            
            mock_context = Mock()
            mock_context.__enter__ = Mock(return_value=mock_context)
            mock_context.__exit__ = Mock(return_value=False)
            mock_context.get.return_value = mock_response
            
            mock_client.return_value = mock_context
            
            result = notification_service._get_attendee(sample_attendee["id"])
            
            assert result == sample_attendee
            assert result["email"] == sample_attendee["email"]

    def test_get_attendee_not_found(self, notification_service):
        """Test attendee retrieval when attendee doesn't exist"""
        with patch('app.services.notification_service.httpx.Client') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 404
            
            mock_context = Mock()
            mock_context.__enter__ = Mock(return_value=mock_context)
            mock_context.__exit__ = Mock(return_value=False)
            mock_context.get.return_value = mock_response
            
            mock_client.return_value = mock_context
            
            with pytest.raises(AttendeeNotFoundException):
                notification_service._get_attendee("nonexistent-id")

    def test_get_history_success(self, notification_service):
        """Test successful notification history retrieval"""
        mock_history = [
            {
                "id": "n1",
                "attendee_id": "a1",
                "type": "Email",
                "status": "sent",
                "timestamp": "2025-11-23T00:00:00Z"
            }
        ]
        
        with patch('app.services.notification_service.httpx.Client') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_history
            
            mock_context = Mock()
            mock_context.__enter__ = Mock(return_value=mock_context)
            mock_context.__exit__ = Mock(return_value=False)
            mock_context.get.return_value = mock_response
            
            mock_client.return_value = mock_context
            
            result = notification_service.get_history()
            
            assert result == mock_history
            assert len(result) == 1

    def test_get_history_error(self, notification_service):
        """Test notification history retrieval when service is down"""
        with patch('app.services.notification_service.httpx.Client') as mock_client:
            mock_context = Mock()
            mock_context.__enter__ = Mock(side_effect=httpx.RequestError("Connection error"))
            mock_context.__exit__ = Mock(return_value=False)
            
            mock_client.return_value = mock_context
            
            result = notification_service.get_history()
            
            assert result == []

    @pytest.mark.asyncio
    async def test_send_message_email(self, notification_service):
        """Test email sending through _send_message"""
        with patch('app.services.notification_service.EmailService') as mock_email_class:
            mock_email_instance = Mock()
            mock_email_instance.send_email = AsyncMock()
            mock_email_class.return_value = mock_email_instance
            
            await notification_service._send_message(
                "30000000-0000-0000-0000-000000000001",  # Email UUID
                "a1000000-0000-0000-0000-000000000001",
                "Test message",
                "test@example.com"
            )
            
            mock_email_instance.send_email.assert_called_once_with(
                "test@example.com",
                "Notification from Ticketest",
                "Test message"
            )

    @pytest.mark.asyncio
    async def test_send_message_sms(self, notification_service):
        """Test SMS sending (mocked) through _send_message"""
        await notification_service._send_message(
            "SMS",
            "a1000000-0000-0000-0000-000000000001",
            "Test SMS message",
            None
        )
        # Should complete without error (mocked implementation)

    def test_log_notification_success(self, notification_service):
        """Test successful notification logging"""
        with patch('app.services.notification_service.httpx.Client') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 201
            
            mock_context = Mock()
            mock_context.__enter__ = Mock(return_value=mock_context)
            mock_context.__exit__ = Mock(return_value=False)
            mock_context.post.return_value = mock_response
            
            mock_client.return_value = mock_context
            
            # Should not raise any exception
            notification_service._log_notification(
                "a1000000-0000-0000-0000-000000000001",
                "Test message",
                "Email"
            )
