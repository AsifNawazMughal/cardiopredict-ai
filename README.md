# CardioPredict AI — Heart Disease Prediction System

A full-stack AI-powered Heart Disease prediction web application.

- **Frontend**: Next.js 14 (App Router)
- **Backend**: FastAPI (Python)
- **Database**: MySQL 8
- **ML Model**: Artificial Neural Network (ANN) trained on the Cleveland Heart Disease dataset

---

## Project Structure

```
├── backend/                       # FastAPI backend + ML model
│   ├── main.py
│   ├── controllers/
│   ├── database/
│   ├── ml/
│   ├── routes/
│   ├── schemas/
│   ├── .env.example
│   └── requirements.txt
│
└── heart-disease-prediction/      # Next.js frontend
    ├── app/
    ├── components/
    └── package.json
```

---

## 1. Database Setup (MySQL)

### Install and start MySQL

**Ubuntu / Debian**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS (Homebrew)**
```bash
brew install mysql
brew services start mysql
```

### Create the database and user

Open the MySQL shell as root:
```bash
sudo mysql
```

Run the following (replace `your_password_here` with your own — keep it simple, letters and digits only, to avoid URL-encoding issues):
```sql
CREATE DATABASE IF NOT EXISTS heart_disease_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP USER IF EXISTS 'heartuser'@'localhost';
CREATE USER 'heartuser'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON heart_disease_db.* TO 'heartuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Verify the credentials work

```bash
mysql -u heartuser -p heart_disease_db
```
Type the password (nothing appears as you type — that's normal). You should land in `mysql>`. Type `EXIT;` to leave.

> **MySQL Workbench tip:** On Ubuntu, the default `root` connection often fails with "Access denied" because root authenticates via Unix socket. Create a Workbench connection as `heartuser` (host `127.0.0.1`, port `3306`, default schema `heart_disease_db`) instead.

---

## 2. Run the Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set the password you created in step 1:
```
DATABASE_URL=mysql+pymysql://heartuser:your_password_here@localhost:3306/heart_disease_db
SECRET_KEY=replace-with-a-long-random-string
```

Then start the server:
```bash
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. On first startup you should see `Database tables created/verified` — SQLAlchemy auto-creates all tables from the models.

> The `mysql+pymysql://` prefix tells SQLAlchemy to use **PyMySQL** (already in `requirements.txt`). Plain `mysql://` would try to load `MySQLdb` and fail with `ModuleNotFoundError: No module named 'MySQLdb'`.

---

## 3. Run the Frontend (Next.js)

```bash
cd heart-disease-prediction
npm install
npm run dev
```

App runs at `http://localhost:3000`.

If your backend is on a non-default URL, create `heart-disease-prediction/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Author

**Asif Nawaz Mughal**
GitHub: [@asifnawazmughal](https://github.com/asifnawazmughal)
