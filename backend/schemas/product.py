from pydantic import BaseModel
from datetime import date
from typing import Optional

class ProductBase(BaseModel):
    medicine_name: str
    category: str
    manufacturer: str
    batch_number: str
    expiry_date: date
    purchase_price: float
    selling_price: float
    stock_quantity: int = 0
    supplier_id: int
    hsn_code: Optional[str] = None
    mrp: Optional[float] = None
    unit: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True
        
class ProductUpdate(BaseModel):
    medicine_name: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    supplier_id: Optional[int] = None
    hsn_code: Optional[str] = None
    mrp: Optional[float] = None
    unit: Optional[str] = None
