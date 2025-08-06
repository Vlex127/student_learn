from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional

import os
from dotenv import load_dotenv

from app.database import get_db, engine
from app.models import Base, SubjectContent, Lesson, User, Subject, Question, PracticeSession, QuestionAttempt, UserEnrollment
from app.schemas import UserCreate, UserResponse, LoginRequest, TokenResponse, SubjectResponse, SubjectContentResponse, LessonResponse, LessonCreate, QuestionResponse, QuestionCreate, QuestionWithAnswer
from app.auth import create_access_token, get_current_user, authenticate_user, get_password_hash
from app.crud import create_user, get_user_by_email, get_users, get_subjects, create_subject, delete_subject, get_subject_by_id, enroll_user_in_subject, unenroll_user_from_subject, get_user_enrolled_subjects, is_user_enrolled, get_user, update_user, get_user_statistics, create_question, get_question
from sqlalchemy import func

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

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login")
async def api_login(data: dict = Body(...), db: Session = Depends(get_db)):
    """API login endpoint for NextAuth integration"""
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "is_admin": user.is_admin,
        "access_token": access_token,
        "token_type": "bearer"
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

# Admin Functions

@app.get("/admin/users", response_model=List[UserResponse])
async def admin_list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all users (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return get_users(db, skip=skip, limit=limit)

@app.get("/admin/users/{user_id}", response_model=UserResponse)
async def admin_get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get specific user details (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/admin/users/{user_id}")
async def admin_update_user(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update user information (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Allowed fields for admin update
    allowed_fields = ["full_name", "is_active", "is_admin"]
    update_data = {k: v for k, v in user_data.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    try:
        updated_user = update_user(db, user_id, **update_data)
        return {"message": "User updated successfully", "user": UserResponse.from_orm(updated_user)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update user: {str(e)}")

@app.delete("/admin/users/{user_id}")
async def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a user (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Soft delete by setting is_active to False
        update_user(db, user_id, is_active=False)
        return {"message": "User deactivated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to deactivate user: {str(e)}")

@app.get("/admin/statistics")
async def admin_get_statistics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get system-wide statistics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Total users
        total_users = db.query(func.count(User.id)).scalar()
        active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
        admin_users = db.query(func.count(User.id)).filter(User.is_admin == True).scalar()
        
        # Total subjects and questions
        total_subjects = db.query(func.count(Subject.id)).scalar()
        active_subjects = db.query(func.count(Subject.id)).filter(Subject.is_active == True).scalar()
        total_questions = db.query(func.count(Question.id)).scalar()
        
        # Total practice sessions
        total_sessions = db.query(func.count(PracticeSession.id)).scalar()
        total_attempts = db.query(func.count(QuestionAttempt.id)).scalar()
        
        # Average scores
        avg_score = db.query(func.avg(PracticeSession.score)).scalar() or 0.0
        
        # Recent activity (last 7 days)
        from datetime import datetime, timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_sessions = db.query(func.count(PracticeSession.id)).filter(
            PracticeSession.completed_at >= week_ago
        ).scalar()
        
        recent_users = db.query(func.count(User.id)).filter(
            User.created_at >= week_ago
        ).scalar()
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "admins": admin_users,
                "recent_registrations": recent_users
            },
            "content": {
                "total_subjects": total_subjects,
                "active_subjects": active_subjects,
                "total_questions": total_questions
            },
            "activity": {
                "total_sessions": total_sessions,
                "total_attempts": total_attempts,
                "average_score": round(avg_score, 2),
                "recent_sessions": recent_sessions
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@app.get("/admin/user/{user_id}/statistics")
async def admin_get_user_statistics(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed statistics for a specific user (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        stats = get_user_statistics(db, user_id)
        return {
            "user": UserResponse.from_orm(user),
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user statistics: {str(e)}")

@app.get("/admin/subjects/analytics")
async def admin_get_subjects_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get analytics for all subjects (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        subjects = get_subjects(db)
        analytics = []
        
        for subject in subjects:
            # Get enrollment count
            enrollment_count = db.query(func.count(UserEnrollment.id)).filter(
                UserEnrollment.subject_id == subject.id,
                UserEnrollment.is_active == True
            ).scalar()
            
            # Get question count
            question_count = db.query(func.count(Question.id)).filter(
                Question.subject_id == subject.id,
                Question.is_active == True
            ).scalar()
            
            # Get average score for this subject
            avg_score = db.query(func.avg(PracticeSession.score)).filter(
                PracticeSession.subject_id == subject.id
            ).scalar() or 0.0
            
            analytics.append({
                "subject": SubjectResponse.from_orm(subject),
                "enrollment_count": enrollment_count,
                "question_count": question_count,
                "average_score": round(avg_score, 2)
            })
        
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get subject analytics: {str(e)}")

@app.post("/admin/subjects/{subject_id}/toggle")
async def admin_toggle_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Toggle subject active status (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    subject = get_subject_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    try:
        new_status = not subject.is_active
        update_subject(db, subject_id, is_active=new_status)
        return {
            "message": f"Subject {'activated' if new_status else 'deactivated'} successfully",
            "is_active": new_status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to toggle subject: {str(e)}")

@app.post("/admin/users/{user_id}/toggle-admin")
async def admin_toggle_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Toggle user admin status (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot modify your own admin status")
    
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        new_admin_status = not user.is_admin
        update_user(db, user_id, is_admin=new_admin_status)
        return {
            "message": f"User {'promoted to admin' if new_admin_status else 'removed from admin'} successfully",
            "is_admin": new_admin_status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to toggle admin status: {str(e)}")

@app.get("/admin/enrollments")
async def admin_get_enrollments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all user enrollments (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        enrollments = db.query(UserEnrollment).join(User).join(Subject).filter(
            UserEnrollment.is_active == True
        ).all()
        
        enrollment_data = []
        for enrollment in enrollments:
            enrollment_data.append({
                "id": enrollment.id,
                "user": {
                    "id": enrollment.user.id,
                    "email": enrollment.user.email,
                    "full_name": enrollment.user.full_name
                },
                "subject": {
                    "id": enrollment.subject.id,
                    "name": enrollment.subject.name
                },
                "enrolled_at": enrollment.enrolled_at
            })
        
        return enrollment_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get enrollments: {str(e)}")

# Add missing CRUD function for subject updates
def update_subject(db: Session, subject_id: int, **kwargs) -> Optional[Subject]:
    """Update subject information"""
    db_subject = get_subject_by_id(db, subject_id)
    if db_subject:
        for key, value in kwargs.items():
            if hasattr(db_subject, key):
                setattr(db_subject, key, value)
        db.commit()
        db.refresh(db_subject)
    return db_subject

# Question Management Admin Functions

@app.post("/admin/questions", response_model=QuestionResponse)
async def admin_create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new question (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate subject exists
    subject = get_subject_by_id(db, question_data.subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    try:
        question = create_question(db, question_data)
        return question
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create question: {str(e)}")

@app.get("/admin/questions", response_model=List[QuestionResponse])
async def admin_list_questions(
    subject_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all questions with optional subject filter (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        query = db.query(Question)
        if subject_id:
            query = query.filter(Question.subject_id == subject_id)
        
        questions = query.offset(skip).limit(limit).all()
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get questions: {str(e)}")

@app.get("/admin/questions/{question_id}", response_model=QuestionWithAnswer)
async def admin_get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get specific question with answer (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    question = get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@app.put("/admin/questions/{question_id}")
async def admin_update_question(
    question_id: int,
    question_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a question (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    question = get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Allowed fields for update
    allowed_fields = ["question_text", "option_a", "option_b", "option_c", "option_d", 
                     "correct_answer", "explanation", "difficulty_level", "is_active"]
    update_data = {k: v for k, v in question_data.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    try:
        for key, value in update_data.items():
            setattr(question, key, value)
        db.commit()
        db.refresh(question)
        return {"message": "Question updated successfully", "question": QuestionWithAnswer.from_orm(question)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update question: {str(e)}")

@app.delete("/admin/questions/{question_id}")
async def admin_delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a question (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    question = get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    try:
        # Soft delete by setting is_active to False
        question.is_active = False
        db.commit()
        return {"message": "Question deactivated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete question: {str(e)}")

@app.post("/admin/questions/bulk-import")
async def admin_bulk_import_questions(
    questions_data: List[dict],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Bulk import questions (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not questions_data:
        raise HTTPException(status_code=400, detail="No questions provided")
    
    try:
        created_questions = []
        failed_questions = []
        
        for question_data in questions_data:
            try:
                # Validate required fields
                required_fields = ["subject_id", "question_text", "option_a", "option_b", 
                                 "option_c", "option_d", "correct_answer"]
                for field in required_fields:
                    if field not in question_data:
                        raise ValueError(f"Missing required field: {field}")
                
                # Validate subject exists
                subject = get_subject_by_id(db, question_data["subject_id"])
                if not subject:
                    raise ValueError(f"Subject with ID {question_data['subject_id']} not found")
                
                # Create question
                question = Question(
                    subject_id=question_data["subject_id"],
                    question_text=question_data["question_text"],
                    option_a=question_data["option_a"],
                    option_b=question_data["option_b"],
                    option_c=question_data["option_c"],
                    option_d=question_data["option_d"],
                    correct_answer=question_data["correct_answer"],
                    explanation=question_data.get("explanation"),
                    difficulty_level=question_data.get("difficulty_level", "medium"),
                    is_active=True
                )
                db.add(question)
                created_questions.append(question)
                
            except Exception as e:
                failed_questions.append({
                    "data": question_data,
                    "error": str(e)
                })
        
        db.commit()
        
        return {
            "message": f"Successfully imported {len(created_questions)} questions",
            "created_count": len(created_questions),
            "failed_count": len(failed_questions),
            "failed_questions": failed_questions
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to import questions: {str(e)}")

@app.get("/admin/questions/statistics")
async def admin_get_questions_statistics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get questions statistics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Total questions
        total_questions = db.query(func.count(Question.id)).scalar()
        active_questions = db.query(func.count(Question.id)).filter(Question.is_active == True).scalar()
        
        # Questions by difficulty
        easy_questions = db.query(func.count(Question.id)).filter(
            Question.difficulty_level == "easy",
            Question.is_active == True
        ).scalar()
        
        medium_questions = db.query(func.count(Question.id)).filter(
            Question.difficulty_level == "medium",
            Question.is_active == True
        ).scalar()
        
        hard_questions = db.query(func.count(Question.id)).filter(
            Question.difficulty_level == "hard",
            Question.is_active == True
        ).scalar()
        
        # Questions by subject
        subject_stats = db.query(
            Subject.name,
            func.count(Question.id).label('question_count')
        ).join(Question).filter(
            Question.is_active == True
        ).group_by(Subject.name).all()
        
        return {
            "total_questions": total_questions,
            "active_questions": active_questions,
            "by_difficulty": {
                "easy": easy_questions,
                "medium": medium_questions,
                "hard": hard_questions
            },
            "by_subject": [
                {"subject": name, "count": count} for name, count in subject_stats
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get question statistics: {str(e)}")

# Practice Session Management Admin Functions

@app.get("/admin/practice-sessions")
async def admin_get_practice_sessions(
    user_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get practice sessions with optional filters (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        query = db.query(PracticeSession).join(User).join(Subject)
        
        if user_id:
            query = query.filter(PracticeSession.user_id == user_id)
        if subject_id:
            query = query.filter(PracticeSession.subject_id == subject_id)
        
        sessions = query.order_by(PracticeSession.completed_at.desc()).offset(skip).limit(limit).all()
        
        session_data = []
        for session in sessions:
            session_data.append({
                "id": session.id,
                "user": {
                    "id": session.user.id,
                    "email": session.user.email,
                    "full_name": session.user.full_name
                },
                "subject": {
                    "id": session.subject.id,
                    "name": session.subject.name
                },
                "score": session.score,
                "total_questions": session.total_questions,
                "correct_answers": session.correct_answers,
                "time_taken": session.time_taken,
                "completed_at": session.completed_at
            })
        
        return session_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get practice sessions: {str(e)}")

@app.get("/admin/practice-sessions/{session_id}")
async def admin_get_practice_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed practice session with attempts (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        session = db.query(PracticeSession).filter(PracticeSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Practice session not found")
        
        # Get all attempts for this session
        attempts = db.query(QuestionAttempt).filter(
            QuestionAttempt.session_id == session_id
        ).join(Question).all()
        
        attempt_data = []
        for attempt in attempts:
            attempt_data.append({
                "id": attempt.id,
                "question": {
                    "id": attempt.question.id,
                    "question_text": attempt.question.question_text,
                    "correct_answer": attempt.question.correct_answer
                },
                "selected_answer": attempt.selected_answer,
                "is_correct": attempt.is_correct,
                "time_taken": attempt.time_taken,
                "attempted_at": attempt.attempted_at
            })
        
        return {
            "session": {
                "id": session.id,
                "user": {
                    "id": session.user.id,
                    "email": session.user.email,
                    "full_name": session.user.full_name
                },
                "subject": {
                    "id": session.subject.id,
                    "name": session.subject.name
                },
                "score": session.score,
                "total_questions": session.total_questions,
                "correct_answers": session.correct_answers,
                "time_taken": session.time_taken,
                "completed_at": session.completed_at
            },
            "attempts": attempt_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session details: {str(e)}")

@app.get("/admin/practice-analytics")
async def admin_get_practice_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comprehensive practice analytics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Overall statistics
        total_sessions = db.query(func.count(PracticeSession.id)).scalar()
        total_attempts = db.query(func.count(QuestionAttempt.id)).scalar()
        avg_score = db.query(func.avg(PracticeSession.score)).scalar() or 0.0
        avg_time = db.query(func.avg(PracticeSession.time_taken)).scalar() or 0.0
        
        # Recent activity (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_sessions = db.query(func.count(PracticeSession.id)).filter(
            PracticeSession.completed_at >= thirty_days_ago
        ).scalar()
        
        # Top performing users
        top_users = db.query(
            User.full_name,
            func.count(PracticeSession.id).label('session_count'),
            func.avg(PracticeSession.score).label('avg_score')
        ).join(PracticeSession).group_by(User.id, User.full_name).order_by(
            func.avg(PracticeSession.score).desc()
        ).limit(10).all()
        
        # Subject performance
        subject_performance = db.query(
            Subject.name,
            func.count(PracticeSession.id).label('session_count'),
            func.avg(PracticeSession.score).label('avg_score'),
            func.avg(PracticeSession.time_taken).label('avg_time')
        ).join(PracticeSession).group_by(Subject.id, Subject.name).all()
        
        # Daily activity for the last 7 days
        daily_activity = []
        for i in range(7):
            date = datetime.utcnow() - timedelta(days=i)
            start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            daily_sessions = db.query(func.count(PracticeSession.id)).filter(
                PracticeSession.completed_at >= start_date,
                PracticeSession.completed_at <= end_date
            ).scalar()
            
            daily_activity.append({
                "date": date.strftime("%Y-%m-%d"),
                "sessions": daily_sessions
            })
        
        daily_activity.reverse()  # Show oldest first
        
        return {
            "overall": {
                "total_sessions": total_sessions,
                "total_attempts": total_attempts,
                "average_score": round(avg_score, 2),
                "average_time": round(avg_time, 2),
                "recent_sessions": recent_sessions
            },
            "top_users": [
                {
                    "name": name,
                    "session_count": count,
                    "average_score": round(score, 2)
                } for name, count, score in top_users
            ],
            "subject_performance": [
                {
                    "subject": name,
                    "session_count": count,
                    "average_score": round(score, 2),
                    "average_time": round(time, 2)
                } for name, count, score, time in subject_performance
            ],
            "daily_activity": daily_activity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get practice analytics: {str(e)}")

@app.delete("/admin/practice-sessions/{session_id}")
async def admin_delete_practice_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a practice session (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        session = db.query(PracticeSession).filter(PracticeSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Practice session not found")
        
        # Delete related attempts first
        db.query(QuestionAttempt).filter(QuestionAttempt.session_id == session_id).delete()
        
        # Delete the session
        db.delete(session)
        db.commit()
        
        return {"message": "Practice session deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete practice session: {str(e)}")

@app.get("/admin/user/{user_id}/practice-history")
async def admin_get_user_practice_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get complete practice history for a user (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Get all practice sessions for the user
        sessions = db.query(PracticeSession).filter(
            PracticeSession.user_id == user_id
        ).join(Subject).order_by(PracticeSession.completed_at.desc()).all()
        
        # Get user statistics
        stats = get_user_statistics(db, user_id)
        
        session_data = []
        for session in sessions:
            session_data.append({
                "id": session.id,
                "subject": {
                    "id": session.subject.id,
                    "name": session.subject.name
                },
                "score": session.score,
                "total_questions": session.total_questions,
                "correct_answers": session.correct_answers,
                "time_taken": session.time_taken,
                "completed_at": session.completed_at
            })
        
        return {
            "user": UserResponse.from_orm(user),
            "statistics": stats,
            "practice_sessions": session_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user practice history: {str(e)}")

# System Management Admin Functions

@app.get("/admin/system/health")
async def admin_system_health(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed system health information (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Database health check
        db_health = "healthy"
        try:
            db.execute("SELECT 1")
        except Exception:
            db_health = "unhealthy"
        
        # Get system statistics
        total_users = db.query(func.count(User.id)).scalar()
        total_subjects = db.query(func.count(Subject.id)).scalar()
        total_questions = db.query(func.count(Question.id)).scalar()
        total_sessions = db.query(func.count(PracticeSession.id)).scalar()
        
        # Check for inactive content
        inactive_subjects = db.query(func.count(Subject.id)).filter(Subject.is_active == False).scalar()
        inactive_questions = db.query(func.count(Question.id)).filter(Question.is_active == False).scalar()
        
        # Recent activity (last 24 hours)
        from datetime import datetime, timedelta
        day_ago = datetime.utcnow() - timedelta(days=1)
        recent_users = db.query(func.count(User.id)).filter(User.created_at >= day_ago).scalar()
        recent_sessions = db.query(func.count(PracticeSession.id)).filter(PracticeSession.completed_at >= day_ago).scalar()
        
        return {
            "status": "healthy",
            "database": db_health,
            "statistics": {
                "total_users": total_users,
                "total_subjects": total_subjects,
                "total_questions": total_questions,
                "total_sessions": total_sessions,
                "inactive_subjects": inactive_subjects,
                "inactive_questions": inactive_questions
            },
            "recent_activity": {
                "new_users_24h": recent_users,
                "sessions_24h": recent_sessions
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.post("/admin/system/cleanup")
async def admin_system_cleanup(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Perform system cleanup operations (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        cleanup_results = {}
        
        # Clean up inactive users (older than 90 days)
        from datetime import datetime, timedelta
        ninety_days_ago = datetime.utcnow() - timedelta(days=90)
        inactive_users = db.query(User).filter(
            User.is_active == False,
            User.updated_at <= ninety_days_ago
        ).all()
        
        for user in inactive_users:
            db.delete(user)
        cleanup_results["deleted_inactive_users"] = len(inactive_users)
        
        # Clean up old practice sessions (older than 1 year)
        one_year_ago = datetime.utcnow() - timedelta(days=365)
        old_sessions = db.query(PracticeSession).filter(
            PracticeSession.completed_at <= one_year_ago
        ).all()
        
        for session in old_sessions:
            # Delete related attempts first
            db.query(QuestionAttempt).filter(QuestionAttempt.session_id == session.id).delete()
            db.delete(session)
        cleanup_results["deleted_old_sessions"] = len(old_sessions)
        
        db.commit()
        
        return {
            "message": "System cleanup completed successfully",
            "results": cleanup_results
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@app.get("/admin/system/backup")
async def admin_system_backup(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate system backup data (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get all data for backup
        users = db.query(User).all()
        subjects = db.query(Subject).all()
        questions = db.query(Question).all()
        enrollments = db.query(UserEnrollment).all()
        
        backup_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "is_active": user.is_active,
                    "is_admin": user.is_admin,
                    "created_at": user.created_at.isoformat()
                } for user in users
            ],
            "subjects": [
                {
                    "id": subject.id,
                    "name": subject.name,
                    "description": subject.description,
                    "is_active": subject.is_active,
                    "created_at": subject.created_at.isoformat()
                } for subject in subjects
            ],
            "questions": [
                {
                    "id": question.id,
                    "subject_id": question.subject_id,
                    "question_text": question.question_text,
                    "option_a": question.option_a,
                    "option_b": question.option_b,
                    "option_c": question.option_c,
                    "option_d": question.option_d,
                    "correct_answer": question.correct_answer,
                    "explanation": question.explanation,
                    "difficulty_level": question.difficulty_level,
                    "is_active": question.is_active,
                    "created_at": question.created_at.isoformat()
                } for question in questions
            ],
            "enrollments": [
                {
                    "id": enrollment.id,
                    "user_id": enrollment.user_id,
                    "subject_id": enrollment.subject_id,
                    "enrolled_at": enrollment.enrolled_at.isoformat(),
                    "is_active": enrollment.is_active
                } for enrollment in enrollments
            ]
        }
        
        return backup_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@app.post("/admin/system/restore")
async def admin_system_restore(
    backup_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Restore system from backup data (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Clear existing data
        db.query(QuestionAttempt).delete()
        db.query(PracticeSession).delete()
        db.query(UserEnrollment).delete()
        db.query(Question).delete()
        db.query(Subject).delete()
        db.query(User).delete()
        
        # Restore users
        for user_data in backup_data.get("users", []):
            user = User(
                id=user_data["id"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password="restored_user_password_hash",  # You'll need to handle passwords properly
                is_active=user_data["is_active"],
                is_admin=user_data["is_admin"]
            )
            db.add(user)
        
        # Restore subjects
        for subject_data in backup_data.get("subjects", []):
            subject = Subject(
                id=subject_data["id"],
                name=subject_data["name"],
                description=subject_data["description"],
                is_active=subject_data["is_active"]
            )
            db.add(subject)
        
        db.commit()
        
        # Restore questions
        for question_data in backup_data.get("questions", []):
            question = Question(
                id=question_data["id"],
                subject_id=question_data["subject_id"],
                question_text=question_data["question_text"],
                option_a=question_data["option_a"],
                option_b=question_data["option_b"],
                option_c=question_data["option_c"],
                option_d=question_data["option_d"],
                correct_answer=question_data["correct_answer"],
                explanation=question_data["explanation"],
                difficulty_level=question_data["difficulty_level"],
                is_active=question_data["is_active"]
            )
            db.add(question)
        
        # Restore enrollments
        for enrollment_data in backup_data.get("enrollments", []):
            enrollment = UserEnrollment(
                id=enrollment_data["id"],
                user_id=enrollment_data["user_id"],
                subject_id=enrollment_data["subject_id"],
                is_active=enrollment_data["is_active"]
            )
            db.add(enrollment)
        
        db.commit()
        
        return {"message": "System restored successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")

@app.get("/admin/system/logs")
async def admin_get_system_logs(
    limit: int = 100,
    current_user = Depends(get_current_user)
):
    """Get system logs (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # This is a placeholder - in a real system, you'd integrate with a proper logging system
    # For now, we'll return a mock log structure
    return {
        "message": "Log retrieval not implemented in this version",
        "note": "Integrate with a proper logging system like ELK stack or similar"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

from mangum import Mangum
application = Mangum(app)