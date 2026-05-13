"""
AUTH CONTROLLER — Business logic for authentication
====================================================
CONCEPT: Controller Pattern
────────────────────────────
Routes handle HTTP (request in, response out).
Controllers handle the actual WORK (DB queries, logic, validation).

Route:      "I got a POST /register request with this data"
Controller: "OK, check if user exists, hash password, save to DB, return user"

This separation means:
- Routes stay thin and readable
- Business logic is reusable (e.g., another route could call register_user too)
- Easy to test controllers without HTTP
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
import os
import secrets
import logging
from dotenv import load_dotenv

from database.models.user import User
from schemas.auth_schemas import UserCreate, UserProfileUpdate
from services.email import send_verification_email

log = logging.getLogger(__name__)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or SECRET_KEY in {"changeme", "your_secret_key_here"}:
    raise RuntimeError(
        "SECRET_KEY environment variable is missing or insecure. "
        "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
    )
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def register_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user account and send a verification email.
    Raises 400 if username/email already taken."""
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    token = secrets.token_urlsafe(32)

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        specialization=user_data.specialization,
        hospital_name=user_data.hospital_name,
        phone=user_data.phone,
        license_number=user_data.license_number,
        email_verified=False,
        verification_token=token,
        verification_token_expires_at=datetime.utcnow() + timedelta(hours=24),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        send_verification_email(
            to=user.email,
            name=user.first_name or user.username,
            token=token,
        )
    except Exception as e:
        # Don't fail registration if email send fails — user can request a resend.
        log.exception("Failed to send verification email for %s: %s", user.email, e)

    return user


def verify_email_token(db: Session, token: str) -> User:
    """Look up a user by verification token and mark them verified.
    Raises 400 on invalid/expired token."""
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification link")
    if user.verification_token_expires_at and user.verification_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification link has expired. Please register again or request a new one.")

    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    db.commit()
    db.refresh(user)
    return user


def resend_verification_email(db: Session, email: str) -> None:
    """Generate a fresh token and re-send the verification email.
    Silently succeeds whether or not the email exists, to avoid enumeration."""
    user = db.query(User).filter(User.email == email).first()
    if not user or user.email_verified:
        return  # don't reveal whether the email exists or is verified

    token = secrets.token_urlsafe(32)
    user.verification_token = token
    user.verification_token_expires_at = datetime.utcnow() + timedelta(hours=24)
    db.commit()

    try:
        send_verification_email(
            to=user.email,
            name=user.first_name or user.username,
            token=token,
        )
    except Exception as e:
        log.exception("Failed to resend verification email for %s: %s", user.email, e)


def check_availability(db: Session, username: Optional[str] = None, email: Optional[str] = None) -> dict:
    """Live check used by the registration form to tell whether a username/email is already taken."""
    result = {}
    if username:
        result["username_taken"] = db.query(User).filter(User.username == username).first() is not None
    if email:
        result["email_taken"] = db.query(User).filter(User.email == email).first() is not None
    return result


def authenticate_user(db: Session, username_or_email: str, password: str) -> User:
    """Verify credentials. The first arg can be either a username or an email. Raises 401 if invalid."""
    user = db.query(User).filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")
    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in. Check your inbox for the verification link.",
        )
    return user


def update_user_profile(db: Session, user_id: int, profile_data: UserProfileUpdate) -> User:
    """Update doctor profile fields for an existing user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in profile_data.dict(exclude_none=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user
