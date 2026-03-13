from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.database import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    invoice_number = Column(String, index=True)
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())
    total_amount = Column(Float)

    supplier = relationship("Supplier", backref="purchases")
    items = relationship("PurchaseItem", backref="purchase", cascade="all, delete-orphan")

class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_number = Column(String)
    quantity = Column(Integer)
    purchase_price = Column(Float)
    expiry_date = Column(Date)

    product = relationship("Product")
