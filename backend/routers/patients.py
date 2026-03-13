from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.patient import Patient
from backend.schemas.patient import PatientCreate, Patient as PatientSchema

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/", response_model=PatientSchema, status_code=status.HTTP_201_CREATED)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/", response_model=List[PatientSchema])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Patient).offset(skip).limit(limit).all()

@router.get("/{patient_id}", response_model=PatientSchema)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=PatientSchema)
def update_patient(patient_id: int, patient_update: PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    for key, value in patient_update.dict().items():
        setattr(db_patient, key, value)
    
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db.delete(db_patient)
    db.commit()
    return {"detail": "Patient deleted"}
