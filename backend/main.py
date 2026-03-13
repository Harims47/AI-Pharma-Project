from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import engine, Base
from backend.routers import auth, patients, suppliers, products, purchases, sales, tokens

# Import all models to ensure they are registered with Base
from backend.models import user, patient, supplier, product, purchase, sale, token

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-powered Clinic Management System API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(purchases.router)
app.include_router(sales.router)
app.include_router(tokens.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Clinic Management System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
