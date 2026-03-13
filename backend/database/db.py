"""
DATABASE CONNECTION FILE
========================
This file creates a connection to MySQL database.

CONCEPT: SQLAlchemy is a Python library that lets you work with databases
using Python code instead of writing raw SQL queries.

Think of it like this:
- Without SQLAlchemy: you write  SELECT * FROM patients WHERE id = 1
- With SQLAlchemy:    you write  db.query(Patient).filter(Patient.id == 1).first()

Both do the same thing, but Python code is easier to read and safer.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load .env file so we can use DATABASE_URL from it
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# create_engine = opens the connection to MySQL
engine = create_engine(DATABASE_URL)

# SessionLocal = a factory that creates database sessions
# Think of a "session" like opening a tab in your browser for the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = the parent class all our database tables will inherit from
Base = declarative_base()


def get_db():
    """
    This function gives each API request its own database session.
    When the request is done, it automatically closes the session.

    Used as a 'dependency' in FastAPI routes (explained when we use it).
    """
    db = SessionLocal()
    try:
        yield db          # give the session to whoever asked for it
    finally:
        db.close()        # always close when done (even if there was an error)
