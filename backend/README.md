# DebateAI Python FastAPI Backend

This backend implements a full-stack, enterprise-grade architecture for **DebateAI** using:
- **FastAPI**: Modern, asynchronous Python web framework
- **SQLite 3 + SQLAlchemy ORM**: Durable relational database persistence with schema mapping for Users, Debates, Messages, Fallacies, and Judge Rubrics
- **Google Gemini 1.5 Flash API**: Powered by `httpx` async client for high-speed debate opposition, logic auditing, fallacy detection, and adjudication
- **JWT (JSON Web Token)**: Secure HS256 token generation and verification
- **bcrypt**: Robust password hashing via `passlib`
- **Uvicorn**: High-performance ASGI web server
- **Axios & httpx**: Bidirectional asynchronous HTTP networking

---

## Architecture Overview

```
Frontend (React + Vite + TypeScript + Tailwind CSS v4 + Web Speech API + Lucide React + Axios)
                                   │
                                   ▼
             HTTP /api/ Routes (JWT Bearer Auth Headers)
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
       FastAPI / Vite Gateway            Google Gemini 1.5 Flash API
     (Uvicorn ASGI + auth + bcrypt)     (Opponent, Fallacies, Judge)
                   │
                   ▼
         SQLAlchemy ORM Models
                   │
                   ▼
          SQLite (debateai.db)
```

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the project root or `backend` folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
JWT_SECRET=debateai-secret-jwt-key-2026-secure
DATABASE_URL=sqlite:///./debateai.db
```

### 3. Launch Uvicorn Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Pre-seeded Accounts
- **Demo Debater**: `demo@debateai.org` / `password123`
- **Sarah Jenkins**: `sarah.debater@gmail.com` / `collegiate2026`
