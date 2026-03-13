"""Patient model — demographic information"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.db import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(String(20))
    gender = Column(String(10))
    contact_number = Column(String(20))
    address = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    doctor_id = Column(Integer, ForeignKey("users.id"))

    doctor = relationship("User", back_populates="patients")
    health_parameters = relationship("HealthParameter", back_populates="patient")
    predictions = relationship("Prediction", back_populates="patient")
