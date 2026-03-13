# Clinic Management System Backend

This is the FastAPI backend for the AI-powered Clinic Management System.

## Tech Stack
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM
- **PostgreSQL**: Database
- **Pydantic**: Data validation
- **JOSE / Passlib**: JWT and Password hashing

## Project Structure
- `models/`: SQLAlchemy database models
- `schemas/`: Pydantic request/response models
- `routers/`: API endpoints organized by module
- `services/`: Business logic (Auth, Stock management)
- `database/`: Database connection and session management

## Setup Instructions

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configure Environment**:
    Update `.env` with your PostgreSQL credentials.

3.  **Run the Server**:
    ```bash
    uvicorn main:app --reload
    ```

## API Endpoints

- **Auth**: `/auth/register`, `/auth/login`
- **Patients**: `/patients/` (CRUD)
- **Suppliers**: `/suppliers/` (CRUD)
- **Products**: `/products/` (CRUD)
- **Purchases**: `/purchases/` (Stock INCREASES on creation)
- **Sales**: `/sales/` (Stock DECREASES on creation)
- **Tokens**: `/tokens/` (CRUD)
