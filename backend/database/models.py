# Backward-compatibility shim — keeps all existing imports working.
# All model definitions now live in database/models/ (package).
from database.models.user import User, UserRole
from database.models.patient import Patient
from database.models.health_parameter import HealthParameter
from database.models.ml_model import MLModel, ModelType
from database.models.prediction import Prediction, RiskClass
from database.models.audit_log import AuditLog

__all__ = [
    "User", "UserRole",
    "Patient",
    "HealthParameter",
    "MLModel", "ModelType",
    "Prediction", "RiskClass",
    "AuditLog",
]
