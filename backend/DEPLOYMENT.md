# 🚀 Deployment Guide - Free Hosting Options

## Railway (Recommended) 🥇

### Setup Steps:

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** repository
3. **Create new project** from GitHub repo
4. **Set environment variables**:
   ```
   DATABASE_URL=postgresql://...
   SECRET_KEY=your-secret-key
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```
5. **Deploy** - Railway auto-detects Python and deploys

### Pros:

- ✅ $5/month free credit
- ✅ PostgreSQL database included
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Easy setup

---

## Render 🥈

### Setup Steps:

1. **Sign up** at [render.com](https://render.com)
2. **Create new Web Service**
3. **Connect GitHub** repository
4. **Configure**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Set environment variables**
6. **Deploy**

### Pros:

- ✅ 750 hours/month free
- ✅ PostgreSQL available
- ✅ Automatic deployments

### Cons:

- ⚠️ Sleeps after 15min inactivity
- ⚠️ Cold starts

---

## Fly.io 🥉

### Setup Steps:

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Sign up** at [fly.io](https://fly.io)
3. **Login**: `fly auth login`
4. **Create app**: `fly launch`
5. **Deploy**: `fly deploy`

### Pros:

- ✅ 3 shared-cpu VMs free
- ✅ Global deployment
- ✅ Fast performance

### Cons:

- ⚠️ More complex setup
- ⚠️ Requires CLI knowledge

---

## PythonAnywhere

### Setup Steps:

1. **Sign up** at [pythonanywhere.com](https://pythonanywhere.com)
2. **Upload files** via web interface
3. **Install requirements**: `pip install -r requirements.txt`
4. **Configure WSGI file**
5. **Set environment variables**

### Pros:

- ✅ Python-focused
- ✅ Easy for beginners

### Cons:

- ⚠️ Limited resources
- ⚠️ No custom domains on free tier

---

## Environment Variables Setup

### Required Variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Security
SECRET_KEY=your-super-secret-key-here

# CORS
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com

# Optional
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
```

### Generate Secret Key:

```python
import secrets
print(secrets.token_urlsafe(32))
```

---

## Database Setup

### Railway PostgreSQL:

1. Add PostgreSQL service to project
2. Copy connection string to `DATABASE_URL`
3. Database auto-created

### Render PostgreSQL:

1. Create PostgreSQL service
2. Copy external database URL
3. Set as `DATABASE_URL`

### SQLite (Development):

```bash
DATABASE_URL=sqlite:///./studentlearn.db
```

---

## Testing Deployment

### Health Check:

```bash
curl https://your-app.railway.app/health
```

### API Documentation:

- Swagger UI: `https://your-app.railway.app/docs`
- ReDoc: `https://your-app.railway.app/redoc`

---

## Troubleshooting

### Common Issues:

1. **Port binding**: Ensure using `$PORT` environment variable
2. **CORS errors**: Check `ALLOWED_ORIGINS` includes your frontend URL
3. **Database connection**: Verify `DATABASE_URL` format
4. **Dependencies**: Ensure all packages in `requirements.txt`

### Logs:

- Railway: View in dashboard
- Render: View in service logs
- Fly.io: `fly logs`

---

## Cost Comparison

| Platform       | Free Tier  | Database | Custom Domain | Sleep |
| -------------- | ---------- | -------- | ------------- | ----- |
| Railway        | $5/month   | ✅       | ✅            | ❌    |
| Render         | 750h/month | ✅       | ✅            | ⚠️    |
| Fly.io         | 3 VMs      | ❌       | ✅            | ❌    |
| PythonAnywhere | 512MB      | ❌       | ❌            | ❌    |

**Recommendation**: Start with Railway for the best free experience! 🎉
