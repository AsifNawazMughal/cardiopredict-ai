# CardioPredict AI — Heart Disease Prediction System

A full-stack AI-powered Heart Disease prediction web application.

- **Frontend**: Next.js 14 (App Router) — deployed on [Vercel](https://vercel.com)
- **Backend**: FastAPI (Python) — deployed on [Railway](https://railway.app) / [Render](https://render.com)
- **ML Model**: Artificial Neural Network (ANN) trained on the Cleveland Heart Disease dataset

---

## Project Structure

```
├── backend/               # FastAPI backend + ML model
│   ├── main.py
│   ├── controllers/
│   ├── database/
│   ├── ml/
│   ├── routes/
│   ├── schemas/
│   └── requirements.txt
│
└── heart-disease-prediction/   # Next.js frontend
    ├── app/
    ├── components/
    └── package.json
```

---

## Getting Started

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at `http://localhost:8000`

### Frontend (Next.js)

```bash
cd heart-disease-prediction
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

## Deployment

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import this repository
2. Set **Root Directory** to `heart-disease-prediction`
3. Vercel auto-detects Next.js — click **Deploy**
4. Add environment variable `NEXT_PUBLIC_API_URL` pointing to your backend URL

### Backend → Railway (Free)

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect this GitHub repo, set the **Root Directory** to `backend`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`.env`)
```
DATABASE_URL=sqlite:///./heart.db
SECRET_KEY=your-secret-key
```

---

## Author

**Asif Nawaz Mughal**  
GitHub: [@asifnawazmughal](https://github.com/asifnawazmughal)
