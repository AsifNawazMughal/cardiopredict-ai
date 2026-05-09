import re
from pydantic import BaseModel, field_validator
from typing import Optional
from database.models.user import UserRole

USERNAME_RE = re.compile(r"^[a-zA-Z0-9._]{3,20}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole = UserRole.healthcare_professional
    # Doctor profile (optional at registration)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None

    @field_validator("username")
    @classmethod
    def _username_format(cls, v: str) -> str:
        if not USERNAME_RE.match(v):
            raise ValueError("Username must be 3-20 characters, letters/digits/'.'/'_' only (no '@', no spaces)")
        return v

    @field_validator("email")
    @classmethod
    def _email_format(cls, v: str) -> str:
        if not EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v

    @field_validator("password")
    @classmethod
    def _password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a digit")
        return v


class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    profile_photo_url: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    profile_photo_url: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None
