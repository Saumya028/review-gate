import os
import json
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
) -> List[str]:
    """
    Generate multiple positive review variations using OpenRouter API

    Args:
        business_name: Name of the business
        business_type: Type/category of the business
        keywords: List of keywords to include in the review
        custom_text: Optional additional context from the customer

    Returns:
        List of generated review text variations (3-5 options)
    """

    if not OPENROUTER_API_KEY:
        # Use fallback if no API key configured
        return generate_fallback_review(business_name, business_type, keywords, custom_text)

    keywords_text = ", ".join(keywords) if keywords else "service quality"
    custom_section = f"\nAdditional Customer Notes: {custom_text}" if custom_text else ""

    system_prompt = """You are writing genuine positive customer reviews. You must return EXACTLY a JSON array of 5 different review variations. Follow these guidelines strictly:

VARIATION STYLES:
1. "Short & Punchy" — 1-2 sentences, max 30 words. Casual and concise.
2. "Detailed" — 3-4 sentences, descriptive and thorough. ~60 words.
3. "Casual & Friendly" — 2-3 sentences, warm conversational tone with personality.
4. "Professional" — 2-3 sentences, polished and refined business-appropriate tone.
5. "Enthusiastic" — 2-3 sentences, energetic and emotional with genuine excitement.

RULES FOR ALL VARIATIONS:
- Natural and authentic tone — no marketing language or exaggeration.
- Integrate the provided keywords naturally.
- Each variation must be unique — different sentence structures and word choices.
- Output ONLY a valid JSON array of 5 strings, nothing else. No markdown, no labels.

EXAMPLE OUTPUT FORMAT:
["Review 1 text here.", "Review 2 text here.", "Review 3 text here.", "Review 4 text here.", "Review 5 text here."]"""

    user_prompt = f"""Business Name: {business_name}
Business Type: {business_type}
Customer Keywords: {keywords_text}{custom_section}

Generate the 5 review variations as a JSON array:"""

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
                    "max_tokens": 600,
                    "temperature": 0.8,
                },
                timeout=30.0,
            )

            response.raise_for_status()
            data = response.json()

            if "choices" in data and len(data["choices"]) > 0:
                raw_text = data["choices"][0]["message"]["content"].strip()
                return parse_review_variations(raw_text, business_name, business_type, keywords, custom_text)
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


def parse_review_variations(
    raw_text: str,
    business_name: str,
    business_type: str,
    keywords: List[str],
    custom_text: Optional[str] = "",
) -> List[str]:
    """
    Robustly parse AI response into a list of review strings.
    Falls back to wrapping single reviews or using templates if JSON parsing fails.
    """
    # Try direct JSON parse first
    try:
        parsed = json.loads(raw_text)
        if isinstance(parsed, list) and len(parsed) >= 2:
            # Filter out any non-string entries and clean quotes
            reviews = []
            for item in parsed:
                if isinstance(item, str) and item.strip():
                    text = item.strip()
                    if text.startswith('"') and text.endswith('"'):
                        text = text[1:-1]
                    reviews.append(text)
            if len(reviews) >= 2:
                return reviews[:5]
    except json.JSONDecodeError:
        pass

    # Try to find JSON array within the text (model sometimes wraps in markdown)
    try:
        start = raw_text.find("[")
        end = raw_text.rfind("]") + 1
        if start != -1 and end > start:
            json_str = raw_text[start:end]
            parsed = json.loads(json_str)
            if isinstance(parsed, list) and len(parsed) >= 2:
                reviews = [item.strip() for item in parsed if isinstance(item, str) and item.strip()]
                if len(reviews) >= 2:
                    return reviews[:5]
    except (json.JSONDecodeError, ValueError):
        pass

    # If we got a single review text, wrap it and generate fallback variations
    single_review = raw_text.strip()
    if single_review.startswith('"') and single_review.endswith('"'):
        single_review = single_review[1:-1]

    if single_review and len(single_review) > 10:
        # Use the single AI review as the first option, supplement with fallbacks
        fallbacks = generate_fallback_review(business_name, business_type, keywords, custom_text)
        return [single_review] + fallbacks[1:]

    # Full fallback
    return generate_fallback_review(business_name, business_type, keywords, custom_text)


def generate_fallback_review(
    business_name: str,
    business_type: str,
    keywords: List[str],
    custom_text: Optional[str] = "",
) -> List[str]:
    """Generate fallback review variations without API"""
    reviews = []

    if len(keywords) >= 2:
        kw1, kw2 = keywords[0].lower(), keywords[1].lower()

        # Short & Punchy
        reviews.append(
            f"Loved {business_name}! The {kw1} and {kw2} were on point."
        )
        # Detailed
        reviews.append(
            f"Had a wonderful experience at {business_name}. "
            f"Really appreciated the {kw1} and {kw2}. "
            f"Everything felt professional and welcoming. "
            f"Will definitely be coming back for more!"
        )
        # Casual & Friendly
        reviews.append(
            f"Just visited {business_name} and honestly, so impressed! "
            f"The {kw1} was great and the {kw2} really made my day. "
            f"Definitely recommending to friends."
        )
        # Professional
        reviews.append(
            f"I was thoroughly impressed by {business_name}. "
            f"The {kw1} and {kw2} exceeded my expectations. "
            f"A commendable {business_type.lower()} that I will certainly return to."
        )
        # Enthusiastic
        reviews.append(
            f"Wow, {business_name} is absolutely amazing! "
            f"The {kw1} blew me away and the {kw2} was incredible! "
            f"Best {business_type.lower()} experience I've had in ages!"
        )
    elif len(keywords) == 1:
        kw = keywords[0].lower()

        reviews.append(
            f"Great visit to {business_name}! The {kw} really stood out."
        )
        reviews.append(
            f"Loved my visit to {business_name}! "
            f"The {kw} really stood out. "
            f"Highly recommend this {business_type.lower()} to everyone. "
            f"Will be back soon!"
        )
        reviews.append(
            f"Stopped by {business_name} today — the {kw} was spot on! "
            f"Such a vibe. Definitely coming back."
        )
        reviews.append(
            f"An excellent experience at {business_name}. "
            f"The {kw} was particularly noteworthy. "
            f"A fine establishment I'd recommend without hesitation."
        )
        reviews.append(
            f"Can't stop thinking about {business_name}! "
            f"The {kw} was absolutely fantastic! "
            f"Already planning my next visit!"
        )
    else:
        reviews.append(
            f"Loved {business_name}! Great experience, will return."
        )
        reviews.append(
            f"Great experience at {business_name}! "
            f"The service was excellent and the atmosphere was welcoming. "
            f"Will definitely be coming back."
        )
        reviews.append(
            f"Had such a good time at {business_name}! "
            f"Everything was chill and the vibes were perfect. Highly recommend."
        )
        reviews.append(
            f"I was impressed by the quality of service at {business_name}. "
            f"A well-run {business_type.lower()} that delivers a solid experience."
        )
        reviews.append(
            f"Absolutely loved everything about {business_name}! "
            f"What an amazing {business_type.lower()}! Can't wait to go back!"
        )

    return reviews