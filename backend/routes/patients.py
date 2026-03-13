"""Patients Routes — thin HTTP layer, delegates to patient_controller"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.db import get_db
from database.models.user import User
from schemas.patient_schemas import PatientCreate, PatientResponse
from controllers.patient_controller import (
    create_patient, list_patients, get_patient, update_patient, delete_patient
)
from routes.auth import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/", response_model=PatientResponse, status_code=201)
def create(data: PatientCreate, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    return create_patient(db, data, current_user.id)


@router.get("/", response_model=List[PatientResponse])
def list_all(
    search: Optional[str] = Query(None),
    skip: int = Query(0), limit: int = Query(50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return list_patients(db, current_user.id, search, skip, limit)


@router.get("/{patient_id}", response_model=PatientResponse)
def get_one(patient_id: int, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return get_patient(db, patient_id, current_user.id)


@router.put("/{patient_id}", response_model=PatientResponse)
def update(patient_id: int, data: PatientCreate, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    return update_patient(db, patient_id, data, current_user.id)


@router.delete("/{patient_id}", status_code=204)
def delete(patient_id: int, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    delete_patient(db, patient_id, current_user.id)
