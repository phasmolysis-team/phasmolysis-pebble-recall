from app.core.config import settings
from google import genai
from google.genai.types import GenerateContentResponse, ContentListUnionDict

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def ai_client(model='gemini-3-flash-preview', contents: ContentListUnionDict  ="") -> GenerateContentResponse:
    response = client.models.generate_content(model=model, contents=contents)
    return response



