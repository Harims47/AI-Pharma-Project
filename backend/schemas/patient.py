from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    alternate_phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
