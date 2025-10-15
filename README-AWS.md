# 🚀 Freelance Command Center - AWS Deployment

Kompletan vodič za deployment na AWS sa Free Tier opcijama.

---

## 📚 Dokumentacija

Ovaj projekat dolazi sa **detaljnom AWS deployment dokumentacijom** koja objašnjava sve AWS koncepte od nule.

### Dokumenti po redu čitanja:

1. **[AWS-CONCEPTS.md](AWS-CONCEPTS.md)** 🎓
   - Objašnjenja svih AWS koncepata (EC2, RDS, S3, CloudFront, IAM, Security Groups)
   - Analogije i primeri za lakše razumevanje
   - Idealno za početnike koji uče cloud computing
   - **Čitaj PRVI ako si nov u AWS-u!**

2. **[AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md)** 📖
   - Kompletni deployment guide sa teorijom i praksom
   - Detaljna objašnjenja šta je Free Tier i šta je besplatno
   - Arhitektura sistema sa dijagramima
   - Korak-po-korak instrukcije za AWS konzolu
   - **Glavni vodič kroz ceo proces!**

3. **[AWS-QUICK-START.md](AWS-QUICK-START.md)** ⚡
   - Brzi pregled svih koraka (bez detaljnih objašnjenja)
   - Reference dokument nakon što naučiš koncepte
   - Konkretne AWS konzole instrukcije (click-by-click)
   - Deployment skripte objašnjene
   - **Za brzo deployment kad već znaš AWS!**

4. **[AWS-CHECKLIST.md](AWS-CHECKLIST.md)** ✅
   - Interaktivni checklist sa checkbox-evima
   - Prati napredak kroz deployment
   - Final test plan
   - Troubleshooting sekcija
   - **Koristi dok deployuješ da ne zaboraviš ništa!**

---

## 🎯 Quick Links

**Potpuni početnik?**
→ Kreni sa [AWS-CONCEPTS.md](AWS-CONCEPTS.md)

**Spreman za deployment?**
→ Prati [AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md)

**Već znaš AWS?**
→ Koristi [AWS-QUICK-START.md](AWS-QUICK-START.md)

**Deployment u toku?**
→ Proveri [AWS-CHECKLIST.md](AWS-CHECKLIST.md)

---

## 🏗️ AWS Arhitektura (High-Level)

```
┌─────────────────────────────────────────────────────┐
│                    KORISNICI                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │   CloudFront CDN (HTTPS)  │  ← 50GB free/mesec
         └───────────┬───────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│  S3 - Frontend  │   │  EC2 - Backend  │  ← t2.micro free
│  (React build)  │   │  Django+Nginx   │     750h/mesec
└─────────────────┘   └────────┬────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
          ┌─────────────────┐   ┌─────────────────┐
          │  RDS PostgreSQL │   │  S3 - Media     │
          │  (db.t3.micro)  │   │  (PDF faktore)  │
          └─────────────────┘   └─────────────────┘
               ↑ free 750h/mes       ↑ 5GB free
```

**Totalni mesečni trošak nakon Free Tier-a (~$28):**
- EC2 t2.micro: ~$8.50
- RDS db.t3.micro: ~$15
- S3 storage: ~$0.50
- CloudFront: ~$4

**Ali prvih 12 meseci = 100% BESPLATNO! 🎉**

---

## 📦 Šta smo pripremili?

### Backend Files

```
backend/
├── Dockerfile                    # Docker image za deployment
├── requirements-aws.txt          # Python packages za AWS
├── .env.example                  # Template za environment vars
├── setup_ec2.sh                  # Initial EC2 server setup (chmod +x)
├── deploy.sh                     # Deployment automation (chmod +x)
└── config/
    ├── settings.py               # Development settings
    └── settings_production.py    # Production settings (AWS)
```

### Frontend Files

```
frontend/
└── deploy-frontend.sh            # S3 deployment script (chmod +x)
```

### Konfiguracija

#### Backend Production Settings

**[backend/config/settings_production.py](backend/config/settings_production.py)**
- PostgreSQL umesto SQLite
- S3 storage za media fajlove
- WhiteNoise za static fajlove
- Security settings (HTTPS ready)
- Logging konfiguracija
- Environment variables preko python-decouple

#### Environment Variables

**[backend/.env.example](backend/.env.example)**
Kopiraj u `.env` i unesi prave vrednosti:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Potrebni env vars:
- `SECRET_KEY` - Django secret key
- `DB_*` - RDS PostgreSQL credentials
- `AWS_*` - S3 access keys
- `ALLOWED_HOSTS` - EC2 IP/domain
- `CORS_ALLOWED_ORIGINS` - Frontend URLs

---

## 🚀 Deployment Koraci (TL;DR)

### 1. AWS Resursi (AWS Console)

```bash
# Kreiraj preko AWS konzole:
✅ RDS PostgreSQL (db.t3.micro, 20GB)
✅ S3 Buckets (frontend + media)
✅ IAM Role (FreelanceEC2Role)
✅ EC2 Instance (t2.micro, Ubuntu 22.04)
```

Detalji: [AWS-QUICK-START.md](AWS-QUICK-START.md#aws-konzola)

### 2. Backend na EC2

```bash
# SSH na EC2
ssh -i key.pem ubuntu@EC2-IP

# Clone repo
git clone https://github.com/YOUR-USERNAME/freelance-command-center.git
cd freelance-command-center/backend

# Setup (instalira sve dependencies, Nginx, Gunicorn)
./setup_ec2.sh

# Edituj .env sa pravim credentials-ima
nano .env

# Django setup
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings_production
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic

# Proveri
curl http://localhost
```

### 3. Frontend na S3

```bash
# Lokalno, u frontend folderu
cd frontend

# Update API endpoint
# Edit src/api.ts → API_BASE_URL = 'http://EC2-IP:8000/api'

# Build
npm run build

# Deploy na S3
./deploy-frontend.sh
```

### 4. CloudFront (opciono)

```bash
# AWS Console → CloudFront → Create distribution
# Origin: S3 website endpoint
# Detalji: AWS-QUICK-START.md
```

---

## 🛠️ Maintenance

### Update Backend

```bash
# SSH na EC2
ssh -i key.pem ubuntu@EC2-IP

# Pull latest code i deploy
cd ~/freelance-command-center/backend
git pull origin main
./deploy.sh
```

### Update Frontend

```bash
# Lokalno
cd frontend
npm run build
./deploy-frontend.sh
```

### Logs

```bash
# Backend logs
sudo journalctl -u gunicorn -f
tail -f ~/freelance-command-center/backend/logs/django.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 💰 Free Tier Limiti - ČUVAJ SE!

### AWS Free Tier (12 meseci od registracije)

| Servis     | Free Tier Limit        | Šta se naplaćuje ako predješ          |
|------------|------------------------|---------------------------------------|
| EC2        | 750h/mes (t2.micro)    | $0.012/sat (~$9/mesec za 24/7)       |
| RDS        | 750h/mes (db.t3.micro) | $0.018/sat (~$13/mesec)              |
| S3         | 5GB storage            | $0.023/GB/mesec                       |
| Data out   | 100GB/mes              | $0.09/GB                              |
| CloudFront | 50GB transfer          | $0.085/GB                             |

### Kako ostati u Free Tier-u:

✅ **1 EC2 instance** (t2.micro) 24/7 = OK (750h)
✅ **1 RDS instance** (db.t3.micro) 24/7 = OK (750h)
✅ **< 5GB** fajlova na S3 = OK
✅ **< 100GB** download-a mesečno = OK

❌ **2 EC2 instance** 24/7 = 1500h = **PREKORAČENJE!**
❌ **Stopping/Starting** ne štedi sate - i dalje koristi EBS storage!

### Postavi Billing Alert!

```
AWS Console → CloudWatch → Billing → Create alarm
Threshold: $1
```

---

## 🔐 Sigurnost Best Practices

### ✅ Urađeno u deployment-u

- Django `DEBUG=False` u production
- PostgreSQL pristup samo sa EC2 (Security Group)
- S3 media bucket je privatan
- IAM Role umesto hardcoded AWS keys
- SSH pristup samo sa tvoje IP adrese

### 🔒 Dodatno (opciono)

- **HTTPS:** Certbot + Let's Encrypt (besplatno)
- **Secrets Manager:** AWS Systems Manager Parameter Store
- **Database backups:** RDS automated backups (7 dana)
- **MFA:** Uključi Multi-Factor Auth za AWS nalog
- **CloudTrail:** Loguj sve AWS API pozive

---

## 🆘 Troubleshooting

### Backend ne radi

```bash
# Proveri servise
sudo systemctl status gunicorn
sudo systemctl status nginx

# Restart
sudo systemctl restart gunicorn nginx

# Logovi
sudo journalctl -u gunicorn --no-pager -n 50
```

### RDS konekcija ne uspeva

```bash
# Test konekcije
psql -h RDS-ENDPOINT -U postgres -d freelance_db

# Proveri Security Group
# RDS SG mora dozvoliti pristup sa EC2 SG (port 5432)
```

### Frontend ne vidi backend (CORS error)

```python
# Django settings_production.py
CORS_ALLOWED_ORIGINS = [
    'http://your-s3-bucket.s3-website.eu-central-1.amazonaws.com',
    'https://your-cloudfront-domain.cloudfront.net',
]

# Restart Gunicorn nakon izmene
sudo systemctl restart gunicorn
```

### 403 Error na S3 website

- Proveri Bucket Policy (mora dozvoliti public read)
- Proveri "Block public access" settings (mora biti OFF)

---

## 📚 Dodatni Resursi

### AWS Dokumentacija
- [AWS Free Tier](https://aws.amazon.com/free/)
- [EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [RDS Documentation](https://docs.aws.amazon.com/rds/)
- [S3 Documentation](https://docs.aws.amazon.com/s3/)

### Django Production
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [WhiteNoise Documentation](http://whitenoise.evans.io/)

### Tutorials
- [AWS re:Invent Videos](https://www.youtube.com/user/AmazonWebServices)
- [Django Girls Deployment Guide](https://tutorial.djangogirls.org/en/deploy/)

---

## 🎓 Šta si naučio?

Nakon što deployuješ ovaj projekat, naučićeš:

✅ **AWS Osnovni Koncepti:**
- EC2 (virtuelne mašine)
- RDS (managed baze podataka)
- S3 (object storage)
- CloudFront (CDN)
- IAM (permissions)
- Security Groups (firewall)

✅ **DevOps Skills:**
- Linux server administracija
- Nginx reverse proxy
- Systemd services
- SSH i key management
- Deployment automation

✅ **Django Production:**
- Production settings
- PostgreSQL migracije
- Static/media files handling
- Environment variables
- Logging

✅ **React Deployment:**
- Production build
- Environment variables
- CDN deployment
- CORS handling

---

## 🚀 Sledeći Koraci

Nakon uspešnog deployment-a:

1. **Custom Domain** - Kupi domain i povežite sa CloudFront
2. **SSL/HTTPS** - Let's Encrypt besplatan certifikat
3. **CI/CD** - GitHub Actions za automatski deployment
4. **Monitoring** - CloudWatch dashboards i alarme
5. **Email** - Amazon SES za slanje faktura
6. **Backups** - Automatizovani RDS snapshots

---

## 💡 Tips & Tricks

### Save Money

```bash
# Stop EC2 kad ne koristiš (dev/test environment)
aws ec2 stop-instances --instance-ids i-xxxxx

# Delete stare RDS snapshots
# Delete nepotrebne S3 fajlove
```

### Development Workflow

```bash
# Lokalni development
python manage.py runserver  # Backend
npm start                    # Frontend

# Deploy na AWS samo kad je ready
git push origin main
ssh ec2 './deploy.sh'
```

### AWS CLI Quick Commands

```bash
# List EC2 instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]'

# List S3 buckets
aws s3 ls

# Sync local folder to S3
aws s3 sync ./build/ s3://bucket-name/

# RDS databases
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,Endpoint.Address,DBInstanceStatus]'
```

---

## 📞 Podrška

**Za pitanja o projektu:**
- Otvori Issue na GitHub-u
- Kontaktiraj autora

**Za AWS podrška:**
- [AWS Support](https://console.aws.amazon.com/support/)
- [AWS Forums](https://forums.aws.amazon.com/)
- [Stack Overflow (aws tag)](https://stackoverflow.com/questions/tagged/amazon-web-services)

---

**Srećno sa deployment-om! 🎉**

*Napravljeno sa ❤️ za učenje AWS-a kroz praksu*
