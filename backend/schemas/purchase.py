from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional

class PurchaseItemBase(BaseModel):
    product_id: int
    batch_number: str
    quantity: int
    purchase_price: float
    expiry_date: date

class PurchaseItemCreate(PurchaseItemBase):
    pass

class PurchaseItem(PurchaseItemBase):
    id: int
    purchase_id: int

    class Config:
        orm_mode = True

class PurchaseBase(BaseModel):
    supplier_id: int
    invoice_number: str
    total_amount: float

class PurchaseCreate(PurchaseBase):
    items: List[PurchaseItemCreate]

class Purchase(PurchaseBase):
    id: int
    purchase_date: datetime
    items: List[PurchaseItem]

    class Config:
        orm_mode = True
