from pydantic import BaseModel, EmailStr
from typing import Optional

class SupplierBase(BaseModel):
    supplier_name: str
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int

    class Config:
        orm_mode = True
