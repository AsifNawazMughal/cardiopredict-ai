<div align="center">

# ❤️ CardioPredict AI

### Heart Disease Risk Assessment System

A full-stack ML web application that classifies patient cardiovascular risk as **Low**, **Medium**, or **High** using a Logistic Regression model trained on the UCI Heart Disease dataset (Cleveland + Hungarian cohorts, ~600 samples).

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2017-336791)](https://www.postgresql.org/)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E)](https://scikit-learn.org/)

</div>

---

## ✨ Features

- 👨‍⚕️ Healthcare-professional accounts with patient management
- 🩺 Heart-disease risk prediction (Low / Medium / High)
- 📊 Interactive dashboard with charts and prediction history
- 📄 PDF / CSV export of prediction reports
- 🛠 Admin panel at `/admin` with role-based access

## 📈 Model

> Trained on UCI Cleveland + Hungarian datasets (~600 samples, 80/20 train/test split, multi-class: Low / Medium / High).

| Metric    | Score   |
| --------- | :-----: |
| Accuracy  | 76.7%   |
| F1 Score  | 0.764   |
| ROC-AUC   | 0.910   |

**Why Logistic Regression?** Cardiovascular risk classification on tabular data is the textbook use case for logistic regression — it's the model behind the [Framingham Risk Score](https://en.wikipedia.org/wiki/Framingham_Risk_Score) and ASCVD risk equations used in real clinical practice. Interpretable coefficients, robust on small samples, and on this dataset its accuracy was within 1% of a 3-layer neural network at a fraction of the runtime cost.

---

## 🚀 Local Setup

> **Prerequisites:** Python 3.10+, Node.js 18+, a [Supabase](https://supabase.com) account (free tier)

### 1️⃣ Database — Supabase

1. Create a free project at [supabase.com](https://supabase.com) (sign in with GitHub).
2. In the dashboard, click **Connect** → **Session pooler** → **URI** tab. Copy the connection string.
3. Replace `[YOUR-PASSWORD]` with your database password.

> Use the **Session pooler** URL (not the Direct connection). Direct connection is IPv6-only on Supabase's free tier and most home networks can't reach it.

### 2️⃣ Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env                # then fill in the values below
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres
SECRET_KEY=                         # python -c "import secrets; print(secrets.token_urlsafe(64))"
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@cardioai.com
ADMIN_PASSWORD=                     # your choice
CORS_ORIGINS=http://localhost:3000
```

Apply migrations, seed the admin user, and start the API:

```bash
alembic upgrade head
python create_admin.py
uvicorn main:app --reload
```

API runs at **http://localhost:8000**. Swagger docs at **/docs**.

### 3️⃣ Frontend

```bash
cd heart-disease-prediction
npm install
cp .env.example .env.local          # default points at http://localhost:8000
npm run dev
```

App runs at **http://localhost:3000**.

---

## 🔑 Default Admin Login

After running `python create_admin.py`, the admin user is bootstrapped from `ADMIN_*` env vars.

| Field    | Value                                  |
| -------- | -------------------------------------- |
| URL      | http://localhost:8000/admin            |
| Username | `admin` (or `$ADMIN_USERNAME`)         |
| Password | whatever you set in `$ADMIN_PASSWORD`  |

To promote an existing user to admin:
```bash
python promote_admin.py <username_or_email>
```

---

## ☁️ Deployment (Free Tier)

| Layer    | Service              | Notes                                                |
| -------- | -------------------- | ---------------------------------------------------- |
| Frontend | **Vercel**           | Free, auto-deploys from GitHub                       |
| Backend  | **Render**           | Free web service (sleeps after 15min idle)           |
| Database | **Supabase**         | 500MB Postgres permanently free                      |

**Backend on Render:**

1. Push the repo to GitHub.
2. Render → New → Web Service → connect the repo, root directory `backend`.
3. Environment: **Docker** (the included `Dockerfile` runs migrations + starts uvicorn).
4. Add env vars: `DATABASE_URL`, `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS` (set to your Vercel URL).
5. Deploy.

**Frontend on Vercel:**

1. Vercel → New Project → import the repo, root directory `heart-disease-prediction`.
2. Env var: `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://cardiopredict-api.onrender.com`).
3. Deploy.

After both are up, update Render's `CORS_ORIGINS` to include the Vercel domain so the browser can hit the API.

---

## 🏗 Project Structure

```
.
├── backend/                      # FastAPI + ML + Alembic
│   ├── main.py                   # App entry point
│   ├── admin.py                  # /admin panel (sqladmin)
│   ├── alembic/                  # DB migrations
│   ├── controllers/              # Auth + prediction logic
│   ├── database/models/          # SQLAlchemy models
│   ├── ml/                       # Training script + saved model
│   ├── routes/                   # API routes
│   ├── create_admin.py           # Bootstrap admin from env
│   ├── promote_admin.py          # Promote any user to admin
│   ├── Dockerfile                # For Render deploy
│   └── .env.example
│
└── heart-disease-prediction/     # Next.js frontend
    ├── app/                      # Routes (auth, dashboard, predict, results, history…)
    ├── components/               # Shared Field, Button, RiskBadge
    └── .env.example
```

---

## 🛠 Useful URLs

| Path                          | Description                            |
| ----------------------------- | -------------------------------------- |
| `/`                           | Landing page                           |
| `/login`                      | Sign in / Register                     |
| `/dashboard`                  | Stats + recent predictions             |
| `/predict`                    | New prediction form                    |
| `/history`                    | Prediction history + CSV export        |
| `http://localhost:8000/docs`  | Swagger API docs                       |
| `http://localhost:8000/admin` | Admin panel (Users, Patients, Reports) |

---

## 📝 Retraining the Model

```bash
cd backend
source venv/bin/activate
python ml/train_model.py
```

Trained artifacts are written to `backend/ml/saved_models/` and a metrics summary to `models_summary.json`.

---

## 👤 Author

**Asif Nawaz Mughal**
GitHub: [@asifnawazmughal](https://github.com/asifnawazmughal)
