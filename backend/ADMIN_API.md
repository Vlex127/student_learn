# Admin API Documentation

This document outlines all the admin-only API endpoints available in the StudentLearn backend.

## Authentication

All admin endpoints require authentication with a valid JWT token and admin privileges. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Management

### Get All Users
```http
GET /admin/users?skip=0&limit=100
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_admin": false,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Get Specific User
```http
GET /admin/users/{user_id}
```

### Update User
```http
PUT /admin/users/{user_id}
Content-Type: application/json

{
  "full_name": "Updated Name",
  "is_active": true,
  "is_admin": false
}
```

### Delete User (Soft Delete)
```http
DELETE /admin/users/{user_id}
```

### Toggle User Admin Status
```http
POST /admin/users/{user_id}/toggle-admin
```

## Subject Management

### Get All Subjects (Admin View)
```http
GET /admin/subjects
```

### Create Subject
```http
POST /admin/subjects
Content-Type: application/json

{
  "name": "New Subject",
  "description": "Subject description"
}
```

### Delete Subject
```http
DELETE /admin/subjects/{subject_id}
```

### Toggle Subject Active Status
```http
POST /admin/subjects/{subject_id}/toggle
```

## Question Management

### Create Question
```http
POST /admin/questions
Content-Type: application/json

{
  "subject_id": 1,
  "question_text": "What is 2 + 2?",
  "option_a": "3",
  "option_b": "4",
  "option_c": "5",
  "option_d": "6",
  "correct_answer": "B",
  "explanation": "2 + 2 = 4",
  "difficulty_level": "easy"
}
```

### Get All Questions
```http
GET /admin/questions?subject_id=1&skip=0&limit=100
```

### Get Specific Question
```http
GET /admin/questions/{question_id}
```

### Update Question
```http
PUT /admin/questions/{question_id}
Content-Type: application/json

{
  "question_text": "Updated question text",
  "correct_answer": "C"
}
```

### Delete Question (Soft Delete)
```http
DELETE /admin/questions/{question_id}
```

### Bulk Import Questions
```http
POST /admin/questions/bulk-import
Content-Type: application/json

[
  {
    "subject_id": 1,
    "question_text": "Question 1",
    "option_a": "A",
    "option_b": "B",
    "option_c": "C",
    "option_d": "D",
    "correct_answer": "B"
  }
]
```

## Practice Session Management

### Get Practice Sessions
```http
GET /admin/practice-sessions?user_id=1&subject_id=1&skip=0&limit=100
```

### Get Practice Session Details
```http
GET /admin/practice-sessions/{session_id}
```

### Delete Practice Session
```http
DELETE /admin/practice-sessions/{session_id}
```

### Get User Practice History
```http
GET /admin/user/{user_id}/practice-history
```

## Analytics and Statistics

### Get System Statistics
```http
GET /admin/statistics
```

**Response:**
```json
{
  "users": {
    "total": 100,
    "active": 95,
    "admins": 3,
    "recent_registrations": 5
  },
  "content": {
    "total_subjects": 10,
    "active_subjects": 8,
    "total_questions": 500
  },
  "activity": {
    "total_sessions": 1000,
    "total_attempts": 5000,
    "average_score": 75.5,
    "recent_sessions": 50
  }
}
```

### Get User Statistics
```http
GET /admin/user/{user_id}/statistics
```

### Get Subject Analytics
```http
GET /admin/subjects/analytics
```

### Get Question Statistics
```http
GET /admin/questions/statistics
```

### Get Practice Analytics
```http
GET /admin/practice-analytics
```

**Response:**
```json
{
  "overall": {
    "total_sessions": 1000,
    "total_attempts": 5000,
    "average_score": 75.5,
    "average_time": 120.3,
    "recent_sessions": 50
  },
  "top_users": [
    {
      "name": "John Doe",
      "session_count": 25,
      "average_score": 85.2
    }
  ],
  "subject_performance": [
    {
      "subject": "Mathematics",
      "session_count": 200,
      "average_score": 78.5,
      "average_time": 110.2
    }
  ],
  "daily_activity": [
    {
      "date": "2024-01-01",
      "sessions": 15
    }
  ]
}
```

## Enrollment Management

### Get All Enrollments
```http
GET /admin/enrollments
```

**Response:**
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "subject": {
      "id": 1,
      "name": "Mathematics"
    },
    "enrolled_at": "2024-01-01T00:00:00"
  }
]
```

## System Management

### System Health Check
```http
GET /admin/system/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "healthy",
  "statistics": {
    "total_users": 100,
    "total_subjects": 10,
    "total_questions": 500,
    "total_sessions": 1000,
    "inactive_subjects": 2,
    "inactive_questions": 50
  },
  "recent_activity": {
    "new_users_24h": 5,
    "sessions_24h": 25
  },
  "timestamp": "2024-01-01T00:00:00"
}
```

### System Cleanup
```http
POST /admin/system/cleanup
```

**Response:**
```json
{
  "message": "System cleanup completed successfully",
  "results": {
    "deleted_inactive_users": 5,
    "deleted_old_sessions": 100
  }
}
```

### System Backup
```http
GET /admin/system/backup
```

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "users": [...],
  "subjects": [...],
  "questions": [...],
  "enrollments": [...]
}
```

### System Restore
```http
POST /admin/system/restore
Content-Type: application/json

{
  "timestamp": "2024-01-01T00:00:00",
  "users": [...],
  "subjects": [...],
  "questions": [...],
  "enrollments": [...]
}
```

### System Logs
```http
GET /admin/system/logs?limit=100
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin access required)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "detail": "Error message description"
}
```

## Rate Limiting

Admin endpoints are subject to rate limiting to prevent abuse. The current limits are:
- 100 requests per minute per IP address
- 1000 requests per hour per user

## Security Notes

1. All admin endpoints require admin privileges
2. JWT tokens should be kept secure and not shared
3. Admin actions are logged for audit purposes
4. Sensitive operations (like system restore) should be performed with caution
5. Regular backups are recommended before major system changes

## Testing Admin Endpoints

You can test admin endpoints using tools like:
- Postman
- curl
- Insomnia
- FastAPI's automatic documentation at `/docs`

Example curl command:
```bash
curl -X GET "http://localhost:8000/admin/statistics" \
  -H "Authorization: Bearer your-jwt-token"
```