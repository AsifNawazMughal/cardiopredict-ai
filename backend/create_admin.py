"""
Create or reset the default admin user.

Reads credentials from environment variables (or .env):
    ADMIN_USERNAME  (default: admin)
    ADMIN_EMAIL     (default: admin@cardioai.com)
    ADMIN_PASSWORD  (required — no default)

The script is idempotent — running it twice is safe; it just updates the existing
admin's password instead of creating a duplicate.

Usage:
    python create_admin.py
"""
import os
import sys
from dotenv import load_dotenv

from database.db import SessionLocal
from database.models.user import User, UserRole
from controllers.auth_controller import hash_password

load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL", "admin@cardioai.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


def main():
    if not ADMIN_PASSWORD:
        sys.exit(
            "ERROR: ADMIN_PASSWORD environment variable is not set.\n"
            "Set it in backend/.env or export it before running this script."
        )

    db = SessionLocal()
    try:
        existing = db.query(User).filter(
            (User.username == ADMIN_USERNAME) | (User.email == ADMIN_EMAIL)
        ).first()

        if existing:
            existing.hashed_password = hash_password(ADMIN_PASSWORD)
            existing.role = UserRole.admin
            existing.is_active = True
            existing.email_verified = True
            db.commit()
            print(f"Updated existing admin: {existing.username} ({existing.email})")
            print("  Password reset to the value in ADMIN_PASSWORD.")
        else:
            admin = User(
                username=ADMIN_USERNAME,
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                role=UserRole.admin,
                is_active=True,
                email_verified=True,
                first_name="System",
                last_name="Admin",
            )
            db.add(admin)
            db.commit()
            print("Created admin user:")
            print(f"  Username: {ADMIN_USERNAME}")
            print(f"  Email:    {ADMIN_EMAIL}")

        print("Log in at http://localhost:8000/admin")
    finally:
        db.close()


if __name__ == "__main__":
    main()
