from sqlalchemy.orm import Session
from backend.database.database import SessionLocal, engine, Base
from backend.models.product import Product
from backend.models.supplier import Supplier
from datetime import date, timedelta
import random

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed_data():
    db: Session = SessionLocal()
    try:
        # 1. Ensure we have a supplier
        supplier = db.query(Supplier).first()
        if not supplier:
            supplier = Supplier(
                supplier_name="Universal Pharma",
                phone="9876543210",
                email="contact@universal.com",
                address="Medical Square, City",
                gst_number="22AAAAA0000A1Z5"
            )
            db.add(supplier)
            db.flush()
            print("Added default supplier.")
        else:
            print(f"Using existing supplier: {supplier.supplier_name}")

        # 2. Add 10 Example Medicines
        medicines = [
            ("Paracetamol 500mg", "Tablet", "GSK"),
            ("Amoxicillin 250mg", "Capsule", "Abbott"),
            ("Cetirizine 10mg", "Tablet", "Cipla"),
            ("Ibuprofen 400mg", "Tablet", "Sun Pharma"),
            ("Azithromycin 500mg", "Tablet", "Pfizer"),
            ("Metformin 500mg", "Tablet", "Dr. Reddy's"),
            ("Amlodipine 5mg", "Tablet", "Lupin"),
            ("Pantoprazole 400mg", "Tablet", "Alkem"),
            ("Ciprofloxacin 500mg", "Tablet", "Mankind"),
            ("Omeprazole 20mg", "Capsule", "Zydus")
        ]

        categories = ["Tablet", "Capsule", "Syrup", "Injection"]
        units = ["Strip", "Bottle", "Box", "Vial"]

        for i, (name, cat, man) in enumerate(medicines):
            # Check if exists
            exists = db.query(Product).filter(Product.medicine_name == name).first()
            if not exists:
                p_price = round(random.uniform(10, 100), 2)
                s_price = round(p_price * 1.25, 2)
                
                product = Product(
                    medicine_name=name,
                    category=cat,
                    manufacturer=man,
                    batch_number=f"BAT-{2024}-{i+101}",
                    expiry_date=date.today() + timedelta(days=random.randint(300, 700)),
                    purchase_price=p_price,
                    selling_price=s_price,
                    stock_quantity=random.randint(50, 200),
                    supplier_id=supplier.id,
                    hsn_code=f"300490{random.randint(10, 99)}",
                    mrp=round(s_price * 1.1, 2),
                    unit=random.choice(units)
                )
                db.add(product)
                print(f"Seeded: {name}")
            else:
                print(f"Skipped (already exists): {name}")

        db.commit()
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
