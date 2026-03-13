from sqlalchemy.orm import Session
from backend.database.database import SessionLocal, engine
from backend.models.user import User, UserRole
from backend.services.auth import get_password_hash

def init_db():
    # This will create tables if they don't exist
    from backend.database.database import Base
    from backend.models import user, patient, supplier, product, purchase, sale, token
    
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        hashed_pw = get_password_hash("admin")
        if not admin:
            print("Creating default admin user...")
            admin_user = User(
                username="admin",
                hashed_password=hashed_pw,
                role=UserRole.ADMIN.value
            )
            db.add(admin_user)
            print("Admin user created: admin / admin")
        else:
            print("Updating admin password...")
            admin.hashed_password = hashed_pw
            print("Admin password reset to: admin")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
