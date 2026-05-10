"""
Create or reset the default admin user.

Edit ADMIN_PASSWORD below and re-run this script to change the password.
The script is idempotent — running it twice is safe; it just updates the existing
admin's password instead of creating a duplicate.

Usage:
    python create_admin.py
"""
from database.db import SessionLocal
from database.models.user import User, UserRole
from controllers.auth_controller import hash_password

ADMIN_USERNAME = "admin"
ADMIN_EMAIL    = "admin@cardioai.com"
ADMIN_PASSWORD = "Admin@321"


def main():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(
            (User.username == ADMIN_USERNAME) | (User.email == ADMIN_EMAIL)
        ).first()

        if existing:
            existing.hashed_password = hash_password(ADMIN_PASSWORD)
            existing.role = UserRole.admin
            existing.is_active = True
            db.commit()
            print(f"Updated existing admin: {existing.username} ({existing.email})")
            print(f"  Password reset to the value in this script.")
        else:
            admin = User(
                username=ADMIN_USERNAME,
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                role=UserRole.admin,
                is_active=True,
                first_name="System",
                last_name="Admin",
            )
            db.add(admin)
            db.commit()
            print(f"Created admin user:")
            print(f"  Username: {ADMIN_USERNAME}")
            print(f"  Email:    {ADMIN_EMAIL}")
            print(f"  Password: {ADMIN_PASSWORD}")

        print("Log in at http://localhost:8000/admin")
    finally:
        db.close()


if __name__ == "__main__":
    main()
