from pydantic import BaseModel
from typing import Optional
from database.models.user import UserRole


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
