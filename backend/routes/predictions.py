"""Predictions Routes — thin HTTP layer, delegates to prediction_controller"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database.db import get_db
from database.models.user import User
from schemas.prediction_schemas import HealthDataInput
from controllers.prediction_controller import (
    run_prediction, run_all_models, get_history,
    get_models_performance, get_prediction_by_id
)
from routes.auth import get_current_user

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/predict", status_code=201)
def predict(health_data: HealthDataInput, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return run_prediction(db, health_data, current_user.id)


@router.post("/predict-all-models")
def predict_all(health_data: HealthDataInput, current_user: User = Depends(get_current_user)):
    return run_all_models(health_data)


@router.get("/history")
def history(
    patient_id: Optional[int] = None,
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_history(db, current_user.id, patient_id, skip, limit)


@router.get("/models-performance")
def models_performance(current_user: User = Depends(get_current_user)):
    return get_models_performance()


@router.get("/{prediction_id}")
def get_detail(prediction_id: int, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    return get_prediction_by_id(db, prediction_id, current_user.id)
