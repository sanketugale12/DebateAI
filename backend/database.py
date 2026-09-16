import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL with local file storage
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./debateai.db")

# check_same_thread=False is needed for SQLite with FastAPI multi-threading
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI dependency yielding a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
