#!/bin/bash
# Sevin Wholesale Tobacco Backend - Production Host Deployment Script

# Exit on error
set -e

echo "=================================================="
echo "🚀 Starting Sevin Backend Deployment (Django + Gunicorn + PostgreSQL)..."
echo "=================================================="

# Ensure script is run from the backend root directory
# cd /var/www/sevin_backend

# 1. Activate Python virtual environment
echo "📁 Activating Virtual Environment..."
if [ ! -d "venv" ]; then
    echo "Creating new virtual environment 'venv'..."
    python3 -m venv venv
fi
source venv/bin/activate

# 2. Upgrade pip and install requirements
echo "📥 Installing dependencies from requirements.txt..."
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "⚠️ Warning: requirements.txt not found. Installing Django & psycopg2 & gunicorn..."
    pip install Django djangorestframework psycopg2-binary gunicorn django-cors-headers
fi

# 3. Run migrations and collect static files
echo "🗄️ Running migrations..."
python manage.py migrate --noinput

echo "🎨 Collecting static files for Nginx..."
python manage.py collectstatic --noinput

# 4. Restart the systemd service (Gunicorn)
echo "🔄 Reloading Gunicorn systemd daemon..."
if systemctl list-units --type=service | grep -q "sevin_backend"; then
    sudo systemctl restart sevin_backend
    echo "✅ Gunicorn sevin_backend service restarted successfully!"
else
    echo "⚠️ Gunicorn systemd service 'sevin_backend' was not found."
    echo "👉 To create one, place this template in /etc/systemd/system/sevin_backend.service:"
    echo '
[Unit]
Description=Sevin Backend Django Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/sevin_backend
ExecStart=/var/www/sevin_backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 core.wsgi:application

[Install]
WantedBy=multi-user.target
'
fi

echo "=================================================="
echo "🎉 Backend successfully deployed on port 8000!"
echo "=================================================="
