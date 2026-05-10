"""
MAIN APPLICATION FILE
=====================
This is the entry point of the backend server.

CONCEPT: FastAPI
─────────────────
FastAPI is a Python web framework (like Express.js in Node.js).
It creates an HTTP server that listens for requests.

When you run this file, it starts a server at http://localhost:8000
Your Next.js frontend will send requests to this URL.

FastAPI also auto-generates API documentation at:
  http://localhost:8000/docs      ← Swagger UI (interactive)
  http://localhost:8000/redoc     ← ReDoc (readable)
You can test ALL your endpoints directly in the browser! Very useful.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from database.db import engine, Base
from database.models import *   # import all models so tables get created
from routes import auth, patients, predictions
from ml.predict import prediction_engine
from admin import setup_admin


# ─── LIFESPAN (startup/shutdown) ──────────────────────────────────────────────
# CONCEPT: Lifespan
# ──────────────────
# This is the modern way (FastAPI >= 0.93) to run code at startup/shutdown.
# @asynccontextmanager turns a function into a context manager.
# Code before `yield` runs at startup; code after runs at shutdown.
# NOTE: Must be defined BEFORE app = FastAPI(lifespan=lifespan)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    print("Starting Heart Disease Prediction API...")

    Base.metadata.create_all(bind=engine)
    print("Database tables created/verified")

    models_dir = os.path.join(os.path.dirname(__file__), "ml", "saved_models")
    ann_path = os.path.join(models_dir, "ann_model.keras")
    if os.path.exists(ann_path):
        try:
            prediction_engine.load_models()
            print("ML models loaded")
        except Exception as e:
            print(f"Could not load ML models: {e}")
    else:
        print("ML models not found. Run: python ml/train_model.py")

    yield   # server is running here

    # ── Shutdown ─────────────────────────────────────────────────────────────
    print("Shutting down...")


# ─── CREATE FASTAPI APP ───────────────────────────────────────────────────────
app = FastAPI(
    lifespan=lifespan,
    title="Heart Disease Prediction API",
    description="""
    ## Heart Disease Prediction System

    This API powers the heart disease prediction web application.
    It uses 3 ML models to classify patient risk as Low / Medium / High.

    ### Models Available:
    - **ANN** (Artificial Neural Network) — Deep Learning
    - **Logistic Regression** — Statistical baseline
    - **Random Forest** — Ensemble method

    ### Quick Start:
    1. Register a user: `POST /auth/register`
    2. Login to get token: `POST /auth/login`
    3. Create a patient: `POST /patients/`
    4. Make a prediction: `POST /predictions/predict`
    """,
    version="1.0.0"
)


# ─── CORS MIDDLEWARE ──────────────────────────────────────────────────────────
# CONCEPT: CORS (Cross-Origin Resource Sharing)
# ──────────────────────────────────────────────
# By default, browsers BLOCK requests from one URL to another.
# Example: frontend at localhost:3000 can't call backend at localhost:8000.
# CORS middleware ALLOWS this by adding special headers to responses.
# In production, replace "*" with your actual frontend URL.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],     # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],     # allow all headers including Authorization
)


# ─── REGISTER ROUTES ──────────────────────────────────────────────────────────
# CONCEPT: Routers
# ─────────────────
# Instead of putting ALL routes in one file (messy),
# we split them into separate files and register them here.
# This is like importing components in React.

app.include_router(auth.router)          # /auth/register, /auth/login, /auth/me
app.include_router(patients.router)      # /patients/
app.include_router(predictions.router)   # /predictions/predict, /predictions/history


# ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
# Mounted at /admin — auto-generated UI over SQLAlchemy models, role=admin only.
setup_admin(app)


# ─── STATIC FILES (Reports) ───────────────────────────────────────────────────
reports_dir = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(reports_dir, exist_ok=True)
app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")


# ─── ROOT ENDPOINT ────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "Heart Disease Prediction API is running!",
        "docs": "http://localhost:8000/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Simple endpoint to check if server is alive"""
    return {
        "status": "healthy",
        "models_loaded": prediction_engine.loaded
    }


# ─── RUN SERVER ───────────────────────────────────────────────────────────────
# This block only runs if you execute: python main.py directly
# (not when imported as a module)
if __name__ == "__main__":
    import uvicorn
    # uvicorn = the web server that runs FastAPI
    # reload=True means: auto-restart when you save a file (great for development)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
