import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(256), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    tier = Column(String(64), default="Collegiate")
    role = Column(String(128), default="Collegiate Debater")
    avatar_url = Column(String(512), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

    debates = relationship("DebateSession", back_populates="user", cascade="all, delete-orphan")

class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    topic = Column(String(512), nullable=False)
    category = Column(String(128), default="Technology & Society")
    difficulty = Column(String(64), default="Intermediate")
    user_position = Column(String(32), default="PRO")
    ai_position = Column(String(32), default="CON")
    current_round = Column(Integer, default=1)
    rounds_count = Column(Integer, default=3)
    current_phase = Column(String(128), default="Opening Arguments")
    winner = Column(String(32), nullable=True)
    user_score = Column(Float, nullable=True)
    ai_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="debates")
    messages = relationship("DebateMessage", back_populates="session", cascade="all, delete-orphan")
    judge_rubric = relationship("DebateJudgeRubric", back_populates="session", uselist=False, cascade="all, delete-orphan")

class DebateMessage(Base):
    __tablename__ = "debate_messages"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("debate_sessions.id"), nullable=False)
    round_number = Column(Integer, default=1)
    phase_name = Column(String(128), default="Opening Arguments")
    sender = Column(String(32), nullable=False) # 'user' or 'ai'
    message = Column(Text, nullable=False)
    logic_score = Column(Integer, nullable=True)
    evidence_score = Column(Integer, nullable=True)
    relevance_score = Column(Integer, nullable=True)
    clarity_score = Column(Integer, nullable=True)
    persuasiveness_score = Column(Integer, nullable=True)
    rebuttal_score = Column(Integer, nullable=True)
    strength = Column(Text, nullable=True)
    weakness = Column(Text, nullable=True)
    suggestion = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("DebateSession", back_populates="messages")
    fallacies = relationship("DebateFallacy", back_populates="message", cascade="all, delete-orphan")

class DebateFallacy(Base):
    __tablename__ = "debate_fallacies"

    id = Column(String(64), primary_key=True, index=True)
    message_id = Column(String(64), ForeignKey("debate_messages.id"), nullable=False)
    fallacy_type = Column(String(128), nullable=False)
    explanation = Column(Text, nullable=False)
    suggestion = Column(Text, nullable=False)

    message = relationship("DebateMessage", back_populates="fallacies")

class DebateJudgeRubric(Base):
    __tablename__ = "debate_judge_rubrics"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("debate_sessions.id"), nullable=False, unique=True)
    user_score = Column(Float, nullable=False)
    ai_score = Column(Float, nullable=False)
    winner = Column(String(32), nullable=False)
    reason = Column(Text, nullable=False)
    user_category_scores = Column(Text, nullable=True) # JSON serialized
    ai_category_scores = Column(Text, nullable=True)   # JSON serialized
    strongest_arg = Column(Text, nullable=True)        # JSON serialized
    weakest_arg = Column(Text, nullable=True)          # JSON serialized
    best_rebuttal = Column(Text, nullable=True)        # JSON serialized
    improvement_suggestions = Column(Text, nullable=True) # JSON serialized
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("DebateSession", back_populates="judge_rubric")
