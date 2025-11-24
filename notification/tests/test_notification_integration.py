import pytest
import httpx
import os
from fastapi.testclient import TestClient
from app.main import app

# Get DB_SERVICE_URL from environment or use default
DB_SERVICE_URL = os.getenv("DB_SERVICE_URL", "http://localhost:3000")

client = TestClient(app)


@pytest.fixture(scope="module")
def test_attendee():
    """Create a test attendee in the Database Module for integration tests."""
    attendee_data = {
        "name": "Integration Test User",
        "email": f"integration-{os.getpid()}@test.com",
        "cellphone": "1234567890"
    }
    
    with httpx.Client() as http_client:
        response = http_client.post(f"{DB_SERVICE_URL}/attendees", json=attendee_data)
        response.raise_for_status()
        attendee = response.json()
    
    yield attendee
    
    # Cleanup is optional since we're using a test database


@pytest.fixture(scope="module")
def notification_type():
    """Get or create a notification type for testing."""
    # Email notification type UUID (should exist in DB)
    return "30000000-0000-0000-0000-000000000001"


class TestNotificationIntegration:
    """Integration tests for Notification Module (NOT-INT-01, NOT-INT-02, NOT-INT-03)."""
    
    def test_send_notification_happy_path(self, test_attendee, notification_type):
        """
        NOT-INT-01: Send notification (Happy Path)
        -> Get email (GET /attendees/{id})
        -> Simulate send
        -> Register history (POST /notifications)
        """
        request_data = {
            "attendee_id": test_attendee["id"],
            "message": "Integration test notification",
            "type": notification_type
        }
        
        response = client.post("/api/notifications/send", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "sent"
        assert data["recipient_id"] == test_attendee["id"]
        assert data["type"] == notification_type
        
        # Verify notification was logged in history
        history_response = client.get("/api/notifications/history")
        assert history_response.status_code == 200
        history = history_response.json()
        assert isinstance(history, list)
        
        # Find our notification in history
        found = any(
            n.get("attendeeId") == test_attendee["id"] and
            n.get("message") == "Integration test notification"
            for n in history
        )
        assert found, "Notification should be logged in history"
    
    def test_send_notification_non_existing_attendee(self, notification_type):
        """
        NOT-INT-02: Send to non-existing assistant
        -> Handle 404 from DB
        -> Return "Recipient not found"
        """
        fake_attendee_id = "00000000-0000-0000-0000-000000000000"
        request_data = {
            "attendee_id": fake_attendee_id,
            "message": "Test message",
            "type": notification_type
        }
        
        response = client.post("/api/notifications/send", json=request_data)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_get_notification_history(self, test_attendee, notification_type):
        """
        NOT-INT-03: Consult history
        -> Call DB (GET /notifications)
        """
        # First, send a notification to ensure there's data
        request_data = {
            "attendee_id": test_attendee["id"],
            "message": "History test notification",
            "type": notification_type
        }
        client.post("/api/notifications/send", json=request_data)
        
        # Now get history
        response = client.get("/api/notifications/history")
        
        assert response.status_code == 200
        history = response.json()
        assert isinstance(history, list)
        assert len(history) > 0
        
        # Verify structure of history items
        for item in history:
            assert "id" in item
            assert "attendeeId" in item
            assert "message" in item
            assert "sendDate" in item
            assert "type" in item
