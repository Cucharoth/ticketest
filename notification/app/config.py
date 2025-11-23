import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DB_SERVICE_URL = os.getenv("DB_SERVICE_URL", "http://localhost:3000")

settings = Settings()
