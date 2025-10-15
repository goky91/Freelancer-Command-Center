#!/bin/bash

# =============================================================================
# DEPLOYMENT SKRIPTA ZA EC2
# =============================================================================
#
# Ova skripta automatizuje deployment na EC2 instance.
# Pokreće se NA EC2 SERVERU (ne lokalno!)
#
# Šta radi:
# 1. Pull-uje najnoviji kod sa Git-a
# 2. Instalira Python dependencies
# 3. Primenjuje database migracije
# 4. Sakuplja static fajlove
# 5. Restartuje Gunicorn (Django server)
# 6. Restartuje Nginx (web server)
#
# Kako koristiti:
# chmod +x deploy.sh
# ./deploy.sh

set -e  # Exit odmah ako bilo koja komanda faila

echo "🚀 Starting deployment..."

# Boje za lepši output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =============================================================================
# 1. GIT PULL
# =============================================================================
echo -e "${BLUE}📥 Pulling latest code from Git...${NC}"
git pull origin main

# =============================================================================
# 2. VIRTUAL ENVIRONMENT & DEPENDENCIES
# =============================================================================
echo -e "${BLUE}📦 Installing Python dependencies...${NC}"

# Aktiviraj virtual environment ako postoji
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo -e "${RED}❌ Virtual environment not found! Creating one...${NC}"
    python3 -m venv venv
    source venv/bin/activate
fi

# Instaliraj/update-uj dependencies
pip install -r requirements-aws.txt --quiet

# =============================================================================
# 3. DATABASE MIGRATIONS
# =============================================================================
echo -e "${BLUE}🗄️  Running database migrations...${NC}"

# Proveri da li postoje nove migracije
python manage.py makemigrations --check --dry-run || {
    echo -e "${RED}⚠️  Warning: There are model changes without migrations!${NC}"
    # U production-u ne pravimo nove migracije automatski
    # Migracije se prave lokalno i commit-uju u Git
}

# Primeni migracije
python manage.py migrate --noinput

# =============================================================================
# 4. COLLECT STATIC FILES
# =============================================================================
echo -e "${BLUE}📁 Collecting static files...${NC}"
python manage.py collectstatic --noinput --clear

# =============================================================================
# 5. RESTART GUNICORN
# =============================================================================
echo -e "${BLUE}🔄 Restarting Gunicorn...${NC}"

# Gunicorn je Python web server koji pokreće Django app
# Čita konfiguraciju iz systemd service fajla

if systemctl is-active --quiet gunicorn; then
    sudo systemctl restart gunicorn
    echo -e "${GREEN}✅ Gunicorn restarted${NC}"
else
    echo -e "${RED}❌ Gunicorn service not found or not running${NC}"
    echo "Starting Gunicorn..."
    sudo systemctl start gunicorn
fi

# Proveri status
if systemctl is-active --quiet gunicorn; then
    echo -e "${GREEN}✅ Gunicorn is running${NC}"
else
    echo -e "${RED}❌ Failed to start Gunicorn${NC}"
    sudo systemctl status gunicorn
    exit 1
fi

# =============================================================================
# 6. RESTART NGINX
# =============================================================================
echo -e "${BLUE}🌐 Restarting Nginx...${NC}"

# Nginx je web server koji:
# - Služi static fajlove
# - Proxy-uje requests ka Gunicorn-u
# - Rukuje SSL certifikatima

# Prvo proveri da li je konfiguracija validna
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo -e "${GREEN}✅ Nginx restarted${NC}"
else
    echo -e "${RED}❌ Nginx configuration error!${NC}"
    exit 1
fi

# =============================================================================
# 7. HEALTH CHECK
# =============================================================================
echo -e "${BLUE}🏥 Running health check...${NC}"

# Proveri da li server odgovara
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)

if [ $response -eq 200 ]; then
    echo -e "${GREEN}✅ Server is responding (HTTP $response)${NC}"
else
    echo -e "${RED}❌ Server is not responding properly (HTTP $response)${NC}"
    exit 1
fi

# =============================================================================
# GOTOVO!
# =============================================================================
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║          ✅ DEPLOYMENT SUCCESSFUL! 🎉                ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo "📊 Services status:"
sudo systemctl status gunicorn --no-pager -l 5
sudo systemctl status nginx --no-pager -l 5

echo ""
echo "📝 Logs:"
echo "  Gunicorn: sudo journalctl -u gunicorn -f"
echo "  Nginx: sudo tail -f /var/log/nginx/error.log"
echo "  Django: tail -f logs/django.log"
