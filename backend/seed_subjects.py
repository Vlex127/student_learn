#!/usr/bin/env python3
"""
Seed script to add sample subjects/courses to the database
This ensures the library page has data to display
"""

import sys
import os
from sqlalchemy.orm import Session

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import SessionLocal, engine
from app.models import Subject

def seed_subjects():
    """Add sample subjects/courses to the database"""
    db = SessionLocal()
    try:
        print("🌱 Seeding subjects/courses for library...")
        
        # Check if subjects already exist
        existing_count = db.query(Subject).count()
        print(f"📊 Current subjects in database: {existing_count}")
        
        # Sample subjects/courses data
        sample_subjects = [
            {
                "name": "Mathematics Fundamentals",
                "description": "Core mathematical concepts including algebra, geometry, and basic calculus. Perfect for building a strong foundation in mathematical thinking.",
                "is_active": True
            },
            {
                "name": "Computer Science Basics",
                "description": "Introduction to programming, algorithms, and data structures. Learn the fundamentals of computer science and software development.",
                "is_active": True
            },
            {
                "name": "Physics Principles",
                "description": "Classical mechanics, thermodynamics, and electromagnetism. Explore the fundamental laws that govern our physical world.",
                "is_active": True
            },
            {
                "name": "English Literature",
                "description": "Analysis of classic and contemporary literature. Develop critical thinking and writing skills through literary exploration.",
                "is_active": True
            },
            {
                "name": "Biology Essentials",
                "description": "Cell biology, genetics, and ecology. Understanding life processes and biological systems from molecular to ecosystem levels.",
                "is_active": True
            },
            {
                "name": "Chemistry Foundations",
                "description": "Atomic structure, chemical bonding, and reactions. Master the principles of matter and its transformations.",
                "is_active": True
            },
            {
                "name": "History & Social Studies",
                "description": "World history, government, and social systems. Understand how societies develop and interact throughout time.",
                "is_active": True
            },
            {
                "name": "Art & Design",
                "description": "Visual arts, design principles, and creative expression. Develop artistic skills and aesthetic understanding.",
                "is_active": True
            }
        ]
        
        # Add subjects if database is empty or has few subjects
        if existing_count < 3:
            print("➕ Adding sample subjects...")
            
            for subject_data in sample_subjects:
                # Check if subject with this name already exists
                existing = db.query(Subject).filter(Subject.name == subject_data["name"]).first()
                
                if not existing:
                    subject = Subject(**subject_data)
                    db.add(subject)
                    print(f"  ✅ Added: {subject_data['name']}")
                else:
                    print(f"  ⏭️  Skipped (exists): {subject_data['name']}")
            
            db.commit()
            print("✅ Sample subjects added successfully!")
        else:
            print("✅ Database already has subjects, skipping seed")
        
        # Show final count
        final_count = db.query(Subject).count()
        print(f"📊 Total subjects in database: {final_count}")
        
        # Display current subjects
        print("\n📚 Current subjects in database:")
        subjects = db.query(Subject).filter(Subject.is_active == True).all()
        for subject in subjects:
            status = "🟢" if subject.is_active else "🔴"
            print(f"  {status} ID: {subject.id} - {subject.name}")
            if subject.description:
                print(f"     📝 {subject.description[:80]}...")
        
    except Exception as e:
        print(f"❌ Error seeding subjects: {e}")
        db.rollback()
    finally:
        db.close()

def test_library_endpoint():
    """Test the /library/courses endpoint"""
    print("\n🔍 Testing /library/courses endpoint...")
    try:
        import requests
        response = requests.get("http://localhost:8000/library/courses")
        
        if response.status_code == 200:
            courses = response.json()
            print(f"✅ Endpoint working! Found {len(courses)} courses")
            for course in courses[:3]:  # Show first 3
                print(f"  📚 {course['name']} (ID: {course['id']})")
        else:
            print(f"❌ Endpoint returned status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")
        print("Make sure the backend server is running on port 8000")

if __name__ == "__main__":
    print("🚀 StudentLearn Subject Seeder")
    print("=" * 40)
    
    try:
        # Test database connection
        with engine.connect() as conn:
            print("✅ Database connection successful")
        
        # Seed subjects
        seed_subjects()
        
        # Test the endpoint
        test_library_endpoint()
        
        print("\n🎉 Seeding completed!")
        print("\n💡 Next steps:")
        print("1. Make sure your backend server is running")
        print("2. Navigate to the library page in your frontend")
        print("3. You should now see courses loaded from the backend")
        
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        print("Make sure your database file exists and is accessible")
