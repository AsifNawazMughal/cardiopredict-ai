"""Prediction Controller — AI prediction business logic"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional
import os, json

from database.models.health_parameter import HealthParameter
from database.models.prediction import Prediction, RiskClass
from database.models.ml_model import MLModel, ModelType
from schemas.prediction_schemas import HealthDataInput
from ml.predict import prediction_engine

RISK_MAP = {"Low": RiskClass.low, "Medium": RiskClass.medium, "High": RiskClass.high}
MODEL_TYPE_MAP = {
    "ANN": ModelType.ann,
    "LogisticRegression": ModelType.logistic_regression,
    "RandomForest": ModelType.random_forest,
}


def run_prediction(db: Session, health_data: HealthDataInput, user_id: int) -> dict:
    """Run a single model prediction and persist results."""
    valid_models = ["ANN", "LogisticRegression", "RandomForest"]
    if health_data.model_type not in valid_models:
        raise HTTPException(status_code=400, detail=f"Model must be one of {valid_models}")

    # Save health parameters
    hp = HealthParameter(
        patient_id=health_data.patient_id,
        age=health_data.age,
        gender=health_data.sex,
        chest_pain_type=health_data.chest_pain_type,
        resting_bp=health_data.resting_bp,
        cholesterol=health_data.cholesterol,
        fasting_blood_sugar=health_data.fasting_blood_sugar,
        resting_ecg=health_data.resting_ecg,
        max_heart_rate=health_data.max_heart_rate,
        exercise_angina=health_data.exercise_angina,
        st_depression=health_data.st_depression,
        st_slope=health_data.st_slope,
        vessels_count=health_data.vessels_count,
        thalassemia=health_data.thalassemia,
    )
    db.add(hp)
    db.flush()

    # Run AI model
    try:
        result = prediction_engine.predict(
            patient_data=health_data.dict(),
            model_type=health_data.model_type
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=503, detail=f"Model error: {e}. Run training first.")

    # Look up model record
    ml_model = db.query(MLModel).filter(
        MLModel.model_type == MODEL_TYPE_MAP[health_data.model_type],
        MLModel.is_active == True
    ).first()

    # Save prediction
    pred = Prediction(
        patient_id=health_data.patient_id,
        health_parameter_id=hp.id,
        model_id=ml_model.id if ml_model else None,
        user_id=user_id,
        risk_class=RISK_MAP[result["risk_class"]],
        risk_score_low=result["probabilities"]["low"] / 100,
        risk_score_medium=result["probabilities"]["medium"] / 100,
        risk_score_high=result["probabilities"]["high"] / 100,
        confidence=result["confidence"] / 100,
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)

    return {
        "prediction_id": pred.id,
        "risk_class": result["risk_class"],
        "risk_color": result["risk_color"],
        "confidence": result["confidence"],
        "probabilities": result["probabilities"],
        "model_used": result["model_used"],
        "recommendations": result["recommendations"],
        "predicted_at": pred.predicted_at.isoformat(),
        # Include health data for full detail view
        "health_data": {
            "age": health_data.age, "sex": health_data.sex,
            "chest_pain_type": health_data.chest_pain_type,
            "resting_bp": health_data.resting_bp,
            "cholesterol": health_data.cholesterol,
            "fasting_blood_sugar": health_data.fasting_blood_sugar,
            "resting_ecg": health_data.resting_ecg,
            "max_heart_rate": health_data.max_heart_rate,
            "exercise_angina": health_data.exercise_angina,
            "st_depression": health_data.st_depression,
            "st_slope": health_data.st_slope,
            "vessels_count": health_data.vessels_count,
            "thalassemia": health_data.thalassemia,
        }
    }


def run_all_models(health_data: HealthDataInput) -> dict:
    """Run all 3 models and return comparison results."""
    try:
        return prediction_engine.predict_all_models(health_data.dict())
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Prediction error: {e}")


def get_prediction_by_id(db: Session, prediction_id: int, user_id: int) -> dict:
    """Fetch a single prediction with full detail."""
    pred = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == user_id
    ).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    hp = pred.health_parameter
    return {
        "prediction_id": pred.id,
        "risk_class": pred.risk_class.value if pred.risk_class else None,
        "confidence": round((pred.confidence or 0) * 100, 1),
        "probabilities": {
            "low": round((pred.risk_score_low or 0) * 100, 1),
            "medium": round((pred.risk_score_medium or 0) * 100, 1),
            "high": round((pred.risk_score_high or 0) * 100, 1),
        },
        "model_used": pred.ml_model.model_type.value if pred.ml_model else "Unknown",
        "predicted_at": pred.predicted_at.isoformat(),
        "patient_id": pred.patient_id,
        "patient_name": f"{pred.patient.first_name} {pred.patient.last_name}" if pred.patient else "Unknown",
        "health_data": {
            "age": hp.age, "sex": hp.gender,
            "chest_pain_type": hp.chest_pain_type,
            "resting_bp": hp.resting_bp,
            "cholesterol": hp.cholesterol,
            "fasting_blood_sugar": hp.fasting_blood_sugar,
            "resting_ecg": hp.resting_ecg,
            "max_heart_rate": hp.max_heart_rate,
            "exercise_angina": hp.exercise_angina,
            "st_depression": hp.st_depression,
            "st_slope": hp.st_slope,
            "vessels_count": hp.vessels_count,
            "thalassemia": hp.thalassemia,
        } if hp else {},
        "recommendations": prediction_engine._get_recommendations(
            {"Low": 0, "Medium": 1, "High": 2}.get(pred.risk_class.value, 0),
            {"cholesterol": hp.cholesterol if hp else 0, "resting_bp": hp.resting_bp if hp else 0}
        )
    }


def get_history(db: Session, user_id: int, patient_id: Optional[int] = None,
                skip: int = 0, limit: int = 50):
    query = db.query(Prediction).filter(Prediction.user_id == user_id)
    if patient_id:
        query = query.filter(Prediction.patient_id == patient_id)
    preds = query.order_by(Prediction.predicted_at.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": p.id,
            "patient_id": p.patient_id,
            "patient_name": f"{p.patient.first_name} {p.patient.last_name}" if p.patient else "Unknown",
            "risk_class": p.risk_class.value if p.risk_class else None,
            "confidence": round((p.confidence or 0) * 100, 1),
            "probability_low": round((p.risk_score_low or 0) * 100, 1),
            "probability_medium": round((p.risk_score_medium or 0) * 100, 1),
            "probability_high": round((p.risk_score_high or 0) * 100, 1),
            "model_used": p.ml_model.model_type.value if p.ml_model else "Unknown",
            "predicted_at": p.predicted_at.isoformat(),
        }
        for p in preds
    ]


def get_models_performance() -> dict:
    from ml.predict import prediction_engine
    metrics = prediction_engine.get_models_performance()
    if not metrics:
        raise HTTPException(status_code=404, detail="No trained models found.")
    return metrics
