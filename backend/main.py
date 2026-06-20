from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from models import Base, Business, Feedback, GeneratedReview
from schemas import (
    BusinessResponse,
    FeedbackRequest,
    GenerateReviewRequest,
    GenerateReviewResponse,
)
from database import init_db, get_db_session
from services import generate_review_with_ai

# Load environment variables, overriding system environment variables to prevent local database URL conflicts
load_dotenv(override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./review_gating.db")

# Sanitize database URL to prevent crashes from common configuration formats:
# 1. Handle Prisma-style SQLite URLs (e.g. file:./prisma/dev.db) by falling back to standard SQLite url
if DATABASE_URL.startswith("file:"):
    DATABASE_URL = "sqlite:///./review_gating.db"
# 2. Handle older Heroku postgres:// URLs by updating scheme to postgresql://
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Initialize database engine
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events manager for the FastAPI application"""
    # Create tables and seed data on startup
    Base.metadata.create_all(bind=engine)
    init_db(SessionLocal)
    yield

# Create FastAPI app
app = FastAPI(
    title="Review Gating & Generation API",
    description="AI-powered review collection and generation platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Review Gating API"}


@app.get("/business/{business_id}", response_model=BusinessResponse)
async def get_business(business_id: str):
    """Get business details by business_id"""
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.business_id == business_id).first()
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")
        return BusinessResponse(
            id=business.id,
            business_id=business.business_id,
            name=business.name,
            type=business.type,
            logo=business.logo,
            google_place_id=business.google_place_id,
        )
    finally:
        db.close()


@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Submit feedback for a business"""
    db = SessionLocal()
    try:
        # Verify business exists
        business = db.query(Business).filter(Business.business_id == request.business_id).first()
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")

        # Create feedback record
        feedback = Feedback(
            business_id=request.business_id,
            rating=request.rating,
            feedback=request.feedback,
            email=request.email,
            phone=request.phone,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        return {
            "success": True,
            "message": "Feedback submitted successfully",
            "feedback_id": feedback.id,
        }
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/generate-review", response_model=GenerateReviewResponse)
async def generate_review(request: GenerateReviewRequest):
    """Generate a positive review using AI"""
    db = SessionLocal()
    try:
        # Verify business exists
        business = db.query(Business).filter(Business.business_id == request.business_id).first()
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")

        # Generate review using AI
        generated_text = await generate_review_with_ai(
            business_name=business.name,
            business_type=business.type,
            keywords=request.keywords,
            custom_text=request.custom_text,
        )

        # Store in database
        generated_review = GeneratedReview(
            business_id=request.business_id,
            keywords=",".join(request.keywords) if request.keywords else "",
            generated_review=generated_text,
        )
        db.add(generated_review)
        db.commit()

        return GenerateReviewResponse(review=generated_text)
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/stats/{business_id}")
async def get_stats(business_id: str):
    """Get review statistics for a business"""
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.business_id == business_id).first()
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")

        feedbacks = db.query(Feedback).filter(Feedback.business_id == business_id).all()
        reviews = db.query(GeneratedReview).filter(GeneratedReview.business_id == business_id).all()

        avg_rating = (
            sum([f.rating for f in feedbacks]) / len(feedbacks) if feedbacks else 0
        )
        negative_count = len([f for f in feedbacks if f.rating <= 3])
        positive_count = len([f for f in feedbacks if f.rating >= 4])

        return {
            "business_id": business_id,
            "total_feedbacks": len(feedbacks),
            "total_reviews_generated": len(reviews),
            "average_rating": round(avg_rating, 2),
            "negative_feedback_count": negative_count,
            "positive_feedback_count": positive_count,
        }
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)