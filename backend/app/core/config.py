import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FarmDirect AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "demo-secret-key-change-in-production-farmdirect-ai"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = "sqlite:///./farmdirect_demo.db"
    AI_PROVIDER: str = "baseline"
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

