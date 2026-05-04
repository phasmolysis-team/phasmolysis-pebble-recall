from pydantic import Field, BaseModel
from typing import Annotated
from pydantic_settings import BaseSettings, SettingsConfigDict


class AuthConfig(BaseModel):
    JWT_SECRET: Annotated[str, Field()] = ""
    COOKIE_SECRET: Annotated[str, Field()] = ""


class Settings(BaseSettings):
    AUTH: Annotated[AuthConfig, Field()] = AuthConfig()
    PG_URL: Annotated[str, Field()] = ""
    DOMAINS: Annotated[set[str], Field()] = set()
    API_ROOT: Annotated[str, Field()] = "/api"
    PORT: Annotated[int, Field()] = 8080
    HOST: Annotated[str, Field()] = "localhost"

    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", env_nested_delimiter="__"
    )


settings = Settings()
