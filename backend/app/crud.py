from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from .models import User, Subject, Question, PracticeSession, QuestionAttempt, UserEnrollment
from .schemas import UserCreate, QuestionCreate, PracticeSessionCreate, QuestionAttemptCreate
from .auth import get_password_hash

# User CRUD operations
def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get all users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_admin=user.is_admin  # Pass is_admin from schema
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, **kwargs) -> Optional[User]:
    """Update user information"""
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in kwargs.items():
            if hasattr(db_user, key):
                setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

# Subject CRUD operations
def get_subject(db: Session, subject_id: int) -> Optional[Subject]:
    """Get subject by ID"""
    return db.query(Subject).filter(Subject.id == subject_id).first()

def get_subjects(db: Session, skip: int = 0, limit: int = 100) -> List[Subject]:
    """Get all active subjects"""
    return db.query(Subject).filter(Subject.is_active == True).offset(skip).limit(limit).all()

def create_subject(db: Session, name: str, description: str = None) -> Subject:
    """Create a new subject"""
    db_subject = Subject(name=name, description=description)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int) -> bool:
    """Delete a subject by ID"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if subject:
        db.delete(subject)
        db.commit()
        return True
    return False

def get_subject_by_id(db: Session, subject_id: int) -> Optional[Subject]:
    """Get subject by ID"""
    return db.query(Subject).filter(Subject.id == subject_id).first()

# User Enrollment CRUD operations
def enroll_user_in_subject(db: Session, user_id: int, subject_id: int) -> Optional[UserEnrollment]:
    """Enroll a user in a subject"""
    # Check if already enrolled
    existing = db.query(UserEnrollment).filter(
        UserEnrollment.user_id == user_id,
        UserEnrollment.subject_id == subject_id,
        UserEnrollment.is_active == True
    ).first()
    
    if existing:
        return existing  # Already enrolled
    
    # Create new enrollment
    enrollment = UserEnrollment(user_id=user_id, subject_id=subject_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

def unenroll_user_from_subject(db: Session, user_id: int, subject_id: int) -> bool:
    """Remove user enrollment from a subject"""
    enrollment = db.query(UserEnrollment).filter(
        UserEnrollment.user_id == user_id,
        UserEnrollment.subject_id == subject_id,
        UserEnrollment.is_active == True
    ).first()
    
    if enrollment:
        enrollment.is_active = False
        db.commit()
        return True
    return False

def get_user_enrolled_subjects(db: Session, user_id: int) -> List[Subject]:
    """Get all subjects a user is enrolled in"""
    return db.query(Subject).join(UserEnrollment).filter(
        UserEnrollment.user_id == user_id,
        UserEnrollment.is_active == True,
        Subject.is_active == True
    ).all()

def is_user_enrolled(db: Session, user_id: int, subject_id: int) -> bool:
    """Check if user is enrolled in a specific subject"""
    enrollment = db.query(UserEnrollment).filter(
        UserEnrollment.user_id == user_id,
        UserEnrollment.subject_id == subject_id,
        UserEnrollment.is_active == True
    ).first()
    return enrollment is not None

# Question CRUD operations
def get_question(db: Session, question_id: int) -> Optional[Question]:
    """Get question by ID"""
    return db.query(Question).filter(Question.id == question_id).first()

def get_questions_by_subject(db: Session, subject_id: int, limit: int = 10) -> List[Question]:
    """Get questions for a specific subject"""
    return db.query(Question).filter(
        Question.subject_id == subject_id,
        Question.is_active == True
    ).limit(limit).all()

def create_question(db: Session, question: QuestionCreate) -> Question:
    """Create a new question"""
    db_question = Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

# Practice Session CRUD operations
def create_practice_session(db: Session, session: PracticeSessionCreate, user_id: int) -> PracticeSession:
    """Create a new practice session"""
    db_session = PracticeSession(**session.dict(), user_id=user_id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_user_practice_sessions(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[PracticeSession]:
    """Get practice sessions for a user"""
    return db.query(PracticeSession).filter(
        PracticeSession.user_id == user_id
    ).order_by(PracticeSession.completed_at.desc()).offset(skip).limit(limit).all()

def update_practice_session(db: Session, session_id: int, **kwargs) -> Optional[PracticeSession]:
    """Update practice session"""
    db_session = db.query(PracticeSession).filter(PracticeSession.id == session_id).first()
    if db_session:
        for key, value in kwargs.items():
            if hasattr(db_session, key):
                setattr(db_session, key, value)
        db.commit()
        db.refresh(db_session)
    return db_session

# Question Attempt CRUD operations
def create_question_attempt(db: Session, attempt: QuestionAttemptCreate, user_id: int) -> QuestionAttempt:
    """Create a new question attempt"""
    # Get the question to check if answer is correct
    question = get_question(db, attempt.question_id)
    is_correct = question.correct_answer == attempt.selected_answer if question else False
    
    db_attempt = QuestionAttempt(
        **attempt.dict(),
        user_id=user_id,
        is_correct=is_correct
    )
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    return db_attempt

def get_user_question_attempts(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[QuestionAttempt]:
    """Get question attempts for a user"""
    return db.query(QuestionAttempt).filter(
        QuestionAttempt.user_id == user_id
    ).order_by(QuestionAttempt.attempted_at.desc()).offset(skip).limit(limit).all()

# Analytics and Statistics
def get_user_statistics(db: Session, user_id: int) -> dict:
    """Get comprehensive statistics for a user"""
    # Total practice sessions
    total_sessions = db.query(func.count(PracticeSession.id)).filter(
        PracticeSession.user_id == user_id
    ).scalar()
    
    # Average score
    avg_score = db.query(func.avg(PracticeSession.score)).filter(
        PracticeSession.user_id == user_id
    ).scalar() or 0.0
    
    # Total questions attempted
    total_questions = db.query(func.count(QuestionAttempt.id)).filter(
        QuestionAttempt.user_id == user_id
    ).scalar()
    
    # Total correct answers
    total_correct = db.query(func.count(QuestionAttempt.id)).filter(
        QuestionAttempt.user_id == user_id,
        QuestionAttempt.is_correct == True
    ).scalar()
    
    # Subjects practiced
    subjects_practiced = db.query(Subject.name).join(PracticeSession).filter(
        PracticeSession.user_id == user_id
    ).distinct().all()
    subjects_list = [subject[0] for subject in subjects_practiced]
    
    return {
        "total_sessions": total_sessions,
        "average_score": round(avg_score, 2),
        "total_questions_attempted": total_questions,
        "total_correct_answers": total_correct,
        "accuracy_rate": round((total_correct / total_questions * 100) if total_questions > 0 else 0, 2),
        "subjects_practiced": subjects_list
    } 