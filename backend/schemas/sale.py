from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SaleItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class SaleItemCreate(SaleItemBase):
    pass

class SaleItem(SaleItemBase):
    id: int
    sale_id: int

    class Config:
        orm_mode = True

class SaleBase(BaseModel):
    patient_id: int
    total_amount: float
    payment_mode: str

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class Sale(SaleBase):
    id: int
    sale_date: datetime
    items: List[SaleItem]

    class Config:
        orm_mode = True
