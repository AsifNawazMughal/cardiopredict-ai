"""User model — healthcare professionals and admins"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database.db import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    healthcare_professional = "healthcare_professional"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.healthcare_professional)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Doctor profile fields (all nullable for backward compatibility)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    specialization = Column(String(200), nullable=True)
    hospital_name = Column(String(200), nullable=True)
    phone = Column(String(30), nullable=True)
    license_number = Column(String(100), nullable=True)
    profile_photo_url = Column(String(500), nullable=True)

    patients = relationship("Patient", back_populates="doctor")
    predictions = relationship("Prediction", back_populates="user")
