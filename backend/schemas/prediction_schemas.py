from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class HealthDataInput(BaseModel):
    patient_id: Optional[int] = None
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1)
    chest_pain_type: int = Field(..., ge=0, le=3)
    resting_bp: int = Field(..., ge=50, le=250)
    cholesterol: int = Field(..., ge=0, le=600)
    fasting_blood_sugar: int = Field(..., ge=0, le=1)
    resting_ecg: int = Field(..., ge=0, le=2)
    max_heart_rate: int = Field(..., ge=60, le=220)
    exercise_angina: int = Field(..., ge=0, le=1)
    st_depression: float = Field(..., ge=0.0, le=10.0)
    st_slope: int = Field(..., ge=0, le=2)
    vessels_count: int = Field(..., ge=0, le=3)
    thalassemia: int = Field(..., ge=0, le=3)


class PredictionHistoryItem(BaseModel):
    id: int
    patient_id: Optional[int] = None
    patient_name: str
    risk_class: Optional[str] = None
    confidence: float
    probability_low: float
    probability_medium: float
    probability_high: float
    model_used: str
    predicted_at: str
