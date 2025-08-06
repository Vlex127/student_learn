from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Subject schemas
class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class SubjectResponse(SubjectBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Question schemas
class QuestionBase(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    explanation: Optional[str] = None
    difficulty_level: str = "medium"

class QuestionCreate(QuestionBase):
    subject_id: int
    correct_answer: str  # 'A', 'B', 'C', or 'D'

class QuestionResponse(QuestionBase):
    id: int
    subject_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuestionWithAnswer(QuestionResponse):
    correct_answer: str

# Practice session schemas
class PracticeSessionBase(BaseModel):
    subject_id: int
    total_questions: int = 10

class PracticeSessionCreate(PracticeSessionBase):
    pass

class PracticeSessionResponse(PracticeSessionBase):
    id: int
    user_id: int
    score: float
    correct_answers: int
    time_taken: int
    completed_at: datetime
    
    class Config:
        from_attributes = True

# Question attempt schemas
class QuestionAttemptBase(BaseModel):
    question_id: int
    selected_answer: str
    time_taken: int

class QuestionAttemptCreate(QuestionAttemptBase):
    session_id: int

class QuestionAttemptResponse(QuestionAttemptBase):
    id: int
    user_id: int
    session_id: int
    is_correct: bool
    attempted_at: datetime
    
    class Config:
        from_attributes = True

# API Response schemas
class SubjectsResponse(BaseModel):
    subjects: List[SubjectResponse]

class QuestionsResponse(BaseModel):
    questions: List[QuestionResponse]

class PracticeSessionSummary(BaseModel):
    total_sessions: int
    average_score: float
    total_questions_attempted: int
    total_correct_answers: int
    subjects_practiced: List[str] 

class SubjectContentResponse(BaseModel):
    id: int
    subject_id: int
    title: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True 

class LessonResponse(BaseModel):
    id: int
    content_id: int
    title: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True

class LessonCreate(BaseModel):
    title: str
    body: str 