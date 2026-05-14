"""
PREDICTION ENGINE
=================
Loads the best-performing trained model (Logistic Regression or XGBoost) and
runs predictions on new patient data. The training script picks whichever model
scored higher on cross-validated F1 and saves it to best_model.pkl along with a
models_summary.json that records which architecture won.
"""

import numpy as np
import pickle
import json
import os

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

RISK_LABELS = {0: "Low", 1: "Medium", 2: "High"}
RISK_COLORS = {0: "green", 1: "yellow", 2: "red"}

# Human-readable labels for the per-feature explanation panel
FEATURE_LABELS = {
    "age":      "Age",
    "sex":      "Sex",
    "cp":       "Chest pain type",
    "trestbps": "Resting blood pressure",
    "chol":     "Cholesterol",
    "fbs":      "Fasting blood sugar",
    "restecg":  "Resting ECG",
    "thalach":  "Max heart rate",
    "exang":    "Exercise-induced angina",
    "oldpeak":  "ST depression",
    "slope":    "ST slope",
    "ca":       "Major vessels",
    "thal":     "Thalassemia",
}


class PredictionEngine:
    """Loads the production model and runs predictions. Loaded once at startup."""

    def __init__(self):
        self.scaler = None
        self.model = None
        self.feature_columns = None
        self.model_name = "Unknown"
        self.loaded = False

    def load_models(self):
        print("Loading trained model...")
        try:
            with open(os.path.join(MODELS_DIR, "scaler.pkl"), 'rb') as f:
                self.scaler = pickle.load(f)
            with open(os.path.join(MODELS_DIR, "feature_columns.json"), 'r') as f:
                self.feature_columns = json.load(f)

            # Prefer the new best_model.pkl; fall back to the legacy filename
            # so deployments updated mid-rollout don't break.
            best_path   = os.path.join(MODELS_DIR, "best_model.pkl")
            legacy_path = os.path.join(MODELS_DIR, "logistic_regression.pkl")
            model_path  = best_path if os.path.exists(best_path) else legacy_path
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)

            # Pull the winning model's name from the summary (XGBoost / LogisticRegression)
            summary_path = os.path.join(MODELS_DIR, "models_summary.json")
            if os.path.exists(summary_path):
                with open(summary_path, 'r') as f:
                    summary = json.load(f)
                self.model_name = summary.get("best_model") or summary.get("best", {}).get("type") or "LogisticRegression"
            else:
                self.model_name = "LogisticRegression"

            self.loaded = True
            print(f"Model loaded ({self.model_name}) from {os.path.basename(model_path)}")

        except FileNotFoundError as e:
            print(f"Model files not found: {e}")
            print("   Please run: python ml/train_model.py first")
            raise

    _FIELD_MAP = {
        'age':      'age',
        'sex':      'sex',
        'cp':       'chest_pain_type',
        'trestbps': 'resting_bp',
        'chol':     'cholesterol',
        'fbs':      'fasting_blood_sugar',
        'restecg':  'resting_ecg',
        'thalach':  'max_heart_rate',
        'exang':    'exercise_angina',
        'oldpeak':  'st_depression',
        'slope':    'st_slope',
        'ca':       'vessels_count',
        'thal':     'thalassemia',
    }

    def _build_scaled_features(self, patient_data: dict):
        features = []
        for col in self.feature_columns:
            api_field = self._FIELD_MAP.get(col, col)
            value = patient_data.get(api_field, patient_data.get(col, 0))
            features.append(float(value))
        features_array = np.array(features).reshape(1, -1)
        return self.scaler.transform(features_array)

    def _explain(self, features_scaled, risk_index: int) -> list:
        """Per-feature contribution to the predicted class's logit.

        Works for any linear-model estimator with `coef_` (e.g. LogisticRegression).
        Returns a list of dicts sorted by absolute impact, with the sign indicating
        whether the feature pushed risk toward the predicted class (+) or away (-).
        """
        coef = getattr(self.model, "coef_", None)
        if coef is None:
            return []  # XGBoost would land here — leave the panel empty for now
        # For multiclass LR with 3 classes, coef_ shape is (3, n_features)
        contributions = coef[risk_index] * features_scaled[0]
        items = [
            {
                "feature": col,
                "label":   FEATURE_LABELS.get(col, col),
                "impact":  float(round(contributions[i], 4)),
            }
            for i, col in enumerate(self.feature_columns)
        ]
        items.sort(key=lambda x: abs(x["impact"]), reverse=True)
        return items

    def predict(self, patient_data: dict) -> dict:
        """Run a prediction for a new patient and return the risk classification."""
        if not self.loaded:
            self.load_models()

        features_scaled = self._build_scaled_features(patient_data)
        proba = self.model.predict_proba(features_scaled)[0]
        risk_index = int(np.argmax(proba))
        confidence = float(np.max(proba))

        return {
            "risk_class": RISK_LABELS[risk_index],
            "risk_color": RISK_COLORS[risk_index],
            "confidence": round(confidence * 100, 1),
            "probabilities": {
                "low":    round(float(proba[0]) * 100, 1),
                "medium": round(float(proba[1]) * 100, 1),
                "high":   round(float(proba[2]) * 100, 1),
            },
            "model_used": self.model_name,
            "feature_contributions": self._explain(features_scaled, risk_index),
            "recommendations": self._get_recommendations(risk_index, patient_data),
        }

    def _get_recommendations(self, risk_index: int, patient_data: dict) -> list:
        if risk_index == 0:
            base_recs = [
                "Continue healthy lifestyle habits",
                "Regular annual check-ups recommended",
                "Maintain healthy diet and exercise routine"
            ]
        elif risk_index == 1:
            base_recs = [
                "Schedule follow-up appointment within 3 months",
                "Consider lifestyle modifications (diet, exercise)",
                "Monitor blood pressure and cholesterol regularly",
                "Reduce sodium intake and increase physical activity"
            ]
        else:
            base_recs = [
                "URGENT: Immediate consultation with cardiologist recommended",
                "Comprehensive cardiac evaluation required",
                "Medication review with treating physician",
                "Strict lifestyle modifications necessary",
                "Consider stress test and further diagnostic workup"
            ]

        chol = patient_data.get('cholesterol', 0)
        if chol > 240:
            base_recs.append(f"High cholesterol ({chol} mg/dl): Dietary changes and possible medication needed")

        bp = patient_data.get('resting_bp', 0)
        if bp > 140:
            base_recs.append(f"High blood pressure ({bp} mmHg): Hypertension management required")

        return base_recs

    def get_model_performance(self) -> dict:
        """Return saved performance metrics for the active model."""
        summary_path = os.path.join(MODELS_DIR, "models_summary.json")
        if os.path.exists(summary_path):
            with open(summary_path, 'r') as f:
                return json.load(f)
        return {}


prediction_engine = PredictionEngine()
