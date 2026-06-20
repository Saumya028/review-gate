from pydantic import BaseModel
from typing import List, Optional


class BusinessResponse(BaseModel):
    """Business response schema"""

    id: int
    business_id: str
    name: str
    type: str
    logo: Optional[str] = None
    google_place_id: str

    class Config:
        from_attributes = True


class FeedbackRequest(BaseModel):
    """Feedback request schema"""

    business_id: str
    rating: int  # 1-5
    feedback: str
    email: Optional[str] = None
    phone: Optional[str] = None


class GenerateReviewRequest(BaseModel):
    """Generate review request schema"""

    business_id: str
    keywords: List[str]
    custom_text: Optional[str] = ""


class GenerateReviewResponse(BaseModel):
    """Generate review response schema"""

    review: str