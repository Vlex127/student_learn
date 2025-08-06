#!/usr/bin/env python3
"""
Script to create an admin user for the StudentLearn application.
Run this script to create the first admin user or additional admin users.
"""

import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.database import get_db, engine
from app.models import Base, User
from app.auth import get_password_hash
from sqlalchemy.orm import Session

def create_admin_user(email: str, full_name: str, password: str, db: Session) -> User:
    """Create an admin user in the database"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"User with email {email} already exists!")
        if existing_user.is_admin:
            print("This user is already an admin.")
        else:
            # Make existing user an admin
            existing_user.is_admin = True
            db.commit()
            print(f"User {email} has been promoted to admin.")
        return existing_user
    
    # Create new admin user
    hashed_password = get_password_hash(password)
    admin_user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_admin=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print(f"Admin user created successfully!")
    print(f"Email: {email}")
    print(f"Name: {full_name}")
    print(f"Admin: Yes")
    
    return admin_user

def main():
    """Main function to create admin user"""
    
    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    print("=== StudentLearn Admin User Creator ===")
    print()
    
    # Get user input
    email = input("Enter admin email: ").strip()
    if not email:
        print("Email is required!")
        return
    
    full_name = input("Enter admin full name: ").strip()
    if not full_name:
        print("Full name is required!")
        return
    
    password = input("Enter admin password: ").strip()
    if not password:
        print("Password is required!")
        return
    
    confirm_password = input("Confirm admin password: ").strip()
    if password != confirm_password:
        print("Passwords do not match!")
        return
    
    if len(password) < 6:
        print("Password must be at least 6 characters long!")
        return
    
    # Create admin user
    try:
        db = next(get_db())
        admin_user = create_admin_user(email, full_name, password, db)
        print()
        print("=== Admin User Created Successfully ===")
        print(f"ID: {admin_user.id}")
        print(f"Email: {admin_user.email}")
        print(f"Name: {admin_user.full_name}")
        print(f"Admin: {admin_user.is_admin}")
        print(f"Active: {admin_user.is_active}")
        print(f"Created: {admin_user.created_at}")
        print()
        print("You can now use these credentials to log in to the admin panel.")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        return
    finally:
        db.close()

if __name__ == "__main__":
    main()