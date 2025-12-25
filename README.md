# SnapSelect - Photo Sharing Platform for Photographers

SnapSelect is a comprehensive web application designed for photographers to share photos with clients, receive feedback, and manage photo selections for printing and albums.

## Features

### For Photographers
- **Client Management**: Create and manage multiple clients with unique gallery links
- **Photo Upload**: Upload multiple photos for each client
- **Selection Tracking**: Mark photos as selected for printing/editing
- **Dashboard**: View all clients and their photo statistics in one place

### For Clients & Viewers
- **Unique Gallery Links**: Each client gets a private gallery accessible via unique URL
- **Like/Favorite System**: Heart icon to like photos and save them to favorites
- **Favorites Collection**: View all liked photos in one place
- **Multi-Quality Downloads**: Download photos in different qualities (Low, Medium, High, Original)
- **Automatic Watermarking**: All downloaded images include the photographer's studio name watermark

## Technology Stack

### Backend
- Node.js + Express + TypeScript
- SQLite database
- JWT authentication
- Sharp for image processing and watermarking
- Multer for file uploads

### Frontend
- React + TypeScript
- React Router for navigation
- Axios for API calls
- Vite for build tooling

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SnapSelect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install

   # Create .env file from example
   cp .env.example .env

   # Edit .env if needed (optional)
   # The default configuration works for development
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3000`

### First Time Setup

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Register" to create your photographer account
3. Enter your studio name, email, and password
4. You'll be automatically logged in and redirected to the dashboard

## Usage Guide

### Creating a Client

1. From the dashboard, click **"+ New Client"**
2. Enter the client's name and optional email
3. Click **"Create"**
4. The client card will appear with their unique gallery link

### Uploading Photos

1. Click **"Manage Photos"** on a client card
2. Click the upload area or drag and drop photos
3. Select multiple photos (supports JPG, PNG, GIF, WebP)
4. Click **"Upload Photos"**

### Sharing with Clients

1. On the client card, click **"Copy Link"**
2. Share the copied URL with your client via email or messaging
3. Clients can access the gallery without any login

### Client Experience

When clients visit their gallery link, they can:
- View all their photos
- Click the heart icon (🤍) to like photos - it turns red (❤️)
- View all favorites in the "View Favorites" page
- Download photos in different qualities
- All downloads automatically include your studio's watermark

### Managing Selections

1. Go to **"Manage Photos"** for a client
2. Click **"Select"** on photos chosen for printing/editing
3. Selected photos are marked and counted in the dashboard
4. Use these selections to identify which photos to process

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new photographer
- `POST /api/auth/login` - Login photographer

### Clients
- `POST /api/clients` - Create new client (protected)
- `GET /api/clients` - Get all clients (protected)
- `GET /api/clients/gallery/:uniqueLink` - Get client by link (public)
- `DELETE /api/clients/:id` - Delete client (protected)

### Photos
- `POST /api/photos/upload` - Upload photos (protected)
- `GET /api/photos/client/:clientId` - Get photos by client (protected)
- `GET /api/photos/gallery/:uniqueLink` - Get photos by link (public)
- `PATCH /api/photos/:photoId/select` - Toggle photo selection (protected)
- `GET /api/photos/download/:photoId` - Download photo with watermark (public)
- `DELETE /api/photos/:photoId` - Delete photo (protected)

### Favorites
- `POST /api/favorites/toggle` - Toggle favorite (public)
- `GET /api/favorites/:uniqueLink` - Get favorites by link (public)

## Database Schema

### Photographers
- id, email, password (hashed), studio_name, created_at

### Clients
- id, photographer_id, name, email, unique_link, created_at

### Photos
- id, client_id, photographer_id, filename, original_filename, file_path, is_selected, uploaded_at

### Favorites
- id, photo_id, client_id, created_at

## Image Download Qualities

- **Low**: 800px wide, 60% quality - suitable for web viewing
- **Medium**: 1920px wide, 75% quality - HD quality
- **High**: 3840px wide, 85% quality - 4K quality
- **Original**: Original size, 90% quality - highest quality

All downloads include a watermark with the photographer's studio name centered on the image.

## Production Deployment

**⚠️ Important:** This app requires a backend server and **CANNOT be hosted on GitHub Pages** (which only supports static sites).

### Quick Deploy Options

We provide ready-to-use configurations for popular hosting platforms:

1. **[Render.com](https://render.com)** (Recommended - Free tier available)
   - Automatic deployment from `render.yaml`
   - Free tier includes persistent storage
   - Deploy in ~5 minutes

2. **[Railway.app](https://railway.app)** (Developer-friendly)
   - Uses `railway.json` and `nixpacks.toml`
   - $5 free credit per month
   - One-click deploy from GitHub

3. **Docker** (Any platform)
   - `Dockerfile` and `docker-compose.yml` included
   - Deploy to AWS, Google Cloud, DigitalOcean, etc.
   - Full control over infrastructure

4. **[Vercel](https://vercel.com)** (Limited - demo only)
   - Uses `vercel.json`
   - Has file upload size limitations
   - Better for demos than production

### Detailed Deployment Guide

**See [DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive step-by-step instructions including:
- Platform-specific deployment steps
- Environment variable configuration
- Database and file storage setup
- Scaling and monitoring
- Security checklist
- Troubleshooting guide

### Quick Start - Render.com

```bash
# 1. Push to GitHub (already done!)
# 2. Sign up at render.com
# 3. New → Blueprint → Connect your repo
# 4. Render auto-detects render.yaml and deploys
# 5. Set JWT_SECRET environment variable
# 6. Done! Your app is live
```

### Environment Variables

Required for production:

```env
NODE_ENV=production
JWT_SECRET=<generate-secure-random-string>  # openssl rand -base64 32
PORT=5000
DATABASE_PATH=./data/database.sqlite
UPLOAD_DIR=./uploads
```

### Build Commands

```bash
# Install all dependencies
npm run install:all

# Build both frontend and backend
npm run build

# Start in production mode
npm start
```

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
