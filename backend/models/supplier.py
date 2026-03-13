from sqlalchemy import Column, Integer, String
from backend.database.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String, index=True)
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    gst_number = Column(String)
