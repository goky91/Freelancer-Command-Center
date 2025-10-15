#!/bin/bash

# =============================================================================
# EC2 INICIJALZI SETUP SKRIPTA
# =============================================================================
#
# Ova skripta priprema fresh EC2 Ubuntu server za Django deployment.
# Pokreće se JEDNOM nakon kreiranja EC2 instance.
#
# Šta instalira:
# - Python 3.11, pip, venv
# - PostgreSQL client (za konekciju na RDS)
# - Nginx (web server)
# - Git
# - Konfiguriše Gunicorn kao systemd service
# - Konfiguriše Nginx kao reverse proxy
#
# Kako koristiti:
# 1. SSH na EC2: ssh -i key.pem ubuntu@ec2-ip-address
# 2. Preuzmi skriptu: wget https://your-repo/setup_ec2.sh
# 3. Chmod: chmod +x setup_ec2.sh
# 4. Pokreni: ./setup_ec2.sh

set -e  # Exit ako bilo koja komanda faila

echo "🎬 Starting EC2 setup for Django deployment..."

# =============================================================================
# UPDATE SISTEMA
# =============================================================================
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# =============================================================================
# INSTALACIJA OSNOVNIH PAKETA
# =============================================================================
echo "📦 Installing system dependencies..."

sudo apt install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    postgresql-client \
    libpq-dev \
    nginx \
    git \
    curl \
    build-essential \
    supervisor

# =============================================================================
# PROJEKAT FOLDER
# =============================================================================
echo "📁 Checking project directory..."

PROJECT_DIR="/home/ubuntu/Freelancer-Command-Center"
BACKEND_DIR="$PROJECT_DIR/backend"

# Proveri da li postoji projekat (trebalo bi da je već kloniran ručno)
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ ERROR: Project directory not found!"
    echo "Please clone the repository first:"
    echo "  git clone https://github.com/YOUR-USERNAME/Freelancer-Command-Center.git"
    exit 1
fi

echo "✅ Project directory found: $PROJECT_DIR"
cd $BACKEND_DIR

# =============================================================================
# PYTHON VIRTUAL ENVIRONMENT
# =============================================================================
echo "🐍 Creating Python virtual environment..."

python3.11 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements-aws.txt

# =============================================================================
# ENVIRONMENT VARIJABLE (.env)
# =============================================================================
echo "🔐 Setting up environment variables..."

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# MORA SE RUČNO UNETI PRAVE VREDNOSTI!
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# RDS Database
DB_NAME=freelance_db
DB_USER=postgres
DB_PASSWORD=YOUR_RDS_PASSWORD_HERE
DB_HOST=YOUR_RDS_ENDPOINT_HERE.rds.amazonaws.com
DB_PORT=5432

# AWS S3
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
AWS_STORAGE_BUCKET_NAME=freelance-media-YOUR_NAME
AWS_S3_REGION_NAME=eu-central-1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
EOF

    echo "⚠️  .env file created! EDIT IT WITH YOUR CREDENTIALS:"
    echo "    nano .env"
    read -p "Press Enter after editing .env file..."
fi

# =============================================================================
# DJANGO SETUP
# =============================================================================
echo "🗄️  Setting up Django..."

# Kreiranje logs folder-a
mkdir -p logs

# Database migrations
export DJANGO_SETTINGS_MODULE=config.settings_production
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Superuser će biti kreiran ručno nakon setup-a
echo "⚠️  NOTE: You will need to create a Django superuser manually after setup"
echo "    This is required to access the Django admin panel at /admin"

# =============================================================================
# GUNICORN SYSTEMD SERVICE
# =============================================================================
echo "⚙️  Configuring Gunicorn systemd service..."

# Šta je Gunicorn?
# - Python WSGI HTTP server
# - Pokreće Django aplikaciju
# - Bolje performanse od Django development server-a
#
# Šta je systemd?
# - Linux sistem za upravljanje servisima
# - Omogućava da se Gunicorn automatski pokrene kad se server restartuje

sudo tee /etc/systemd/system/gunicorn.service > /dev/null << EOF
[Unit]
Description=Gunicorn daemon for Freelance Command Center
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=config.settings_production"
ExecStart=$BACKEND_DIR/venv/bin/gunicorn \\
    --workers 3 \\
    --bind unix:$BACKEND_DIR/gunicorn.sock \\
    --timeout 60 \\
    --access-logfile $BACKEND_DIR/logs/gunicorn-access.log \\
    --error-logfile $BACKEND_DIR/logs/gunicorn-error.log \\
    config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# Objašnjenje opcija:
# --workers 3    : Broj Gunicorn worker procesa (2-4 za t2.micro)
# --bind unix    : Koristi Unix socket umesto TCP porta (brže)
# --timeout 60   : Request timeout (60 sekundi)

# Reload systemd, enable i start Gunicorn
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn

# Proveri status
sudo systemctl status gunicorn

# =============================================================================
# NGINX KONFIGURACIJA
# =============================================================================
echo "🌐 Configuring Nginx..."

# Šta je Nginx?
# - Web server (kao Apache)
# - Reverse proxy ka Gunicorn-u
# - Služi static fajlove direktno (brzo)
# - Rukuje SSL certifikatima

sudo tee /etc/nginx/sites-available/freelance > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;  # Menja se kasnije sa pravim domenom

    # Maksimalna veličina request body (za upload PDF-ova)
    client_max_body_size 10M;

    # Static files (CSS, JS, images)
    location /static/ {
        alias /home/ubuntu/freelance-command-center/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files (upload-ovani fajlovi)
    # U production-u, ovo ide na S3, ali za testing možemo ovako
    location /media/ {
        alias /home/ubuntu/freelance-command-center/backend/media/;
        expires 7d;
    }

    # Proxy sve ostale request-e ka Gunicorn-u
    location / {
        proxy_pass http://unix:/home/ubuntu/freelance-command-center/backend/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable sajt (symlink u sites-enabled)
sudo ln -sf /etc/nginx/sites-available/freelance /etc/nginx/sites-enabled/

# Disable default Nginx sajt
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx konfiguracije
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# =============================================================================
# FIREWALL (UFW)
# =============================================================================
echo "🔥 Configuring firewall..."

# UFW = Uncomplicated Firewall
# Dodatna zaštita pored AWS Security Groups

sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw --force enable

# =============================================================================
# ZAVRŠETAK
# =============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║         ✅ EC2 SETUP COMPLETE! 🎉                     ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Edit .env file with your credentials:"
echo "   nano $BACKEND_DIR/.env"
echo ""
echo "2. Run migrations again after setting up .env:"
echo "   cd $BACKEND_DIR"
echo "   source venv/bin/activate"
echo "   python manage.py migrate"
echo ""
echo "3. Create a superuser:"
echo "   python manage.py createsuperuser"
echo ""
echo "4. Test the server:"
echo "   curl http://localhost"
echo ""
echo "5. Check your EC2 public IP:"
echo "   curl http://YOUR_EC2_PUBLIC_IP"
echo ""
echo "📊 Useful commands:"
echo "   sudo systemctl status gunicorn"
echo "   sudo systemctl status nginx"
echo "   sudo journalctl -u gunicorn -f"
echo "   tail -f $BACKEND_DIR/logs/django.log"
