from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    medicine_name = Column(String, index=True)
    category = Column(String)
    manufacturer = Column(String)
    batch_number = Column(String)
    expiry_date = Column(Date)
    purchase_price = Column(Float)
    selling_price = Column(Float)
    stock_quantity = Column(Integer, default=0)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    
    # Extra fields for clinic management from screenshots
    hsn_code = Column(String, nullable=True)
    mrp = Column(Float, nullable=True)
    unit = Column(String, nullable=True)

    supplier = relationship("Supplier", backref="products")
