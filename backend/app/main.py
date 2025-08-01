from fastapi import FastAPI, Depends, HTTPException, status
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
from app.crud import create_user, get_user_by_email, get_users, get_subjects

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

@app.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_subjects(db)

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

from mangum import Mangum
application = Mangum(app)