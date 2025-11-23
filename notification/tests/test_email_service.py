import pytest
from unittest.mock import Mock, patch, AsyncMock

from app.services.email_service import EmailService


@pytest.fixture
def email_service():
    with patch('app.services.email_service.settings') as mock_settings:
        mock_settings.MAIL_USERNAME = "test@example.com"
        mock_settings.MAIL_PASSWORD = "password"
        mock_settings.MAIL_FROM = "test@example.com"
        mock_settings.MAIL_PORT = 587
        mock_settings.MAIL_SERVER = "smtp.gmail.com"
        mock_settings.MAIL_STARTTLS = True
        mock_settings.MAIL_SSL_TLS = False
        
        return EmailService()


class TestEmailService:
    """Test suite for EmailService"""

    @pytest.mark.asyncio
    async def test_send_email_success(self, email_service):
        """Test successful email sending"""
        with patch.object(email_service.fastmail, 'send_message', new_callable=AsyncMock) as mock_send:
            await email_service.send_email(
                recipient="recipient@example.com",
                subject="Test Subject",
                body="Test Body"
            )
            
            mock_send.assert_called_once()
            call_args = mock_send.call_args[0][0]
            assert call_args.subject == "Test Subject"
            assert any(r.email == "recipient@example.com" for r in call_args.recipients)

    @pytest.mark.asyncio
    async def test_send_email_failure(self, email_service):
        """Test email sending failure"""
        with patch.object(email_service.fastmail, 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.side_effect = Exception("SMTP Error")
            
            with pytest.raises(Exception) as exc_info:
                await email_service.send_email(
                    recipient="recipient@example.com",
                    subject="Test Subject",
                    body="Test Body"
                )
            
            assert "SMTP Error" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_send_email_html_format(self, email_service):
        """Test that email is sent as HTML"""
        with patch.object(email_service.fastmail, 'send_message', new_callable=AsyncMock) as mock_send:
            html_body = "<h1>Test</h1><p>HTML Email</p>"
            
            await email_service.send_email(
                recipient="recipient@example.com",
                subject="HTML Test",
                body=html_body
            )
            
            call_args = mock_send.call_args[0][0]
            assert call_args.body == html_body
