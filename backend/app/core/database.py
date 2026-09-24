import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL

# On Vercel serverless, SQLite DB must be created in /tmp directory
if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV") or not os.access(".", os.W_OK):
    db_url = "sqlite:////tmp/farmdirect_demo.db"

connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

