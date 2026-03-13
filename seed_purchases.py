from sqlalchemy.orm import Session
from backend.database.database import SessionLocal, engine, Base
from backend.models.purchase import Purchase, PurchaseItem
from backend.models.supplier import Supplier
from backend.models.product import Product
from backend.services.stock import update_stock
from datetime import date
import random

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed_purchases():
    db: Session = SessionLocal()
    try:
        suppliers = db.query(Supplier).all()
        products = db.query(Product).all()

        if not suppliers or not products:
            print("Error: Need at least one supplier and one product to create purchases.")
            return

        print(f"Creating sample purchases using {len(suppliers)} suppliers and {len(products)} products...")

        for i in range(5): # Create 5 sample purchases
            supplier = random.choice(suppliers)
            invoice_num = f"INV-2024-{100 + i}"
            
            # Select 1-3 random products
            purchase_products = random.sample(products, k=random.randint(1, 3))
            
            total_amt = 0
            items_to_add = []
            
            for prod in purchase_products:
                qty = random.randint(10, 50)
                price = prod.purchase_price or 100.0
                total_amt += qty * price
                
                items_to_add.append({
                    "product_id": prod.id,
                    "batch_number": f"BATCH-{random.randint(1000, 9999)}",
                    "quantity": qty,
                    "purchase_price": price,
                    "expiry_date": date(2025, random.randint(1, 12), random.randint(1, 28))
                })

            # Create Purchase record
            db_purchase = Purchase(
                supplier_id=supplier.id,
                invoice_number=invoice_num,
                total_amount=total_amt
            )
            db.add(db_purchase)
            db.flush()

            for item_data in items_to_add:
                db_item = PurchaseItem(
                    purchase_id=db_purchase.id,
                    **item_data
                )
                db.add(db_item)
                # update_stock(db, item_data["product_id"], item_data["quantity"]) # Already handled by router logic, but since we are seeding manually, we should do it if we want stock to match

            print(f"Added Purchase: {invoice_num} from {supplier.supplier_name} - Total: ₹{total_amt}")

        db.commit()
        print("Purchase seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_purchases()
