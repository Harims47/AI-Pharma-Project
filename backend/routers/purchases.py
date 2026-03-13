from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.purchase import Purchase, PurchaseItem
from backend.schemas.purchase import PurchaseCreate, Purchase as PurchaseSchema
from backend.services.stock import update_stock

router = APIRouter(prefix="/purchases", tags=["Purchases"])

@router.post("/", response_model=PurchaseSchema, status_code=status.HTTP_201_CREATED)
def create_purchase(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    # Create Purchase record
    db_purchase = Purchase(
        supplier_id=purchase.supplier_id,
        invoice_number=purchase.invoice_number,
        total_amount=purchase.total_amount
    )
    db.add(db_purchase)
    db.flush() # Get purchase ID before committing items

    # Create PurchaseItems and update stock
    for item in purchase.items:
        db_item = PurchaseItem(
            purchase_id=db_purchase.id,
            product_id=item.product_id,
            batch_number=item.batch_number,
            quantity=item.quantity,
            purchase_price=item.purchase_price,
            expiry_date=item.expiry_date
        )
        db.add(db_item)
        
        # Increase stock
        update_stock(db, item.product_id, item.quantity)
    
    db.commit()
    db.refresh(db_purchase)
    return db_purchase

@router.get("/", response_model=List[PurchaseSchema])
def get_purchases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Purchase).offset(skip).limit(limit).all()

@router.get("/{purchase_id}", response_model=PurchaseSchema)
def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase
