#!/usr/bin/env python3
"""
Database cleanup script for StudentLearn backend
Fixes invalid user data that causes API validation errors
"""

import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import SessionLocal, engine
from app.models import User

def cleanup_invalid_users():
    """Clean up users with invalid email addresses"""
    db = SessionLocal()
    try:
        print("🔍 Checking for invalid user data...")
        
        # Find users with invalid emails (empty, null, or without @)
        invalid_users = db.query(User).filter(
            (User.email == '') | 
            (User.email == None) | 
            (~User.email.contains('@'))
        ).all()
        
        print(f"Found {len(invalid_users)} users with invalid email addresses")
        
        if invalid_users:
            print("\n📋 Invalid users found:")
            for user in invalid_users:
                print(f"  - ID: {user.id}, Email: '{user.email}', Name: '{user.full_name}'")
            
            choice = input("\n❓ Do you want to fix these users? (y/n): ").lower().strip()
            
            if choice == 'y':
                for i, user in enumerate(invalid_users):
                    if not user.email or user.email == '':
                        # Generate a placeholder email based on user ID and name
                        safe_name = ''.join(c for c in user.full_name.lower() if c.isalnum())[:10]
                        new_email = f"{safe_name}_{user.id}@placeholder.local"
                    else:
                        # Fix malformed emails by adding @placeholder.local if missing @
                        if '@' not in user.email:
                            new_email = f"{user.email}@placeholder.local"
                        else:
                            new_email = user.email
                    
                    print(f"  ✅ Fixing user {user.id}: '{user.email}' → '{new_email}'")
                    user.email = new_email
                
                db.commit()
                print(f"\n✅ Successfully fixed {len(invalid_users)} users!")
            else:
                print("❌ Cleanup cancelled")
        else:
            print("✅ No invalid users found!")
            
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

def check_database_integrity():
    """Check overall database integrity"""
    db = SessionLocal()
    try:
        print("\n🔍 Checking database integrity...")
        
        # Count total users
        total_users = db.query(User).count()
        print(f"📊 Total users in database: {total_users}")
        
        # Check for users with valid emails
        valid_users = db.query(User).filter(User.email.contains('@')).count()
        print(f"📧 Users with valid emails: {valid_users}")
        
        # Check for admin users
        admin_users = db.query(User).filter(User.is_admin == True).count()
        print(f"👑 Admin users: {admin_users}")
        
        if total_users > 0:
            print("\n📋 Sample of current users:")
            sample_users = db.query(User).limit(5).all()
            for user in sample_users:
                status = "✅" if '@' in (user.email or '') else "❌"
                admin_badge = "👑" if user.is_admin else "👤"
                print(f"  {status} {admin_badge} ID: {user.id}, Email: '{user.email}', Name: '{user.full_name}'")
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
    finally:
        db.close()

def create_test_admin():
    """Create a test admin user if none exists"""
    db = SessionLocal()
    try:
        # Check if any admin exists
        admin_count = db.query(User).filter(User.is_admin == True).count()
        
        if admin_count == 0:
            print("\n👑 No admin users found. Creating test admin...")
            
            from app.auth import get_password_hash
            
            test_admin = User(
                email="admin@test.com",
                full_name="Test Admin",
                hashed_password=get_password_hash("admin123"),
                is_admin=True,
                is_active=True
            )
            
            db.add(test_admin)
            db.commit()
            db.refresh(test_admin)
            
            print(f"✅ Created test admin user:")
            print(f"   Email: admin@test.com")
            print(f"   Password: admin123")
            print(f"   ID: {test_admin.id}")
        else:
            print(f"✅ Found {admin_count} admin user(s)")
            
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 StudentLearn Database Cleanup Tool")
    print("=" * 40)
    
    try:
        # Test database connection
        with engine.connect() as conn:
            print("✅ Database connection successful")
        
        # Run cleanup steps
        check_database_integrity()
        cleanup_invalid_users()
        create_test_admin()
        
        print("\n🎉 Database cleanup completed!")
        print("\n💡 Next steps:")
        print("1. Restart your backend server")
        print("2. Try accessing the admin panel again")
        print("3. Login with admin@test.com / admin123 if needed")
        
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        print("Make sure your database file exists and is accessible")
