from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.sale import Sale, SaleItem
from backend.schemas.sale import SaleCreate, Sale as SaleSchema
from backend.services.stock import update_stock

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.post("/", response_model=SaleSchema, status_code=status.HTTP_201_CREATED)
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    # Create Sale record
    db_sale = Sale(
        patient_id=sale.patient_id,
        total_amount=sale.total_amount,
        payment_mode=sale.payment_mode
    )
    db.add(db_sale)
    db.flush()

    # Create SaleItems and update stock
    for item in sale.items:
        db_item = SaleItem(
            sale_id=db_sale.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
        
        # Decrease stock (using negative quantity)
        update_stock(db, item.product_id, -item.quantity)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/", response_model=List[SaleSchema])
def get_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Sale).offset(skip).limit(limit).all()

@router.get("/{sale_id}", response_model=SaleSchema)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
