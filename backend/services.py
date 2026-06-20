import os
import httpx
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


async def generate_review_with_ai(
    business_name: str,
    business_type: str,
    keywords: List[str],
    custom_text: Optional[str] = "",
) -> str:
    """
    Generate a positive review using OpenRouter API

    Args:
        business_name: Name of the business
        business_type: Type/category of the business
        keywords: List of keywords to include in the review
        custom_text: Optional additional context from the customer

    Returns:
        Generated review text
    """

    if not OPENROUTER_API_KEY:
        # Use fallback if no API key configured
        return generate_fallback_review(business_name, business_type, keywords, custom_text)

    keywords_text = ", ".join(keywords) if keywords else "service quality"
    custom_section = f"\nAdditional Customer Notes: {custom_text}" if custom_text else ""

    system_prompt = """You are writing a genuine positive customer review. Follow these guidelines strictly:
- Write 2-3 sentences only.
- Natural and authentic tone.
- Friendly and human sounding.
- Avoid marketing language or exaggeration.
- Integrate the provided keywords naturally.
- Maximum 60 words.
- Output ONLY the review text, nothing else."""

    user_prompt = f"""Business Name: {business_name}
Business Type: {business_type}
Customer Keywords: {keywords_text}{custom_section}

Generate the review:"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://reviewgating.app",
                    "X-Title": "Review Gating Platform",
                },
                json={
                    "model": "mistralai/mistral-7b-instruct",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "max_tokens": 150,
                    "temperature": 0.7,
                },
                timeout=30.0,
            )

            response.raise_for_status()
            data = response.json()

            if "choices" in data and len(data["choices"]) > 0:
                review_text = data["choices"][0]["message"]["content"].strip()
                # Remove surrounding quotes if present
                if review_text.startswith('"') and review_text.endswith('"'):
                    review_text = review_text[1:-1]
                return review_text
            else:
                raise ValueError("Unexpected response format from OpenRouter API")

    except httpx.HTTPStatusError as e:
        print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        # Fall back to template generation
        return generate_fallback_review(business_name, business_type, keywords, custom_text)
    except Exception as e:
        print(f"Error generating review: {str(e)}")
        # Fall back to template generation
        return generate_fallback_review(business_name, business_type, keywords, custom_text)


def generate_fallback_review(
    business_name: str,
    business_type: str,
    keywords: List[str],
    custom_text: Optional[str] = "",
) -> str:
    """Generate a fallback review without API"""
    if len(keywords) >= 2:
        kw1, kw2 = keywords[0].lower(), keywords[1].lower()
        return (
            f"Had a wonderful experience at {business_name}. "
            f"Really appreciated the {kw1} and {kw2}. "
            f"Everything felt professional and welcoming, will definitely return!"
        )
    elif len(keywords) == 1:
        kw = keywords[0].lower()
        return (
            f"Loved my visit to {business_name}! "
            f"The {kw} really stood out. "
            f"Highly recommend this {business_type.lower()} to everyone."
        )
    else:
        return (
            f"Great experience at {business_name}! "
            f"The service was excellent and the atmosphere was welcoming. "
            f"Will definitely be coming back."
        )