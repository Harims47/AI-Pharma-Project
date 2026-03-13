from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.supplier import Supplier
from backend.schemas.supplier import SupplierCreate, Supplier as SupplierSchema

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.post("/", response_model=SupplierSchema, status_code=status.HTTP_201_CREATED)
def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.get("/", response_model=List[SupplierSchema])
def get_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Supplier).offset(skip).limit(limit).all()

@router.get("/{supplier_id}", response_model=SupplierSchema)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.put("/{supplier_id}", response_model=SupplierSchema)
def update_supplier(supplier_id: int, supplier_update: SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    for key, value in supplier_update.dict().items():
        setattr(db_supplier, key, value)
    
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(db_supplier)
    db.commit()
    return {"detail": "Supplier deleted"}
