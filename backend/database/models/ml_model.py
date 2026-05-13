"""MLModel model — trained model registry"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database.db import Base


class ModelType(str, enum.Enum):
    logistic_regression = "LogisticRegression"


class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100))
    model_type = Column(Enum(ModelType))
    model_path = Column(String(500))
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    roc_auc = Column(Float)
    is_active = Column(Boolean, default=True)
    trained_at = Column(DateTime, server_default=func.now())
    version = Column(String(20), default="1.0")

    predictions = relationship("Prediction", back_populates="ml_model")
