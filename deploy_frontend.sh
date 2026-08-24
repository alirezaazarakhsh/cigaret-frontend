#!/bin/bash
# Sevin Wholesale Tobacco Frontend - Dockerized Deployment Script

# Exit on error
set -e

echo "=================================================="
echo "🚀 Starting Sevin Frontend Deployment on Production Server..."
echo "=================================================="

# Check if docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo '❌ Error: Docker is not installed on this server. Please install docker first.' >&2
  exit 1
fi

# 1. Pull latest code (if using Git)
# echo "🔄 Pulling latest changes from repository..."
# git pull origin main

# 2. Build the Docker image
echo "📦 Building Frontend Docker image (production tag)..."
docker build -t sevin-frontend:latest .

# 3. Clean up running containers on port 3000
echo "🧹 Stopping and removing previous containers..."
if [ "$(docker ps -aq -f name=sevin-frontend-app)" ]; then
    docker stop sevin-frontend-app || true
    docker rm sevin-frontend-app || true
fi

# 4. Run the production container
echo "🏃 Running new container on port 3000..."
docker run -d \
  --name sevin-frontend-app \
  --restart always \
  -p 3000:3000 \
  --env-file .env \
  sevin-frontend:latest

echo "=================================================="
echo "🎉 Frontend is successfully deployed and listening on http://localhost:3000 !"
echo "=================================================="
echo "👉 STEPS TO CONFIGURE HOST NGINX:"
echo "1. Copy the generated 'nginx.conf' to your server's Nginx configuration directory:"
echo "   sudo cp nginx.conf /etc/nginx/sites-available/sevin-app"
echo "2. Enable the site:"
echo "   sudo ln -s /etc/nginx/sites-available/sevin-app /etc/nginx/sites-enabled/"
echo "3. Test Nginx and reload:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo "=================================================="
