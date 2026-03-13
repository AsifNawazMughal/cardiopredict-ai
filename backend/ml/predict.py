"""
PREDICTION ENGINE
=================
This file loads the saved (trained) models and makes predictions
on NEW patient data.

CONCEPT: Why save and load models?
───────────────────────────────────
Training takes time (minutes/hours). We only train ONCE.
We save the trained model to a file (.pkl or .keras).
When a doctor enters a new patient, we just LOAD the saved model
and ask it to predict — this takes milliseconds.

It's like: study for an exam (training) → then take the exam (prediction).
You don't re-study for every question.
"""

import numpy as np
import pickle
import json
import os
import tensorflow as tf
from tensorflow import keras

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

# Risk class labels
RISK_LABELS = {0: "Low", 1: "Medium", 2: "High"}
RISK_COLORS = {0: "green", 1: "yellow", 2: "red"}


class PredictionEngine:
    """
    Loads all 3 trained models and runs predictions.
    We load them once when the server starts (not on every request) for speed.
    """

    def __init__(self):
        self.scaler = None
        self.ann_model = None
        self.lr_model = None
        self.rf_model = None
        self.feature_columns = None
        self.loaded = False

    def load_models(self):
        """Load all saved models from disk"""
        print("🔄 Loading trained models...")

        try:
            # Load scaler (needed to normalize new data the same way as training)
            with open(os.path.join(MODELS_DIR, "scaler.pkl"), 'rb') as f:
                self.scaler = pickle.load(f)

            # Load feature column order (to validate input)
            with open(os.path.join(MODELS_DIR, "feature_columns.json"), 'r') as f:
                self.feature_columns = json.load(f)

            # Load ANN (TensorFlow/Keras model)
            self.ann_model = keras.models.load_model(
                os.path.join(MODELS_DIR, "ann_model.keras")
            )

            # Load Logistic Regression (sklearn model)
            with open(os.path.join(MODELS_DIR, "logistic_regression.pkl"), 'rb') as f:
                self.lr_model = pickle.load(f)

            # Load Random Forest (sklearn model)
            with open(os.path.join(MODELS_DIR, "random_forest.pkl"), 'rb') as f:
                self.rf_model = pickle.load(f)

            self.loaded = True
            print("✅ All models loaded successfully!")

        except FileNotFoundError as e:
            print(f"❌ Model files not found: {e}")
            print("   Please run: python ml/train_model.py first")
            raise

    def predict(self, patient_data: dict, model_type: str = "ANN") -> dict:
        """
        Make a prediction for a new patient.

        Args:
            patient_data: dict with 13 health measurements
            model_type: "ANN", "LogisticRegression", or "RandomForest"

        Returns:
            dict with risk_class, probabilities, and confidence
        """
        if not self.loaded:
            self.load_models()

        # Step 1: Extract features in the correct order
        # The model needs features in EXACTLY the same order as training
        features = []
        for col in self.feature_columns:
            # Map our API field names to dataset column names
            field_map = {
                'age': 'age',
                'sex': 'sex',
                'cp': 'chest_pain_type',
                'trestbps': 'resting_bp',
                'chol': 'cholesterol',
                'fbs': 'fasting_blood_sugar',
                'restecg': 'resting_ecg',
                'thalach': 'max_heart_rate',
                'exang': 'exercise_angina',
                'oldpeak': 'st_depression',
                'slope': 'st_slope',
                'ca': 'vessels_count',
                'thal': 'thalassemia'
            }
            api_field = field_map.get(col, col)
            value = patient_data.get(api_field, patient_data.get(col, 0))
            features.append(float(value))

        # Step 2: Scale the input (same as we did during training)
        features_array = np.array(features).reshape(1, -1)  # shape: (1, 13)
        features_scaled = self.scaler.transform(features_array)

        # Step 3: Get prediction from selected model
        if model_type == "ANN":
            proba = self.ann_model.predict(features_scaled, verbose=0)[0]
            # proba = array like [0.15, 0.25, 0.60] (Low, Medium, High probabilities)

        elif model_type == "LogisticRegression":
            proba = self.lr_model.predict_proba(features_scaled)[0]

        elif model_type == "RandomForest":
            proba = self.rf_model.predict_proba(features_scaled)[0]

        else:
            raise ValueError(f"Unknown model type: {model_type}")

        # Step 4: Determine risk class (index of highest probability)
        risk_index = int(np.argmax(proba))
        confidence = float(np.max(proba))

        # Build result
        result = {
            "risk_class": RISK_LABELS[risk_index],          # "Low", "Medium", "High"
            "risk_color": RISK_COLORS[risk_index],           # "green", "yellow", "red"
            "confidence": round(confidence * 100, 1),        # e.g., 87.3 (%)
            "probabilities": {
                "low":    round(float(proba[0]) * 100, 1),   # % probability Low
                "medium": round(float(proba[1]) * 100, 1),   # % probability Medium
                "high":   round(float(proba[2]) * 100, 1),   # % probability High
            },
            "model_used": model_type,
            "recommendations": self._get_recommendations(risk_index, patient_data)
        }

        return result

    def predict_all_models(self, patient_data: dict) -> dict:
        """Run all 3 models and return comparison"""
        results = {}
        for model_type in ["ANN", "LogisticRegression", "RandomForest"]:
            results[model_type] = self.predict(patient_data, model_type)
        return results

    def _get_recommendations(self, risk_index: int, patient_data: dict) -> list:
        """
        Generate clinical recommendations based on risk level and patient data.
        In a real system, this would be reviewed by medical professionals.
        """
        base_recs = []

        if risk_index == 0:  # Low
            base_recs = [
                "Continue healthy lifestyle habits",
                "Regular annual check-ups recommended",
                "Maintain healthy diet and exercise routine"
            ]
        elif risk_index == 1:  # Medium
            base_recs = [
                "Schedule follow-up appointment within 3 months",
                "Consider lifestyle modifications (diet, exercise)",
                "Monitor blood pressure and cholesterol regularly",
                "Reduce sodium intake and increase physical activity"
            ]
        else:  # High
            base_recs = [
                "URGENT: Immediate consultation with cardiologist recommended",
                "Comprehensive cardiac evaluation required",
                "Medication review with treating physician",
                "Strict lifestyle modifications necessary",
                "Consider stress test and further diagnostic workup"
            ]

        # Add specific recommendations based on values
        chol = patient_data.get('cholesterol', 0)
        if chol > 240:
            base_recs.append(f"High cholesterol ({chol} mg/dl): Dietary changes and possible medication needed")

        bp = patient_data.get('resting_bp', 0)
        if bp > 140:
            base_recs.append(f"High blood pressure ({bp} mmHg): Hypertension management required")

        return base_recs

    def get_models_performance(self) -> dict:
        """Load and return saved performance metrics for all models"""
        summary_path = os.path.join(MODELS_DIR, "models_summary.json")
        if os.path.exists(summary_path):
            with open(summary_path, 'r') as f:
                return json.load(f)
        return {}


# Single instance shared across all requests (loaded once at startup)
prediction_engine = PredictionEngine()
