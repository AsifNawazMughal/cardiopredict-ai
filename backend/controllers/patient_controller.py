"""Patient Controller — CRUD business logic for patients"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional

from database.models.patient import Patient
from schemas.patient_schemas import PatientCreate


def create_patient(db: Session, data: PatientCreate, doctor_id: int) -> Patient:
    patient = Patient(**data.dict(), doctor_id=doctor_id)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def list_patients(db: Session, doctor_id: int, search: Optional[str] = None,
                  skip: int = 0, limit: int = 20):
    query = db.query(Patient).filter(Patient.doctor_id == doctor_id)
    if search:
        query = query.filter(
            (Patient.first_name.ilike(f"%{search}%")) |
            (Patient.last_name.ilike(f"%{search}%"))
        )
    return query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()


def get_patient(db: Session, patient_id: int, doctor_id: int) -> Patient:
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.doctor_id == doctor_id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


def update_patient(db: Session, patient_id: int, data: PatientCreate, doctor_id: int) -> Patient:
    patient = get_patient(db, patient_id, doctor_id)
    for field, value in data.dict().items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


def delete_patient(db: Session, patient_id: int, doctor_id: int) -> None:
    patient = get_patient(db, patient_id, doctor_id)
    db.delete(patient)
    db.commit()
