from sqlalchemy.orm import Session
from backend.models.product import Product
from fastapi import HTTPException, status

def update_stock(db: Session, product_id: int, quantity_change: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with id {product_id} not found")
    
    new_stock = product.stock_quantity + quantity_change
    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock for product {product.medicine_name}. Available: {product.stock_quantity}, Requested change: {quantity_change}"
        )
    
    product.stock_quantity = new_stock
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
