from sqlalchemy.orm import Session
from models import Business, Base
from sqlalchemy import create_engine


def init_db(SessionLocal):
    """Initialize database with seed data"""
    db = SessionLocal()
    try:
        # Check if demo business already exists
        existing = db.query(Business).filter(Business.business_id == "cafe123").first()
        if not existing:
            demo_business = Business(
                business_id="cafe123",
                name="Chirag Shah & Co, Advocates & Solicitors",
                type="Service",
                logo="https://images.unsplash.com/photo-1495474472645-4d71bcdd2085?w=200",
                google_place_id="ChIJG3lmYmLJ5zsRZ39QuQmPOJ8",
            )
            # demo_business = Business(
            #     business_id="cafe123",
            #     name="Brew Haven",
            #     type="Coffee Shop",
            #     logo="https://images.unsplash.com/photo-1495474472645-4d71bcdd2085?w=200",
            #     google_place_id="ChIJ2eFfoDOADTkRVPUyjRKQsSs",
            # )
            db.add(demo_business)
            db.commit()
            print("[SUCCESS] Demo business seeded successfully")
    except Exception as e:
        print(f"[WARNING] Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()


def get_db_session(SessionLocal):
    """Get a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# from sqlalchemy.orm import Session
# from models import Business, Base
# from sqlalchemy import create_engine


# def init_db(SessionLocal):
#     """Initialize database with seed data"""
#     db = SessionLocal()
#     try:
#         # 1. Check/Seed Brew Haven
#         existing_cafe = db.query(Business).filter(Business.business_id == "cafe123").first()
#         if not existing_cafe:
#             demo_business = Business(
#                 business_id="cafe123",
#                 name="Brew Haven",
#                 type="Coffee Shop",
#                 logo="https://images.unsplash.com/photo-1495474472645-4d71bcdd2085?w=200",
#                 google_place_id="ChIJ2eFfoDOADTkRVPUyjRKQsSs",
#             )
#             db.add(demo_business)
#             print("[SUCCESS] Demo business 'cafe123' seeded successfully")

#         # 2. Check/Seed Peace Harmony
#         existing_peace = db.query(Business).filter(Business.business_id == "peace-harmony").first()
#         if not existing_peace:
#             peace_business = Business(
#                 business_id="peace-harmony",
#                 name="Peace Harmony",
#                 type="Cafe",
#                 logo="https://images.unsplash.com/photo-1495474472645-4d71bcdd2085?w=200",
#                 google_place_id="ChIJs5ydyTiuEmsR0fRSlU0C7k0",
#             )
#             db.add(peace_business)
#             print("[SUCCESS] Real business 'peace-harmony' seeded successfully")
            
#         # Commit everything together
#         db.commit()

#     except Exception as e:
#         print(f"[WARNING] Error during seeding: {e}")
#         db.rollback()
#     finally:
#         db.close()


# def get_db_session(SessionLocal):
#     """Get a database session"""
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()