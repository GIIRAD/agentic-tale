import json
from typing import Union
from openai import AzureOpenAI
from langfuse import Langfuse, observe
from app.core.config import settings

# Clients initialisieren
client = AzureOpenAI(
    azure_endpoint=settings.AZURE_ENDPOINT,
    api_key=settings.AZURE_API_KEY,
    api_version=settings.API_VERSION
)

client_dalle = AzureOpenAI(
    azure_endpoint=settings.AZURE_ENDPOINT_DALLE,
    api_key=settings.AZURE_API_KEY_DALLE,
    api_version="2024-02-01",
)

langfuse = Langfuse(
    public_key=settings.LANGFUSE_PUBLIC_KEY,
    secret_key=settings.LANGFUSE_SECRET_KEY,
    host=settings.LANGFUSE_BASE_URL,
)

@observe(as_type="generation")
def call_llm(system_prompt: str, user_prompt: str, temperature: float = 0.7, json_mode: bool = False) -> Union[str, dict]:
    try:
        kwargs = {
            "model": settings.DEPLOYMENT_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        # Langfuse Integration müsste hier via Decorator oder Callback erfolgen
        # Der Einfachheit halber hier der Standard-Call:
        response = client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content
        
        if json_mode:
            return json.loads(content)
        return content
    except Exception as e:
        print(f"LLM Error: {e}")
        return {} if json_mode else ""

@observe(as_type="generation")
def generate_image_url(prompt: str) -> str:
    try:
        result = client_dalle.images.generate(
            model=settings.DEPLOYMENT_DALLE3,
            prompt=prompt,
            n=1,
            size="1024x1024",
            style="vivid",
            quality="standard",
        )
        return result.data[0].url
    except Exception as e:
        print(f"DALL-E Error: {e}")
        return ""