"""HealthParameter model — UCI Heart Disease dataset features"""
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.db import Base


class HealthParameter(Base):
    __tablename__ = "health_parameters"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)

    age = Column(Integer)
    gender = Column(Integer)
    chest_pain_type = Column(Integer)
    resting_bp = Column(Integer)
    cholesterol = Column(Integer)
    fasting_blood_sugar = Column(Integer)
    resting_ecg = Column(Integer)
    max_heart_rate = Column(Integer)
    exercise_angina = Column(Integer)
    st_depression = Column(Float)
    st_slope = Column(Integer)
    vessels_count = Column(Integer)
    thalassemia = Column(Integer)

    recorded_at = Column(DateTime, server_default=func.now())

    patient = relationship("Patient", back_populates="health_parameters")
    predictions = relationship("Prediction", back_populates="health_parameter")
