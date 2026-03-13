from sqlalchemy.orm import Session
from backend.database.database import SessionLocal, engine, Base
from backend.models.patient import Patient

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed_patients():
    db: Session = SessionLocal()
    try:
        patients_data = [
            ("Rahul Sharma", 28, "Male", "9845012345", "9845012346", "rahul.s@example.com", "HSR Layout, Bangalore"),
            ("Priya Nair", 24, "Female", "9900112233", None, "priya.nair@example.com", "Indiranagar, Bangalore"),
            ("Amit Patel", 35, "Male", "9740556677", "9740556678", "amit.patel@example.com", "Whitefield, Bangalore"),
            ("Sujith Kumar", 32, "Male", "8779798798", None, "sujith.k@example.com", "Koramangala, Bangalore"),
            ("Ananya Das", 29, "Female", "9008007006", None, "ananya.das@example.com", "Electronic City, Bangalore"),
            ("Vikram Rao", 45, "Male", "8884443332", "8884443333", "vikram.rao@example.com", "Jayanagar, Bangalore"),
            ("Sneha Gupta", 31, "Female", "7776665554", None, "sneha.g@example.com", "Bannerghatta Road, Bangalore"),
            ("Rohan Mehta", 40, "Male", "9123456789", None, "rohan.m@example.com", "Marathahalli, Bangalore"),
            ("Kavita Reddy", 27, "Female", "9554443332", "9554443333", "kavita.reddy@example.com", "BTM Layout, Bangalore"),
            ("Arjun Singh", 38, "Male", "9887776665", None, "arjun.singh@example.com", "Hebbal, Bangalore")
        ]

        for name, age, gender, phone, alt_phone, email, addr in patients_data:
            # Check if exists
            exists = db.query(Patient).filter(Patient.phone == phone).first()
            if not exists:
                patient = Patient(
                    name=name,
                    age=age,
                    gender=gender,
                    phone=phone,
                    alternate_phone=alt_phone,
                    email=email,
                    address=addr
                )
                db.add(patient)
                print(f"Seeded Patient: {name}")
            else:
                print(f"Skipped Patient (phone already exists): {name}")

        db.commit()
        print("Patient seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_patients()
