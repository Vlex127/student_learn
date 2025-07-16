# StudentLearn Backend API

A FastAPI-based backend for the StudentLearn platform, providing authentication, practice management, and analytics.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📚 **Practice Management** - Subject-based question practice
- 📊 **Analytics** - User progress tracking and statistics
- 🗄️ **Database** - SQLAlchemy ORM with SQLite/PostgreSQL support
- 🔒 **Security** - Password hashing, CORS, input validation
- 📝 **API Documentation** - Auto-generated with Swagger UI

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **JWT** - Token-based authentication
- **Passlib** - Password hashing
- **Uvicorn** - ASGI server

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Run the Server

```bash
# Development mode
python main.py

# Or with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Practice
- `GET /practice/subjects` - Get available subjects
- `GET /practice/questions/{subject_id}` - Get questions for subject

### Health Check
- `GET /health` - API health status

## Database Schema

### Users
- User registration and authentication
- Profile management

### Subjects
- Available practice subjects
- Subject descriptions

### Questions
- Multiple choice questions
- Difficulty levels
- Explanations

### Practice Sessions
- User practice history
- Score tracking
- Time tracking

### Question Attempts
- Individual question responses
- Correctness tracking
- Performance analytics

## Development

### Project Structure
```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── env.example         # Environment variables template
├── app/
│   ├── __init__.py
│   ├── database.py     # Database configuration
│   ├── models.py       # SQLAlchemy models
│   ├── schemas.py      # Pydantic schemas
│   ├── auth.py         # Authentication utilities
│   └── crud.py         # Database operations
└── README.md
```

### Adding New Features

1. **Models**: Add to `app/models.py`
2. **Schemas**: Add to `app/schemas.py`
3. **CRUD**: Add to `app/crud.py`
4. **Routes**: Add to `main.py`

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## Production Deployment

### Environment Variables
- Set `SECRET_KEY` to a secure random string
- Configure `DATABASE_URL` for your database
- Set `ENVIRONMENT=production`
- Configure CORS origins

### Database Migration
```bash
# Initialize Alembic (if using)
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details 