from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

import os
from dotenv import load_dotenv

from app.database import get_db, engine
from app.models import Base, SubjectContent, Lesson
from app.schemas import UserCreate, UserResponse, LoginRequest, TokenResponse, SubjectResponse, SubjectContentResponse, LessonResponse, LessonCreate
from app.auth import create_access_token, get_current_user, authenticate_user, get_password_hash
from app.crud import create_user, get_user_by_email, get_users, get_subjects, create_subject, delete_subject, get_subject_by_id, enroll_user_in_subject, unenroll_user_from_subject, get_user_enrolled_subjects, is_user_enrolled

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudentLearn API",
    description="Backend API for StudentLearn - Smart Practice Platform",
    version="1.0.0"
)

# CORS middleware - get origins from environment
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

@app.get("/")
async def root():
    return {"message": "Welcome to StudentLearn API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "studentlearn-api"}

@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user = create_user(db, user_data)
    return user

@app.post("/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login")
def api_login(data: dict = Body(...), db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "is_admin": user.is_admin,
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)

@app.get("/practice/subjects")
async def get_practice_subjects():
    """Get available practice subjects"""
    return {
        "subjects": [
            {"id": 1, "name": "Mathematics", "description": "Algebra, Calculus, Geometry"},
            {"id": 2, "name": "Physics", "description": "Mechanics, Thermodynamics, Electromagnetism"},
            {"id": 3, "name": "Chemistry", "description": "Organic, Inorganic, Physical Chemistry"},
            {"id": 4, "name": "Biology", "description": "Cell Biology, Genetics, Ecology"},
            {"id": 5, "name": "Computer Science", "description": "Programming, Algorithms, Data Structures"}
        ]
    }

@app.get("/practice/questions/{subject_id}")
async def get_practice_questions(subject_id: int, limit: int = 10):
    """Get practice questions for a specific subject"""
    # Mock questions - in real app, fetch from database
    questions = [
        {
            "id": 1,
            "question": "What is the derivative of x²?",
            "options": ["x", "2x", "x²", "2x²"],
            "correct_answer": 1,
            "explanation": "The derivative of x² is 2x using the power rule."
        },
        {
            "id": 2,
            "question": "Solve for x: 2x + 5 = 13",
            "options": ["3", "4", "5", "6"],
            "correct_answer": 1,
            "explanation": "2x + 5 = 13 → 2x = 8 → x = 4"
        }
    ]
    return {"questions": questions[:limit]}

@app.get("/users", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Only allow admins to access this endpoint
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_users(db)

# Public endpoint for library courses
@app.get("/library/courses", response_model=List[SubjectResponse])
async def get_library_courses(db: Session = Depends(get_db)):
    """Get all active subjects/courses for the library page (public endpoint)"""
    return get_subjects(db)

# Get a single subject by ID
@app.get("/subjects/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get details of a specific subject/course"""
    db_subject = get_subject_by_id(db, subject_id=subject_id)
    if db_subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check if subject is active or user is admin
    if not db_subject.is_active and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="This course is not available")
        
    return db_subject

@app.post("/library/courses", response_model=SubjectResponse)
async def create_library_course(
    subject_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new course in the library (available to all authenticated users)"""
    name = subject_data.get("name")
    description = subject_data.get("description")
    
    if not name:
        raise HTTPException(status_code=400, detail="Course name is required")
    
    # Optional: Add length validation
    if len(name.strip()) < 3:
        raise HTTPException(status_code=400, detail="Course name must be at least 3 characters long")
    
    if description and len(description.strip()) > 500:
        raise HTTPException(status_code=400, detail="Course description must be less than 500 characters")
    
    try:
        new_subject = create_subject(db, name=name.strip(), description=description.strip() if description else None)
        return new_subject
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create course: {str(e)}")

@app.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_subjects(db)

@app.post("/subjects", response_model=SubjectResponse)
async def create_new_subject(
    subject_data: dict,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Create a new subject/course (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    name = subject_data.get("name")
    description = subject_data.get("description")
    
    if not name:
        raise HTTPException(status_code=400, detail="Subject name is required")
    
    try:
        new_subject = create_subject(db, name=name, description=description)
        return new_subject
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create subject: {str(e)}")

@app.delete("/subjects/{subject_id}")
async def delete_subject_endpoint(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a subject/course (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if subject exists
    subject = get_subject_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    try:
        success = delete_subject(db, subject_id)
        if success:
            return {"message": "Subject deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to delete subject")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete subject: {str(e)}")

@app.post("/subjects/{subject_id}/contents")
async def add_content(subject_id: int, content: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    new_content = SubjectContent(subject_id=subject_id, title=content["title"], body=content["body"])
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return new_content

@app.get("/subjects/{subject_id}/contents")
async def get_contents(subject_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(SubjectContent).filter(SubjectContent.subject_id == subject_id).all()

@app.get("/contents/{content_id}/lessons", response_model=List[LessonResponse])
async def get_lessons(content_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Lesson).filter(Lesson.content_id == content_id).all()

@app.post("/contents/{content_id}/lessons", response_model=LessonResponse)
async def add_lesson(content_id: int, lesson: LessonCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    new_lesson = Lesson(content_id=content_id, title=lesson.title, body=lesson.body)
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

# User Enrollment Endpoints
@app.post("/enrollments/{subject_id}")
async def enroll_in_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Enroll current user in a subject"""
    # Check if subject exists
    subject = get_subject_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    if not subject.is_active:
        raise HTTPException(status_code=400, detail="Subject is not active")
    
    try:
        enrollment = enroll_user_in_subject(db, current_user.id, subject_id)
        return {
            "message": "Successfully enrolled in course",
            "subject_name": subject.name,
            "enrolled_at": enrollment.enrolled_at
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to enroll: {str(e)}")

@app.delete("/enrollments/{subject_id}")
async def unenroll_from_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Remove current user's enrollment from a subject"""
    try:
        success = unenroll_user_from_subject(db, current_user.id, subject_id)
        if success:
            return {"message": "Successfully unenrolled from course"}
        else:
            raise HTTPException(status_code=400, detail="Not enrolled in this course")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to unenroll: {str(e)}")

@app.get("/my-courses", response_model=List[SubjectResponse])
async def get_my_enrolled_courses(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all courses the current user is enrolled in"""
    try:
        enrolled_subjects = get_user_enrolled_subjects(db, current_user.id)
        return enrolled_subjects
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch enrolled courses: {str(e)}")

@app.get("/enrollments/check/{subject_id}")
async def check_enrollment_status(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Check if current user is enrolled in a specific subject"""
    try:
        is_enrolled = is_user_enrolled(db, current_user.id, subject_id)
        return {"is_enrolled": is_enrolled}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to check enrollment: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

from mangum import Mangum
application = Mangum(app)