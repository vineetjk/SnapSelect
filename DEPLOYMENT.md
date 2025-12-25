# SnapSelect Deployment Guide

This guide covers multiple deployment options for the SnapSelect photo sharing platform.

## Quick Start - Free Hosting Options

### Option 1: Render.com (Recommended - Free Tier)

Render provides free hosting for both frontend and backend with persistent storage.

**Steps:**

1. **Push your code to GitHub** (already done!)

2. **Sign up at [Render.com](https://render.com)**

3. **Deploy using the Blueprint:**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to deploy both services
   - Wait 5-10 minutes for deployment

4. **Set Environment Variables:**
   - Go to the backend service
   - Add environment variable: `JWT_SECRET` with a random secure string
   - Example: `openssl rand -base64 32` to generate one

5. **Access your app:**
   - Frontend will be at: `https://snapselect-frontend.onrender.com`
   - Backend API at: `https://snapselect-backend.onrender.com`

**Note:** Free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds.

---

### Option 2: Railway.app (Easy Deploy - Free $5 Credit)

Railway offers excellent developer experience with free credits.

**Steps:**

1. **Sign up at [Railway.app](https://railway.app)**

2. **Deploy from GitHub:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your SnapSelect repository
   - Railway will use `railway.json` and `nixpacks.toml`

3. **Configure Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=<your-random-secret>
   PORT=5000
   ```

4. **Generate Domain:**
   - Go to Settings → Generate Domain
   - Your app will be live at: `https://snapselect.up.railway.app`

**Cost:** Free $5 credit/month, then ~$5-10/month

---

### Option 3: Docker (Any Platform)

Deploy using Docker to any cloud provider (AWS, Google Cloud, DigitalOcean, etc.)

**Steps:**

1. **Build the Docker image:**
   ```bash
   docker build -t snapselect .
   ```

2. **Run locally to test:**
   ```bash
   docker run -p 5000:5000 \
     -e JWT_SECRET=your-secret-key \
     -e NODE_ENV=production \
     snapselect
   ```

3. **Deploy to cloud:**

   **DigitalOcean App Platform:**
   - Push image to Docker Hub or use GitHub deploy
   - Create new app from Docker image
   - Set environment variables
   - Deploy

   **AWS ECS / Google Cloud Run:**
   - Push to container registry
   - Create service from image
   - Configure environment variables
   - Deploy

4. **Using Docker Compose (with volumes):**
   ```bash
   docker-compose up -d
   ```

---

### Option 4: Vercel (Serverless - Limited)

Vercel is great for frontend, but has limitations for backend with file uploads.

**⚠️ Note:** Vercel has a 4.5MB request limit which may restrict photo uploads. Better for demo purposes.

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   ```
   NODE_ENV=production
   JWT_SECRET=<your-secret>
   ```

**Limitation:** Serverless functions have execution time limits and file size restrictions.

---

## Production Configuration

### Environment Variables

Set these for production deployment:

```env
# Required
NODE_ENV=production
JWT_SECRET=<generate-secure-random-string>
PORT=5000

# Optional (defaults work)
DATABASE_PATH=./data/database.sqlite
UPLOAD_DIR=./uploads
```

**Generate JWT Secret:**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Database Persistence

**Important:** Ensure your database file persists across deployments!

- **Render:** Uses disk volumes (configured in `render.yaml`)
- **Railway:** Persistent storage included
- **Docker:** Use volumes (configured in `docker-compose.yml`)
- **Vercel:** Not recommended for persistent data

### File Storage Recommendations

For production, consider using cloud storage instead of local filesystem:

1. **AWS S3** - Most popular, pay per use
2. **Cloudinary** - Image-optimized, free tier available
3. **DigitalOcean Spaces** - S3-compatible, $5/month
4. **Google Cloud Storage** - Good integration with GCP

**Why?**
- Serverless platforms have ephemeral filesystems
- Better scalability and CDN integration
- Automatic backups and redundancy

---

## Performance Optimization

### 1. Enable CORS Properly

Update `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

### 2. Add Compression

```bash
cd backend
npm install compression
```

```typescript
import compression from 'compression';
app.use(compression());
```

### 3. Set up CDN for Images

Use Cloudflare or similar CDN to cache uploaded images.

### 4. Database Optimization

For high traffic, consider migrating to PostgreSQL:
- Better concurrency
- More robust for production
- Supported by most platforms

---

## Monitoring & Maintenance

### Health Checks

The API includes a health endpoint:
```
GET /api/health
```

Use this for uptime monitoring with services like:
- UptimeRobot (free)
- Better Uptime
- Pingdom

### Logs

- **Render:** View logs in dashboard
- **Railway:** Built-in log viewer
- **Docker:** `docker logs <container-id>`

### Backups

**Database:**
```bash
# Copy SQLite database
cp backend/database.sqlite backup-$(date +%Y%m%d).sqlite
```

**Uploaded Photos:**
- Set up automated backups of the uploads directory
- Or use cloud storage with built-in versioning

---

## Cost Estimates

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render** | Yes (with limits) | $7/month | Production apps |
| **Railway** | $5 credit/month | ~$5-10/month | Developer-friendly |
| **Vercel** | Yes (generous) | $20/month | Frontend-heavy apps |
| **DigitalOcean** | No | $12/month | Full control |
| **AWS/GCP** | 12 months free | Variable | Enterprise |

---

## Troubleshooting

### Build Failures

**Issue:** "Module not found"
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue:** TypeScript errors
```bash
# Rebuild
npm run build
```

### Runtime Errors

**Issue:** "Database locked"
- SQLite doesn't handle high concurrency well
- Solution: Migrate to PostgreSQL for production

**Issue:** "ENOSPC: no space left"
- Check disk space limits
- Clean up old uploads
- Upgrade hosting plan

### Upload Issues

**Issue:** "Request entity too large"
- Check platform limits (Vercel: 4.5MB, Railway: 100MB)
- Solution: Use cloud storage for large files

---

## Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Set up proper CORS origins
- [ ] Add rate limiting for uploads
- [ ] Implement file size validation
- [ ] Add input sanitization
- [ ] Set up automated backups
- [ ] Configure CSP headers
- [ ] Review uploaded file types
- [ ] Set up monitoring and alerts

---

## Scaling Considerations

### When to Scale

- More than 100 concurrent users
- Thousands of photos
- Slow upload/download times

### Scaling Options

1. **Horizontal Scaling:** Multiple server instances
2. **Database:** Move to PostgreSQL with read replicas
3. **File Storage:** Migrate to S3 + CloudFront CDN
4. **Caching:** Add Redis for session management
5. **Queue System:** Bull/BullMQ for background processing

---

## Need Help?

- Check GitHub Issues
- Review platform documentation:
  - [Render Docs](https://render.com/docs)
  - [Railway Docs](https://docs.railway.app)
  - [Vercel Docs](https://vercel.com/docs)
- Review server logs for errors
- Test locally with `NODE_ENV=production npm start`

---

## Quick Deploy Commands

```bash
# Render
git push origin main
# Auto-deploys from GitHub

# Railway
railway up

# Vercel
vercel --prod

# Docker
docker build -t snapselect .
docker push your-registry/snapselect
```

---

**Remember:** GitHub Pages cannot host this app because it requires a backend server!
