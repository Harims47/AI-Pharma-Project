from pydantic import BaseModel
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"

class UserBase(BaseModel):
    username: str
    role: UserRole = UserRole.STAFF

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
