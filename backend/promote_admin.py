"""
Promote an existing user to admin.

Usage:
    python promote_admin.py <username_or_email>

Example:
    python promote_admin.py asifnawaz
    python promote_admin.py doctor@hospital.com
"""
import sys
from database.db import SessionLocal
from database.models.user import User, UserRole


def main():
    if len(sys.argv) != 2:
        print("Usage: python promote_admin.py <username_or_email>")
        sys.exit(1)

    target = sys.argv[1].strip()
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            (User.username == target) | (User.email == target)
        ).first()

        if not user:
            print(f"No user found with username/email: {target}")
            sys.exit(1)

        if user.role == UserRole.admin:
            print(f"{user.username} ({user.email}) is already an admin.")
            return

        user.role = UserRole.admin
        db.commit()
        print(f"Promoted {user.username} ({user.email}) to admin.")
        print("Log in at http://localhost:8000/admin")
    finally:
        db.close()


if __name__ == "__main__":
    main()
