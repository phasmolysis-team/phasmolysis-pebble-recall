from pydantic import Field, BaseModel, BeforeValidator
from typing import Annotated
from pydantic_settings import BaseSettings, SettingsConfigDict

def split_csv(v) -> list[str]:
    if isinstance(v, str):
        return [i.strip() for i in v.split(",")]
    return v

class AuthConfig(BaseModel):
    JWT_SECRET: Annotated[str, Field()] = ""
    COOKIE_SECRET: Annotated[str, Field()] = ""


class Settings(BaseSettings):
    AUTH: Annotated[AuthConfig, BeforeValidator(split_csv)] = AuthConfig()
    PG_URL: Annotated[str, Field()] = ""
    ORIGINS: Annotated[set[str], Field()] = set()
    API_ROOT: Annotated[str, Field()] = "/api"
    PORT: Annotated[int, Field()] = 8080
    HOST: Annotated[str, Field()] = "localhost"

    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", env_nested_delimiter="__"
    )


settings = Settings()
