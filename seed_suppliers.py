from sqlalchemy.orm import Session
from backend.database.database import SessionLocal, engine, Base
from backend.models.supplier import Supplier

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed_suppliers():
    db: Session = SessionLocal()
    try:
        suppliers_data = [
            ("Wellness Pharma Distributing", "9845012345", "sales@wellnesspharma.com", "12/B, Industrial Area, Bangalore", "29AAAAA0000A1Z5"),
            ("Global Health Medico", "9900112233", "info@globalhealth.in", "45, Healthcare Heights, Mumbai", "27BBBBB1111B2Z6"),
            ("City Care Distributors", "9740556677", "citycare@gmail.com", "Near Apollo Square, Chennai", "33CCCCC2222C3Z7"),
            ("National Meds Supply", "9008007006", "supply@natmeds.org", "Plot 88, Pharma Park, Hyderabad", "36DDDDD3333D4Z8"),
            ("Reliance Pharma Solutions", "8884443332", "partner@reliancepharma.com", "Tech Park Road, Pune", "27EEEEE4444E5Z9"),
            ("Metro Medicare Wholesale", "7776665554", "metro@medicare.net", "Gandhi Marg, New Delhi", "07FFFFF5555F6ZA"),
            ("Apex Pharmaceuticals", "9123456789", "contact@apexpharma.biz", "Export Zone, SEZ, Ahmedabad", "24GGGGG6666G7ZB"),
            ("BioLife Distributions", "9554443332", "orders@biolife.co", "Green Valley, Kochi", "32HHHHH7777H8ZC"),
            ("Sterling Pharma Trade", "9887776665", "trade@sterling.in", "Victoria Road, Kolkata", "19IIIII8888I9ZD"),
            ("Zenith Health Partners", "9443332221", "support@zenith.com", "Silver Oaks Plaza, Jaipur", "08JJJJJ9999J0ZE")
        ]

        for name, phone, email, addr, gst in suppliers_data:
            # Check if exists
            exists = db.query(Supplier).filter(Supplier.supplier_name == name).first()
            if not exists:
                supplier = Supplier(
                    supplier_name=name,
                    phone=phone,
                    email=email,
                    address=addr,
                    gst_number=gst
                )
                db.add(supplier)
                print(f"Seeded Supplier: {name}")
            else:
                print(f"Skipped Supplier (already exists): {name}")

        db.commit()
        print("Supplier seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_suppliers()
