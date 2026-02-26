from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # API Keys
    ANTHROPIC_API_KEY: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Claude API
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    CLAUDE_MAX_TOKENS: int = 4096

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
