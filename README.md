# AI-powered Clinic Management System

A modern, full-stack application for managing clinic operations, patient records, pharmacy inventory, and token systems.

## Tech Stack

### Backend
- **FastAPI** (Python)
- **SQLAlchemy ORM**
- **PostgreSQL**
- **JWT Authentication**

### Frontend
- **React 19** (Vite)
- **Tailwind CSS**
- **Shadcn UI**
- **Lucide Icons**
- **Axios** (API Client)

## Project Structure
- `/backend`: FastAPI source code, models, and database logic.
- `/frontend`: React source code, components, and pages.

## Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL database

### 2. Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `pip install -r requirements.txt`
3. Configure `.env` with your database credentials.
4. Run: `uvicorn main:app --reload`

### 3. Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run: `npm run dev`

## Modules Implemented
- **Login/Auth**: Secure JWT login.
- **Patients**: Record management (Name, Age, History).
- **Suppliers**: Medication vendor management.
- **Medicines**: Inventory tracking with stock alerts.
- **Sales**: Point-of-Sale interface with stocks automatically updated.
- **Token System**: Live queue management for consultations.

---
*Note: AI features (LLM-based consultation summaries, etc.) are planned for the next phase.*
