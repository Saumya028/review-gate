import os
import json
import httpx
import random
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
    Generate multiple positive review variations using OpenRouter API with high dynamic variability.
    """

    if not OPENROUTER_API_KEY:
        return generate_fallback_review(business_name, business_type, keywords, custom_text, selected_service)

    keywords_text = ", ".join(keywords) if keywords else "legal expertise"
    custom_section = f"\nAdditional Customer Notes: {custom_text}" if custom_text else ""
    service_section = f"\nSpecific Legal Service Used: {selected_service}" if selected_service else ""

    # DYNAMIC VARIABILITY GENERATOR: Injecting randomized structural seeds directly into the system prompt 
    # forcing the LLM to completely alter its response layout architecture on every call.
    perspectives = [
        "Highlight the analytical thoroughness, detailed documentation clarity, and boardroom preparation.",
        "Focus on the initial emotional relief and the strategic legal protection provided.",
        "Emphasize the seamless navigation of legal red tape, institutional authorities, and deep regulatory knowledge.",
        "Underline the meticulous legal research, cross-examination support, or responsive updates.",
        "Center the narrative around protection of critical rights, financial interests, and long-term security."
    ]
    random.shuffle(perspectives)

    system_prompt = f"""You are writing genuine, highly detailed positive client testimonials for a reputable law firm. You must return EXACTLY a JSON array of 5 completely different review variations. Follow these guidelines strictly:

CRITICAL LENGTH REQUIREMENT:
- Every single review variation MUST be a comprehensive paragraph containing a MINIMUM of 4-5 full sentences.
- Each review MUST be between 70 and 130 words. No exceptions.
- ABSOLUTELY DO NOT generate any short, casual, or punchy 1-2 sentence reviews. Any review under 4 sentences is UNACCEPTABLE.

VARIATION PERSPECTIVES FOR THIS RUN (Ensure each variation takes a completely different unique route):
1. Option 1: {perspectives[0]}
2. Option 2: {perspectives[1]}
3. Option 3: {perspectives[2]}
4. Option 4: {perspectives[3]}
5. Option 5: {perspectives[4]}

MANDATORY LOCAL SEO ANCHORS (embed naturally based on context — do NOT force all into every review):
- Location references: "Andheri", "Mumbai", "Maharashtra"
- Legal body references (use where relevant to the service): "RERA", "Tribunals", "Consumer Commissions", "Courts", "Government Authorities"
- Embed the specific legal service name naturally in each review.

STRICT DIVERSITY & RANDOMIZATION RULES:
- Each review MUST start with a completely different unique structural hook. 
- BANNED openings: "Chirag Shah & Co is...", "Chirag Shah & Co has...", "I visited Chirag Shah...", "The team at Chirag Shah...".
- Vary how the firm name is referenced across options: full name, "the firm", "their legal team", "Advocate Shah and his associates", "this boutique legal practice".
- Use completely different sentence syntax structures, vocabulary patterns, and client personas.

TONE RULES:
- Natural and authentic — sounds like a real person wrote it, not marketing copy. No excessive exclamation marks.
- Integrate the provided keywords and service name organically.

OUTPUT FORMAT:
- Output ONLY a valid JSON array of 5 strings, nothing else. No markdown, no labels, no numbering."""

    user_prompt = f"""Firm Name: {business_name}
Firm Type: {business_type}
Client-Selected Keywords: {keywords_text}{service_section}{custom_section}
Random Seed Value: {random.randint(10000, 99999)}

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
                    "temperature": 0.5,  # Increased temperature for higher creative variation
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

    except Exception as e:
        print(f"Error generating review, falling back: {str(e)}")
        return generate_fallback_review(business_name, business_type, keywords, custom_text, selected_service)


def parse_review_variations(
    raw_text: str,
    business_name: str,
    business_type: str,
    keywords: List[str],
    custom_text: Optional[str] = "",
    selected_service: str = "",
) -> List[str]:
    """Robustly parse AI response into a list of review strings."""
    try:
        parsed = json.loads(raw_text)
        if isinstance(parsed, list) and len(parsed) >= 2:
            reviews = [item.strip() for item in parsed if isinstance(item, str) and item.strip()]
            if len(reviews) >= 2:
                return reviews[:5]
    except json.JSONDecodeError:
        pass

    try:
        start = raw_text.find("[")
        end = raw_text.rfind("]") + 1
        if start != -1 and end > start:
            parsed = json.loads(raw_text[start:end])
            if isinstance(parsed, list) and len(parsed) >= 2:
                return [item.strip() for item in parsed if isinstance(item, str) and item.strip()][:5]
    except Exception:
        pass

    return generate_fallback_review(business_name, business_type, keywords, custom_text, selected_service)


def generate_fallback_review(
    business_name: str,
    business_type: str,
    keywords: List[str],
    custom_text: Optional[str] = "",
    selected_service: str = "",
) -> List[str]:
    """Generate dynamic fallback review variations by swapping sentence segments randomly."""
    service_ref = selected_service if selected_service else "legal services"
    kw_text = " and ".join(keywords[:2]) if keywords else "professional guidance"

    # Pools of randomized components to break deterministic loops if API goes down
    openers = [
        f"When our organization encountered an intricate challenge requiring reliable counsel for {service_ref}, we turned to {business_name}.",
        f"Navigating the complexities of {service_ref} in Maharashtra can be exceptionally stressful without true advocacy.",
        f"Seeking legal support for {service_ref} for the very first time was incredibly intimidating for me.",
        f"Over the last couple of years, my associates and I have repeatedly relied on {business_name} in Andheri for various complex matters.",
        f"Resolving a persistent issue regarding {service_ref} required a highly strategic, professional approach."
    ]

    bodies = [
        f"Their team based at the Andheri office immediately showcased absolute mastery, offering clean {kw_text} and distinct clarity regarding our case layout.",
        f"From our very first session, the level of meticulous preparation and insightful {kw_text} made it obvious that we were in safe hands.",
        f"They stepped up immediately, deploying profound legal insight and clear {kw_text} that simplified the entire procedural roadmap for us.",
        f"The firm consistently brings exceptional professionalism to the table, handling deep documentation and presenting strategic advice effortlessly.",
        f"They tackled our grievances with complete determination, ensuring every element of our strategy was solid and transparent."
    ]

    arguments = [
        f"Their practical exposure across various Mumbai courts and specialized tribunals was completely clear during the proceedings.",
        f"Having them manage representation before RERA and state government authorities provided an incredible advantage for our position.",
        f"They protected our long-term rights diligently before consumer commissions and corporate tribunals alike.",
        f"Their comprehensive understanding of local real estate legal frameworks and regulatory compliance was absolutely outstanding.",
        f"They handled the entire cross-coordination with regional legal frameworks and judicial benches seamlessly."
    ]

    conclusions = [
        f"The favorable resolution achieved speaks volumes about their advocacy. I completely trust this practice with all our legal needs.",
        f"We secured an outstanding outcome thanks to their dedication. I strongly suggest consulting their team if you require practical legal solutions.",
        f"Their representation surpassed our expectations. They are undoubtedly our go-to advocates across Mumbai from this point forward.",
        f"I am genuinely relieved by the thorough and positive outcome. Their structured guidance saved us immense stress and resources.",
        f"An exceptional experience from start to finish. Their commitment to client safety and successful representation is truly commendable."
    ]

    # Shuffle everything to guarantee unique text output permutations on every single reload
    random.shuffle(openers)
    random.shuffle(bodies)
    random.shuffle(arguments)
    random.shuffle(conclusions)

    reviews = []
    for i in range(5):
        # Assemble completely randomized variants combining the sections
        review_paragraph = f"{openers[i]} {bodies[i]} {arguments[i]} {conclusions[i]}"
        reviews.append(review_paragraph)

    return reviews