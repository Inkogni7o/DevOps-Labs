from functools import lru_cache

from pydantic import AnyUrl, Field, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Store Lab API"
    app_version: str = "0.1.0"
    environment: str = "local"
    database_url: PostgresDsn
    redis_url: RedisDsn
    jwt_secret: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    s3_endpoint: AnyUrl
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    seed_admin_email: str = "admin@example.com"
    seed_admin_password: str = Field(default="admin-password-change-me", min_length=8)
    seed_admin_full_name: str = "Store Admin"


@lru_cache
def get_settings() -> Settings:
    return Settings()
