#!/bin/bash
# ============================================================
# SETUP AND RUN SCRIPT
# Run this once to install everything and start the backend.
#
# HOW TO USE:
#   chmod +x setup_and_run.sh
#   ./setup_and_run.sh
# ============================================================

set -e  # stop if any command fails

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Heart Disease Prediction — Backend Setup       ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Create virtual environment ──────────────────────
# CONCEPT: Virtual Environment
# Python projects use "virtual environments" to isolate dependencies.
# It's like a separate folder for this project's Python packages,
# so they don't conflict with other projects on your computer.
echo "📦 Step 1: Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "   ✅ Virtual environment created"
else
    echo "   ℹ️  Virtual environment already exists"
fi

# ── Step 2: Activate and install packages ───────────────────
echo ""
echo "📥 Step 2: Installing Python packages..."
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt
echo "   ✅ All packages installed"

# ── Step 3: Check MySQL ──────────────────────────────────────
echo ""
echo "🔍 Step 3: Checking MySQL..."
if command -v mysql &> /dev/null; then
    echo "   ✅ MySQL is installed"
    echo ""
    echo "   ⚠️  Make sure you've created the database:"
    echo "   Run in terminal:  mysql -u root -p"
    echo "   Then type:        CREATE DATABASE heart_disease_db;"
    echo "   Then type:        EXIT;"
    echo ""
    echo "   ⚠️  Also update .env file with your MySQL password!"
else
    echo "   ❌ MySQL not found!"
    echo "   Install it with:  sudo apt install mysql-server"
    echo "   Then create DB:   mysql -u root -p"
    echo "                     CREATE DATABASE heart_disease_db;"
fi

# ── Step 4: Train models ─────────────────────────────────────
echo ""
echo "🧠 Step 4: Checking ML models..."
if [ -f "ml/saved_models/ann_model.keras" ]; then
    echo "   ✅ Models already trained!"
else
    echo "   🔄 Training AI models (this takes 3-5 minutes)..."
    python ml/train_model.py
    echo "   ✅ Models trained and saved!"
fi

# ── Step 5: Start server ─────────────────────────────────────
echo ""
echo "🚀 Step 5: Starting FastAPI server..."
echo ""
echo "   Server will be at:  http://localhost:8000"
echo "   API docs at:        http://localhost:8000/docs"
echo "   Press Ctrl+C to stop"
echo ""

python main.py
