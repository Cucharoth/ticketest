from fastapi import APIRouter
from app.router.test_router import test_router
from app.router.notification_router import router as notification_router
from app.utils.logger import Logger

logger = Logger()
app_router = APIRouter()
app_router.prefix = "/api"

@app_router.get("/health")
def health() -> dict[str, str]:
   """
   Health check endpoint.
   ----------------------
   
   This endpoint returns a simple health check response to verify that the service is running.
      
   Returns:
      dict: The health status of the service.
   """
   logger.info("[AppRouter] Health check endpoint called")
   return {
      "Health": "OK"
   }

app_router.include_router(test_router)
app_router.include_router(notification_router)