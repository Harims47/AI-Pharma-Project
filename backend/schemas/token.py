from pydantic import BaseModel
from datetime import date
from typing import Optional

class TokenBase(BaseModel):
    token_number: int
    patient_id: int
    date: date
    status: str = "Waiting"

class TokenCreate(TokenBase):
    pass

class Token(TokenBase):
    id: int

    class Config:
        orm_mode = True
