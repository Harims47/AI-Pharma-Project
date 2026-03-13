from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from backend.database.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    phone = Column(String, index=True)
    alternate_phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
