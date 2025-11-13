# App Launcher - Docker Deployment Guide

This guide explains how to deploy the App Launcher application to your Portainer container via GitHub.

## Prerequisites

- Docker installed on your host system
- Portainer running and accessible
- GitHub account
- Access to your Supabase database at `supabase01.i4vision.us`

## Files Created

The following Docker configuration files have been created:

1. **Dockerfile** - Multi-stage Docker build configuration
2. **.dockerignore** - Excludes unnecessary files from Docker build
3. **docker-compose.yml** - Container orchestration configuration
4. **.env.example** - Template for environment variables

## Deployment Steps

### Step 1: Push Code to GitHub

1. Initialize Git in your project (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Docker configuration"
   ```

2. Add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Prepare Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database Configuration
POSTGRES_HOSTNAME=supabase01.i4vision.us
POSTGRES_DB=your_database_name
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_actual_password
POSTGRES_PORT=5432

# Full database URL
DATABASE_URL=postgresql://postgres:your_password@supabase01.i4vision.us:5432/your_database_name

# Application Secrets
ACCESS_CODE=your_secret_access_code
SESSION_SECRET=your_session_secret_here

# Node Environment
NODE_ENV=production
```

**Important:** Never commit the `.env` file to GitHub. It's already in `.gitignore`.

### Step 3: Deploy in Portainer

#### Option A: Using Portainer Stacks (Recommended)

1. Log into Portainer
2. Navigate to **Stacks** → **Add Stack**
3. Choose **Git Repository** as the build method
4. Configure the stack:
   - **Name:** `app-launcher`
   - **Repository URL:** Your GitHub repository URL
   - **Repository Reference:** `main` (or your branch name)
   - **Compose path:** `docker-compose.yml`
5. Add environment variables:
   - Click **Add an environment variable** for each variable in your `.env` file
   - OR upload your `.env` file using the **Load variables from .env file** option
6. Click **Deploy the stack**

#### Option B: Using Portainer with Docker Compose File

1. Clone your repository on the Portainer host:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

2. Copy and configure your `.env` file

3. In Portainer:
   - Navigate to **Stacks** → **Add Stack**
   - Choose **Upload** as the build method
   - Upload your `docker-compose.yml` file
   - Load your `.env` file or manually add environment variables
   - Click **Deploy the stack**

#### Option C: Manual Container Deployment

1. Build the Docker image from your GitHub repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   docker build -t app-launcher:latest .
   ```

2. In Portainer:
   - Navigate to **Containers** → **Add Container**
   - **Name:** `app-launcher`
   - **Image:** `app-launcher:latest`
   - **Port mapping:** Map `5000:5000`
   - **Environment variables:** Add all variables from your `.env` file
   - **Restart policy:** Unless stopped
   - Click **Deploy the container**

### Step 4: Verify Deployment

1. Check container logs in Portainer:
   - Navigate to your container
   - Click **Logs**
   - Look for: `serving on port 5000`

2. Access the application:
   - If exposed externally: `http://your-server-ip:5000`
   - If behind a reverse proxy: Use your configured domain

3. Test the health check:
   ```bash
   curl http://your-server-ip:5000/api/apps
   ```

## Application Architecture

The Docker container runs:
- **Frontend:** React application built with Vite (served as static files)
- **Backend:** Express.js server on port 5000
- **Database:** Connects to your existing Supabase PostgreSQL database

## Security Notes

1. **Environment Variables:** 
   - Never commit `.env` files to Git
   - Keep `ACCESS_CODE` secret and strong
   - Generate strong `SESSION_SECRET` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **Database Connection:**
   - The app connects to your existing Supabase database
   - SSL is enabled by default for secure connections
   - No database is created in Docker - it uses your external Supabase instance

3. **Network Security:**
   - Consider putting the app behind a reverse proxy (nginx, Traefik)
   - Enable HTTPS using Let's Encrypt or similar
   - Restrict port 5000 access via firewall if using a proxy

## Updating the Application

To update after pushing changes to GitHub:

### Using Portainer Stacks:
1. Navigate to your stack in Portainer
2. Click **Update the stack**
3. Enable **Pull latest image**
4. Click **Update**

### Using Manual Container:
```bash
# On Portainer host
cd YOUR_REPO
git pull origin main
docker build -t app-launcher:latest .
docker stop app-launcher
docker rm app-launcher
# Redeploy container in Portainer or via docker run
```

## Troubleshooting

### Container won't start
- Check logs in Portainer for error messages
- Verify all environment variables are set correctly
- Ensure database is accessible from the container

### Can't connect to database
- Verify `POSTGRES_HOSTNAME` is accessible from Docker
- Check firewall rules allow outbound connections to port 5432
- Test connection: `telnet supabase01.i4vision.us 5432`

### Build fails
- Check Dockerfile syntax
- Ensure all source files are present in repository
- Verify npm dependencies are correctly specified

### Health check fails
- Check if app is running: `docker logs app-launcher`
- Verify port 5000 is accessible inside container
- Database connection issues can cause health check failures

## Production Recommendations

1. **Reverse Proxy:** Use nginx or Traefik for SSL termination
2. **Monitoring:** Set up health checks and alerting
3. **Backups:** Regular backups of your Supabase database
4. **Resource Limits:** Set CPU/memory limits in docker-compose.yml if needed
5. **Log Management:** Configure log rotation in Docker

## Support

For issues specific to:
- **Docker deployment:** Check Docker and Portainer logs
- **Application errors:** Check container logs in Portainer
- **Database issues:** Verify Supabase connection and credentials
