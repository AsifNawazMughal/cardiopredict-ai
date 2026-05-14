"""Review Routes — let signed-in users submit star ratings + comments."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.db import get_db
from database.models.review import Review
from database.models.user import User
from routes.auth import get_current_user


router = APIRouter(prefix="/reviews", tags=["Reviews"])


class ReviewCreate(BaseModel):
    stars: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)
    prediction_id: Optional[int] = None


class ReviewResponse(BaseModel):
    id: int
    stars: int
    comment: Optional[str] = None
    prediction_id: Optional[int] = None

    class Config:
        from_attributes = True


@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    body: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not (1 <= body.stars <= 5):
        raise HTTPException(status_code=400, detail="Stars must be between 1 and 5")
    review = Review(
        user_id=current_user.id,
        stars=body.stars,
        comment=(body.comment or "").strip() or None,
        prediction_id=body.prediction_id,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
