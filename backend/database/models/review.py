"""Review model — user-submitted stars + comment about the app."""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.db import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=True)

    stars = Column(Integer, nullable=False)            # 1-5
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
    prediction = relationship("Prediction")
