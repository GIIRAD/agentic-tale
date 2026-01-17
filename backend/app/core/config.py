from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Azure OpenAI Chat
    AZURE_ENDPOINT: str
    AZURE_API_KEY: str
    API_VERSION: str = "2024-02-15-preview"
    DEPLOYMENT_NAME: str = "gpt-4o"

    # Azure OpenAI DALL-E
    AZURE_ENDPOINT_DALLE: str
    AZURE_API_KEY_DALLE: str
    DEPLOYMENT_DALLE3: str = "dall-e-3"

    # Langfuse
    LANGFUSE_PUBLIC_KEY: str
    LANGFUSE_SECRET_KEY: str
    LANGFUSE_BASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()