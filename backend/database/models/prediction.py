"""Prediction model — AI prediction results"""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database.db import Base


class RiskClass(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    health_parameter_id = Column(Integer, ForeignKey("health_parameters.id"))
    model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    risk_class = Column(Enum(RiskClass))
    risk_score_low = Column(Float)
    risk_score_medium = Column(Float)
    risk_score_high = Column(Float)
    confidence = Column(Float)
    report_path = Column(String(500), nullable=True)

    predicted_at = Column(DateTime, server_default=func.now())

    patient = relationship("Patient", back_populates="predictions")
    health_parameter = relationship("HealthParameter", back_populates="predictions")
    ml_model = relationship("MLModel", back_populates="predictions")
    user = relationship("User", back_populates="predictions")
