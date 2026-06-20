from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Business(Base):
    """Business model"""

    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    logo = Column(String, nullable=True)
    google_place_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Business(id={self.id}, business_id={self.business_id}, name={self.name})>"


class Feedback(Base):
    """Feedback model for negative reviews"""

    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(String, index=True, nullable=False)
    rating = Column(Integer, nullable=False)
    feedback = Column(Text, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Feedback(id={self.id}, business_id={self.business_id}, rating={self.rating})>"


class GeneratedReview(Base):
    """Generated review model for positive reviews"""

    __tablename__ = "generated_reviews"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(String, index=True, nullable=False)
    keywords = Column(String, nullable=True)
    generated_review = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<GeneratedReview(id={self.id}, business_id={self.business_id})>"