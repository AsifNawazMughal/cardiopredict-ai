<div align="center">

# ❤️ CardioPredict AI

### Heart Disease Risk Assessment System

A full-stack AI-powered web application that classifies patient heart disease risk as **Low**, **Medium**, or **High** using deep learning and the UCI Heart Disease dataset.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208-4479A1)](https://www.mysql.com/)
[![TensorFlow](https://img.shields.io/badge/ML-TensorFlow%202.17-FF6F00)](https://www.tensorflow.org/)

</div>

---

## ✨ Features

- 👨‍⚕️ Healthcare professional accounts with patient management
- 🩺 Risk prediction across 3 ML models (ANN, Logistic Regression, Random Forest)
- 📊 Interactive dashboard with charts and history
- 📄 PDF / CSV export of prediction reports
- 🛠 Admin panel at `/admin` with role-based access

## 📈 Model Performance

> Trained on UCI Cleveland + Hungarian datasets (~600 samples, 80/20 train/test split)

| Model                   | Accuracy | F1 Score | ROC-AUC    |
| ----------------------- | :------: | :------: | :--------: |
| **ANN (Deep Learning)** | **77.5%** | **0.77** | **0.917** |
| Logistic Regression     | 76.7%    | 0.76     | 0.910      |
| Random Forest           | 76.7%    | 0.75     | 0.905      |

---

## 🚀 Quick Start

> **Prerequisites:** Python 3.10+, Node.js 18+, MySQL 8

### 1️⃣ Database

<details>
<summary><b>Install MySQL</b> (Ubuntu / macOS)</summary>

**Ubuntu / Debian**
```bash
sudo apt update && sudo apt install mysql-server
sudo systemctl start mysql && sudo systemctl enable mysql
```

**macOS (Homebrew)**
```bash
brew install mysql && brew services start mysql
```
</details>

Open the MySQL shell and create the database + user:

```bash
sudo mysql
```
```sql
CREATE DATABASE IF NOT EXISTS heart_disease_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP USER IF EXISTS 'heartuser'@'localhost';
CREATE USER 'heartuser'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON heart_disease_db.* TO 'heartuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2️⃣ Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # then edit DATABASE_URL with your password
python create_admin.py              # creates the default admin account
uvicorn main:app --reload
```

API runs at **http://localhost:8000**.

### 3️⃣ Frontend

```bash
cd heart-disease-prediction
npm install
npm run dev
```

App runs at **http://localhost:3000**.

---

## 🔑 Default Admin Login

After running `python create_admin.py`, an admin account is bootstrapped:

| Field    | Value                |
| -------- | -------------------- |
| **URL**  | http://localhost:8000/admin |
| **Username** | `admin`          |
| **Email**    | `admin@cardioai.com` |
| **Password** | `Admin@321`      |

> ⚠️ **Change this password immediately** in production. Edit `ADMIN_PASSWORD` in [`backend/create_admin.py`](backend/create_admin.py) and re-run the script.

To promote any existing user to admin instead:
```bash
python promote_admin.py <username_or_email>
```

---

## 🏗 Project Structure

```
.
├── backend/                      # FastAPI + ML
│   ├── main.py                   # App entry point
│   ├── admin.py                  # /admin panel (sqladmin)
│   ├── controllers/              # Auth + prediction logic
│   ├── database/models/          # SQLAlchemy models
│   ├── ml/                       # Training script + saved models
│   ├── routes/                   # API routes
│   ├── create_admin.py           # Bootstrap default admin
│   ├── promote_admin.py          # Promote any user to admin
│   └── .env.example
│
└── heart-disease-prediction/     # Next.js frontend
    ├── app/                      # Routes (auth, dashboard, predict, results, history…)
    ├── components/               # Shared Field, Button, RiskBadge
    └── package.json
```

---

## 🛠 Useful Endpoints

| Path                   | Description                          |
| ---------------------- | ------------------------------------ |
| `/`                    | Landing page                         |
| `/login`               | Sign in / Register (frontend)        |
| `/dashboard`           | Stats + recent predictions           |
| `/predict`             | New prediction form                  |
| `/history`             | Prediction history + CSV export      |
| `http://localhost:8000/docs`     | Swagger API docs                     |
| `http://localhost:8000/admin`    | Admin panel (Users, Patients, Reports) |

---

## 📝 Retraining the Model

```bash
cd backend
source venv/bin/activate
python ml/train_model.py
```

Trained artifacts are saved to `backend/ml/saved_models/` and a metrics summary is written to `models_summary.json`.

---

## 👤 Author

**Asif Nawaz Mughal**
GitHub: [@asifnawazmughal](https://github.com/asifnawazmughal)
pip install -r requirements.txt