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
    selected_service: str = "",
) -> List[str]:
    """
    Generate multiple positive review variations using OpenRouter API

    Args:
        business_name: Name of the business
        business_type: Type/category of the business
        keywords: List of keywords to include in the review
        custom_text: Optional additional context from the customer
        selected_service: The specific legal service the client received

    Returns:
        List of generated review text variations (5 options)
    """

    if not OPENROUTER_API_KEY:
        # Use fallback if no API key configured
        return generate_fallback_review(business_name, business_type, keywords, custom_text, selected_service)

    keywords_text = ", ".join(keywords) if keywords else "legal expertise"
    custom_section = f"\nAdditional Customer Notes: {custom_text}" if custom_text else ""
    service_section = f"\nSpecific Legal Service Used: {selected_service}" if selected_service else ""

    system_prompt = """You are writing genuine, detailed positive client testimonials for a reputable law firm. You must return EXACTLY a JSON array of 5 different review variations. Follow these guidelines strictly:

CRITICAL LENGTH REQUIREMENT:
- Every single review variation MUST be a comprehensive paragraph containing a MINIMUM of 4-5 full sentences.
- Each review MUST be between 70 and 130 words. No exceptions.
- ABSOLUTELY DO NOT generate any short, casual, or punchy 1-2 sentence reviews. Any review under 4 sentences is UNACCEPTABLE.

VARIATION STRUCTURE (all must be long-form paragraphs):
1. "Grateful Client" — A heartfelt, detailed testimonial emphasizing personal relief and trust. Start with a personal situation or emotional hook.
2. "Recommending Professional" — A thorough recommendation focusing on competence and professionalism. Start with a recommendation or referral angle.
3. "Impressed First-Timer" — A detailed account from someone using legal services for the first time. Start with initial apprehension turning to confidence.
4. "Returning Client" — A loyal client sharing why they keep coming back. Start with how long or how many times they have used the firm.
5. "Business/Society Representative" — A testimonial from a housing society member, developer, or business owner. Start with the organizational context.

MANDATORY LOCAL SEO ANCHORS (embed naturally based on context — do NOT force all into every review):
- Location references: "Andheri", "Mumbai", "Maharashtra"
- Legal body references (use where relevant to the service): "RERA", "Tribunals", "Consumer Commissions", "Courts", "Government Authorities"
- Embed the specific legal service name naturally in each review.

DIVERSITY RULES:
- Each review MUST start with a completely different opening phrase. BANNED openings: "Chirag Shah & Co is...", "Chirag Shah & Co has...", "I visited Chirag Shah...", "The team at Chirag Shah...". Use varied hooks: questions, anecdotes, recommendations, emotional statements, context-setting phrases.
- Use different sentence structures, vocabulary, and perspectives across all 5 variations.
- Vary how the firm name is referenced: full name, "the firm", "their team", "Advocate Shah and his colleagues", etc.

TONE RULES:
- Natural and authentic — sounds like a real person wrote it, not marketing copy.
- Professional but warm. No excessive exclamation marks (max 1 per review).
- Integrate the provided keywords and service name organically.
- Do NOT use phrases like "I highly recommend" in more than 2 of the 5 reviews.

OUTPUT FORMAT:
- Output ONLY a valid JSON array of 5 strings, nothing else. No markdown, no labels, no numbering.
- Example: ["Review 1 full paragraph here.", "Review 2 full paragraph here.", "Review 3 full paragraph here.", "Review 4 full paragraph here.", "Review 5 full paragraph here."]"""

    user_prompt = f"""Firm Name: {business_name}
Firm Type: {business_type}
Client-Selected Keywords: {keywords_text}{service_section}{custom_section}

Generate the 5 long-form review variations as a JSON array:"""

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
                    "model": "mistralai/mistral-small-3.1-24b-instruct",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "max_tokens": 1200,
                    "temperature": 0.85,
                },
                timeout=45.0,
            )

            response.raise_for_status()
            data = response.json()

            if "choices" in data and len(data["choices"]) > 0:
                raw_text = data["choices"][0]["message"]["content"].strip()
                return parse_review_variations(raw_text, business_name, business_type, keywords, custom_text, selected_service)
            else:
                raise ValueError("Unexpected response format from OpenRouter API")

    except httpx.HTTPStatusError as e:
        print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        # Fall back to template generation
        return generate_fallback_review(business_name, business_type, keywords, custom_text, selected_service)
    except Exception as e:
        print(f"Error generating review: {str(e)}")
        # Fall back to template generation
        return generate_fallback_review(business_name, business_type, keywords, custom_text, selected_service)


def parse_review_variations(
    raw_text: str,
    business_name: str,
    business_type: str,
    keywords: List[str],
    custom_text: Optional[str] = "",
    selected_service: str = "",
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
        fallbacks = generate_fallback_review(business_name, business_type, keywords, custom_text, selected_service)
        return [single_review] + fallbacks[1:]

    # Full fallback
    return generate_fallback_review(business_name, business_type, keywords, custom_text, selected_service)


def generate_fallback_review(
    business_name: str,
    business_type: str,
    keywords: List[str],
    custom_text: Optional[str] = "",
    selected_service: str = "",
) -> List[str]:
    """Generate fallback review variations without API — long-form, SEO-optimized"""
    reviews = []
    service_ref = selected_service if selected_service else "legal services"
    kw_text = " and ".join(keywords[:2]) if keywords else "professional guidance"

    # Variation 1: Grateful Client perspective
    reviews.append(
        f"When I first approached {business_name} for {service_ref}, I was overwhelmed by the complexity of my case and unsure about the legal process ahead. "
        f"From the very first consultation at their Andheri office, the team put me at ease with their {kw_text} and thorough understanding of the matter. "
        f"They guided me through every step, explaining the implications clearly and ensuring I was always informed about the progress. "
        f"Their expertise in handling cases across Mumbai courts and tribunals gave me confidence that my matter was in capable hands. "
        f"I am genuinely grateful for the outcome and would trust them with any legal matter in the future."
    )

    # Variation 2: Recommending Professional perspective
    reviews.append(
        f"If you are looking for a reliable law firm in Mumbai that truly delivers on its promises, I would strongly suggest consulting {business_name} in Andheri. "
        f"I engaged them for {service_ref} and was impressed by their {kw_text} throughout the entire engagement. "
        f"What sets them apart is their ability to break down complex legal matters into understandable terms while maintaining the highest level of professionalism. "
        f"Their familiarity with Maharashtra's legal framework, including proceedings before various courts and government authorities, proved invaluable in my case. "
        f"The practical advice and strategic approach they offered made the entire process far less stressful than I had anticipated."
    )

    # Variation 3: Impressed First-Timer perspective
    reviews.append(
        f"Having never dealt with legal matters before, I was quite apprehensive about seeking help for {service_ref}, but my experience with {business_name} completely changed my perspective. "
        f"Their Andheri, Mumbai office felt welcoming and the initial consultation itself demonstrated their {kw_text} and deep knowledge of the subject. "
        f"They patiently answered all my questions, no matter how basic, and laid out a clear roadmap for my case. "
        f"The team's experience with tribunals and consumer commissions in Maharashtra was evident in how confidently they handled the proceedings. "
        f"I walked away feeling that I had made the right choice, and the successful resolution of my matter confirmed it."
    )

    # Variation 4: Returning Client perspective
    reviews.append(
        f"Over the past several years, I have consulted {business_name} on multiple occasions for different legal needs, and their consistency in delivering excellent {service_ref} is truly commendable. "
        f"Each time I visit their Andheri office, the team demonstrates the same level of dedication, {kw_text}, and attention to detail that I experienced during my very first engagement. "
        f"Whether it involves court appearances in Mumbai or documentation work requiring coordination with government authorities, they handle everything with remarkable efficiency. "
        f"Their understanding of Maharashtra's legal landscape and their network across various courts and RERA authorities has been extremely beneficial. "
        f"I have recommended them to several friends and family members, and everyone has had equally positive experiences."
    )

    # Variation 5: Business/Society Representative perspective
    reviews.append(
        f"As a representative of our housing society in Andheri, I can say that engaging {business_name} for {service_ref} was one of the best decisions our managing committee made. "
        f"The firm demonstrated exceptional {kw_text} and a thorough understanding of the legal complexities involved in society matters across Mumbai. "
        f"They represented us effectively before RERA and various tribunals, always keeping our committee updated with clear, jargon-free communication. "
        f"Their strategic approach to navigating Maharashtra's regulatory framework saved us both time and resources, and the outcome exceeded our expectations. "
        f"We continue to retain their services for ongoing legal matters and have complete confidence in their counsel."
    )

    return reviews