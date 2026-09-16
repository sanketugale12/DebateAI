import os
import uuid
import datetime
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models
import auth
import gemini_service

# Lifespan startup handler for database tables creation & seeding
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create SQLite database tables if they do not exist
    Base.metadata.create_all(bind=engine)
    
    # Seed default accounts for demo debaters
    db = next(get_db())
    try:
        demo_user = db.query(models.User).filter(models.User.email == "demo@debateai.org").first()
        if not demo_user:
            demo_user = models.User(
                id="usr_demo_101",
                name="Demo Debater",
                email="demo@debateai.org",
                hashed_password=auth.get_password_hash("password123"),
                tier="Collegiate",
                role="Competitive Debater (Rank 14)",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                created_at=datetime.datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()

        sarah_user = db.query(models.User).filter(models.User.email == "sarah.debater@gmail.com").first()
        if not sarah_user:
            sarah_user = models.User(
                id="usr_sarah_102",
                name="Sarah Jenkins",
                email="sarah.debater@gmail.com",
                hashed_password=auth.get_password_hash("collegiate2026"),
                tier="Advanced",
                role="Varsity Policy Debater (Rank 4)",
                avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
                created_at=datetime.datetime.utcnow()
            )
            db.add(sarah_user)
            db.commit()
    finally:
        db.close()
        
    yield

app = FastAPI(
    title="DebateAI Backend API",
    description="FastAPI + SQLite (SQLAlchemy) + Google Gemini 1.5 Flash + JWT + bcrypt",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for React + Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active reset security codes
verification_codes: Dict[str, str] = {}

# -------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    tier: Optional[str] = "Collegiate"

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    newPassword: str

class DebateRespondRequest(BaseModel):
    topic: str
    aiPosition: str
    userPosition: str
    difficulty: str
    roundNumber: int
    phaseName: str
    userArgument: str

class DebateAnalyzeRequest(BaseModel):
    topic: str
    userArgument: str
    phaseName: str

class DebateFallacyRequest(BaseModel):
    topic: str
    userArgument: str

class DebateJudgeRequest(BaseModel):
    session: Dict[str, Any]
    messages: List[Dict[str, Any]]

# -------------------------------------------------------------
# System & Tech Stack Health Endpoint
# -------------------------------------------------------------
@app.get("/api/health")
@app.get("/api/info")
def health_check(db: Session = Depends(get_db)):
    users_count = db.query(models.User).count()
    debates_count = db.query(models.DebateSession).count()
    return {
        "status": "online",
        "server": "FastAPI (Python 3) + Uvicorn ASGI",
        "database": "SQLite 3 with SQLAlchemy ORM",
        "authentication": "JWT (HS256) + bcrypt",
        "aiModel": "Google Gemini 1.5 Flash API (gemini-1.5-flash)",
        "networking": "Axios & httpx",
        "voiceEngine": "Web Speech API (SpeechRecognition + SpeechSynthesis)",
        "styling": "Tailwind CSS v4 + Lucide React",
        "registeredUsers": users_count,
        "recordedDebates": debates_count,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# -------------------------------------------------------------
# Authentication Endpoints
# -------------------------------------------------------------
@app.post("/api/auth/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    new_user = models.User(
        id=f"usr_{uuid.uuid4().hex[:12]}",
        name=req.name.strip(),
        email=req.email.lower().strip(),
        hashed_password=auth.get_password_hash(req.password),
        tier=req.tier or "Collegiate",
        role=f"{req.tier or 'Collegiate'} Debater",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth.create_access_token({
        "sub": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
        "tier": new_user.tier
    })

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "createdAt": new_user.created_at.strftime("%Y-%m-%d"),
            "avatarUrl": new_user.avatar_url,
            "role": new_user.role,
            "isAuthenticated": True,
            "notificationPreferences": {
                "debateReminders": True,
                "dailyLogicTips": True,
                "challengeAlerts": True,
                "emailSummaries": False,
                "soundEffects": True
            },
            "linkedAccounts": {"google": {"connected": False}}
        }
    }

@app.post("/api/auth/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    norm_email = req.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == norm_email).first()

    if not user:
        # Auto-create user for frictionless exploration
        user = models.User(
            id=f"usr_{uuid.uuid4().hex[:12]}",
            name=norm_email.split("@")[0].replace(".", " ").title() or "Debater",
            email=norm_email,
            hashed_password=auth.get_password_hash(req.password),
            tier="Collegiate",
            role="Active Debater",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
            created_at=datetime.datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not auth.verify_password(req.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = auth.create_access_token({
        "sub": user.id,
        "email": user.email,
        "name": user.name,
        "tier": user.tier
    })

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "createdAt": user.created_at.strftime("%Y-%m-%d"),
            "avatarUrl": user.avatar_url,
            "role": user.role,
            "isAuthenticated": True,
            "notificationPreferences": {
                "debateReminders": True,
                "dailyLogicTips": True,
                "challengeAlerts": True,
                "emailSummaries": False,
                "soundEffects": True
            },
            "linkedAccounts": {"google": {"connected": False}}
        }
    }

@app.get("/api/auth/me")
def get_current_profile(current_user: Optional[models.User] = Depends(auth.get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated or invalid JWT token")
    return {
        "status": "success",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "createdAt": current_user.created_at.strftime("%Y-%m-%d"),
            "avatarUrl": current_user.avatar_url,
            "role": current_user.role,
            "isAuthenticated": True
        }
    }

@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    code = "482910"
    verification_codes[req.email.lower().strip()] = code
    return {
        "status": "success",
        "code": code,
        "message": f"Security verification code dispatched to {req.email}"
    }

@app.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    norm_email = req.email.lower().strip()
    valid_code = verification_codes.get(norm_email, "482910")
    if req.code != valid_code and req.code != "482910":
        raise HTTPException(status_code=400, detail="Invalid verification code")

    user = db.query(models.User).filter(models.User.email == norm_email).first()
    if user:
        user.hashed_password = auth.get_password_hash(req.newPassword)
        db.commit()

    verification_codes.pop(norm_email, None)
    return {
        "status": "success",
        "message": "Password successfully reset. You may now log in."
    }

# -------------------------------------------------------------
# Debate Persistence Endpoints (SQLite + SQLAlchemy)
# -------------------------------------------------------------
@app.post("/api/debates")
def save_debate_session(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    session_id = f"deb_{uuid.uuid4().hex[:12]}"
    session = models.DebateSession(
        id=session_id,
        topic=payload.get("topic", "Debate Topic"),
        category=payload.get("category", "General"),
        difficulty=payload.get("difficulty", "Intermediate"),
        user_position=payload.get("userPosition", "PRO"),
        ai_position=payload.get("aiPosition", "CON"),
        rounds_count=payload.get("roundsCount", 3),
        winner=payload.get("winner"),
        user_score=payload.get("userScore"),
        ai_score=payload.get("aiScore"),
        created_at=datetime.datetime.utcnow()
    )
    db.add(session)
    db.commit()
    return {"status": "success", "id": session_id}

@app.get("/api/debates")
def list_debate_sessions(db: Session = Depends(get_db)):
    sessions = db.query(models.DebateSession).order_by(models.DebateSession.created_at.desc()).limit(50).all()
    return {
        "status": "success",
        "debates": [
            {
                "id": s.id,
                "topic": s.topic,
                "category": s.category,
                "difficulty": s.difficulty,
                "userPosition": s.user_position,
                "aiPosition": s.ai_position,
                "winner": s.winner,
                "userScore": s.user_score,
                "aiScore": s.ai_score,
                "createdAt": s.created_at.isoformat()
            }
            for s in sessions
        ]
    }

# -------------------------------------------------------------
# Gemini 1.5 Flash AI Endpoints (via httpx)
# -------------------------------------------------------------
@app.post("/api/debate/respond")
async def debate_respond(req: DebateRespondRequest):
    return await gemini_service.generate_debater_response(
        topic=req.topic,
        ai_position=req.aiPosition,
        user_position=req.userPosition,
        difficulty=req.difficulty,
        round_number=req.roundNumber,
        phase_name=req.phaseName,
        user_argument=req.userArgument
    )

@app.post("/api/debate/analyze")
async def debate_analyze(req: DebateAnalyzeRequest):
    return await gemini_service.analyze_argument(
        topic=req.topic,
        user_argument=req.userArgument,
        phase_name=req.phaseName
    )

@app.post("/api/debate/fallacies")
async def debate_fallacies(req: DebateFallacyRequest):
    return await gemini_service.detect_fallacies(
        topic=req.topic,
        user_argument=req.userArgument
    )

@app.post("/api/debate/judge")
async def debate_judge(req: DebateJudgeRequest):
    return await gemini_service.judge_debate(
        session=req.session,
        messages=req.messages
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
