# StudentLearn Backend - Enhanced Edition

A comprehensive FastAPI backend for the StudentLearn platform with advanced admin functions, analytics, and system management capabilities.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt
- Token expiration and refresh
- Admin-only endpoints protection

### 👥 User Management
- User registration and login
- Profile management
- Admin user creation and management
- User statistics and analytics
- Soft delete functionality

### 📚 Subject & Course Management
- Subject creation and management
- Course enrollment system
- Content management (lessons, materials)
- Active/inactive subject toggling
- Subject analytics and performance metrics

### ❓ Question Management
- Question creation and editing
- Multiple choice questions (A, B, C, D)
- Difficulty levels (Easy, Medium, Hard)
- Bulk question import
- Question statistics and analytics

### 🎯 Practice System
- Practice session tracking
- Question attempt logging
- Performance analytics
- Session history and statistics
- Real-time scoring

### 📊 Analytics & Reporting
- System-wide statistics
- User performance analytics
- Subject performance metrics
- Practice session analytics
- Daily activity tracking
- Top performer identification

### 🛠️ Admin Functions
- Comprehensive user management
- Content moderation
- System health monitoring
- Database backup and restore
- System cleanup operations
- Advanced analytics dashboard

### 🔧 System Management
- Database health checks
- System performance monitoring
- Automated cleanup operations
- Backup and restore functionality
- Log management
- Rate limiting

## Quick Start

### Prerequisites
- Python 3.8+
- pip
- SQLite (or PostgreSQL for production)

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Create database tables**
   ```bash
   python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"
   ```

6. **Create admin user**
   ```bash
   python create_admin.py
   ```

7. **Run the server**
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Admin API Documentation
See [ADMIN_API.md](./ADMIN_API.md) for comprehensive admin endpoint documentation.

## Key Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /api/login` - NextAuth integration login
- `GET /auth/me` - Get current user info

### Admin Endpoints
- `GET /admin/users` - List all users
- `GET /admin/statistics` - System statistics
- `GET /admin/subjects/analytics` - Subject analytics
- `GET /admin/practice-analytics` - Practice analytics
- `GET /admin/system/health` - System health check

### User Endpoints
- `GET /library/courses` - Available courses
- `POST /enrollments/{subject_id}` - Enroll in course
- `GET /my-courses` - User's enrolled courses
- `GET /practice/subjects` - Practice subjects

## Admin Functions Overview

### User Management
```bash
# List all users
curl -H "Authorization: Bearer <token>" http://localhost:8000/admin/users

# Get user statistics
curl -H "Authorization: Bearer <token>" http://localhost:8000/admin/user/1/statistics

# Toggle admin status
curl -X POST -H "Authorization: Bearer <token>" http://localhost:8000/admin/users/1/toggle-admin
```

### Content Management
```bash
# Create subject
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mathematics","description":"Math course"}' \
  http://localhost:8000/admin/subjects

# Create question
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"subject_id":1,"question_text":"What is 2+2?","option_a":"3","option_b":"4","option_c":"5","option_d":"6","correct_answer":"B"}' \
  http://localhost:8000/admin/questions
```

### Analytics
```bash
# Get system statistics
curl -H "Authorization: Bearer <token>" http://localhost:8000/admin/statistics

# Get practice analytics
curl -H "Authorization: Bearer <token>" http://localhost:8000/admin/practice-analytics

# Get subject analytics
curl -H "Authorization: Bearer <token>" http://localhost:8000/admin/subjects/analytics
```

### System Management
```bash
# System health check
curl -H "Authorization: Bearer <token>" http://localhost:8000/admin/system/health

# System cleanup
curl -X POST -H "Authorization: Bearer <token>" http://localhost:8000/admin/system/cleanup

# System backup
curl -H "Authorization: Bearer <token>" http://localhost:8000/admin/system/backup
```

## Database Schema

### Core Tables
- **users** - User accounts and profiles
- **subjects** - Courses and subjects
- **questions** - Practice questions
- **practice_sessions** - User practice sessions
- **question_attempts** - Individual question attempts
- **user_enrollments** - Course enrollments
- **subject_contents** - Course content
- **lessons** - Individual lessons

### Relationships
- Users can enroll in multiple subjects
- Subjects contain multiple questions
- Practice sessions track user performance
- Question attempts record individual responses

## Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt
- Token-based session management

### Authorization
- Role-based access control
- Admin-only endpoint protection
- User permission validation

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=sqlite:///./studentlearn.db

# JWT
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Security
PASSWORD_MIN_LENGTH=6
MAX_LOGIN_ATTEMPTS=5
```

### Production Settings
For production deployment:

1. **Use PostgreSQL**
   ```bash
   DATABASE_URL=postgresql://user:password@localhost/studentlearn
   ```

2. **Set strong secret key**
   ```bash
   SECRET_KEY=your-super-secure-production-key
   ```

3. **Configure CORS properly**
   ```bash
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. **Enable HTTPS**
   ```bash
   ENVIRONMENT=production
   DEBUG=false
   ```

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

### Code Quality
```bash
# Install linting tools
pip install black flake8 isort

# Format code
black app/
isort app/

# Check code quality
flake8 app/
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

## Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Heroku Deployment
```bash
# Create Procfile
echo "web: uvicorn app.main:app --host=0.0.0.0 --port=\$PORT" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

## Monitoring & Logging

### Health Checks
- `GET /health` - Basic health check
- `GET /admin/system/health` - Detailed system health

### Logging
- Application logs to file
- Error tracking and monitoring
- Performance metrics

### Analytics
- User engagement metrics
- Content performance tracking
- System usage statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API docs at `/docs`

## Changelog

### v2.0.0 - Enhanced Admin Functions
- Added comprehensive admin API endpoints
- Implemented advanced analytics and reporting
- Added system management functions
- Enhanced security and monitoring
- Improved user management capabilities

### v1.0.0 - Initial Release
- Basic authentication system
- User management
- Subject and question management
- Practice session tracking