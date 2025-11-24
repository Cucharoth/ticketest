import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestNotificationSmoke:
    """
    Smoke tests for Notification Module.
    Verifies basic connectivity and that the service is reachable.
    """
    
    def test_humo_03_get_notifications_history(self):
        """
        HUMO-03 (NOT -> DB): GET /notifications/history -> 200 OK
        Verifies connectivity between Notification Module and Database Module
        """
        response = client.get("/api/notifications/history")
        
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_health_check_module_responsive(self):
        """
        Basic health check - verify module is responsive
        """
        response = client.get("/api/notifications/history")
        
        assert response.status_code == 200
