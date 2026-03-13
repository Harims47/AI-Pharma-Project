from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.database import Base

class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(Integer)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    date = Column(Date, server_default=func.current_date())
    status = Column(String, default="Waiting") # Waiting, In Consultation, Completed, Cancelled

    patient = relationship("Patient", backref="tokens")
