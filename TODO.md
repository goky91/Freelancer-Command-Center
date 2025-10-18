# 📋 Freelance Command Center - TODO

## ✅ Završeno

### Backend & Frontend Deployment
- ✅ EC2 instanca sa Django backend-om (Gunicorn + Nginx)
- ✅ RDS PostgreSQL baza
- ✅ S3 bucket za frontend (React)
- ✅ S3 bucket za media fajlove
- ✅ CORS konfiguracija
- ✅ Django migracije
- ✅ CI/CD pipelines (GitHub Actions)
  - Backend Pipeline: CI + CD (test → deploy na EC2)
  - Frontend Pipeline: CI + CD (build → deploy na S3)
  - Automatic deployment na main branch push
  - Manual trigger opcija (workflow_dispatch)

---

## 🔜 Preostali koraci

### 1. 🔐 **EC2 Security Group - Ograniči SSH pristup**

**Trenutno stanje:**
- SSH (port 22) otvoren za **sve IP adrese** (0.0.0.0/0) ⚠️

**Treba da uradiš:**
- Ograniči SSH pristup **samo za GitHub Actions IP range**

**Koraci:**

#### **Opcija 1: GitHub Actions IP range (preporučeno)**
```
AWS Console → EC2 → Security Groups → [tvoj SG]

Pronađi pravilo: SSH | TCP | 22 | 0.0.0.0/0

→ Edit inbound rules → Obriši postojeće SSH pravilo

→ Add rule za svaki GitHub Actions IP range:
Type: SSH
Port: 22
Source: Custom - unesi IP ranges iz liste dole
Description: GitHub Actions SSH access

GitHub Actions IP ranges (META API):
https://api.github.com/meta

Primer IP-ova (ažuriraju se, proveri link):
- 192.30.252.0/22
- 185.199.108.0/22
- 140.82.112.0/20
- 143.55.64.0/20
- 20.201.28.151/32
- 20.205.243.166/32
- 102.133.202.242/32
- (još ~20 IP range-ova)
```

#### **Opcija 2: GitHub Actions + Tvoj IP**
```
Dodaj 2 tipa pravila:

1. GitHub Actions IP ranges (kao gore)

2. Tvoj lični IP (za ručno SSH):
Type: SSH
Port: 22
Source: My IP (automatski detektuje tvoj IP)
Description: Personal SSH access
```

#### **Kako naći GitHub Actions IP range:**
```bash
# Komanda za download GitHub IP-ova
curl https://api.github.com/meta | jq -r '.actions[]'
```

**Rezultat:** SSH pristup SAMO sa GitHub Actions i tvog računara ✅

---

### 2. 🔒 **CloudFront Setup (HTTPS + CDN)**

**Zašto:**
- ✅ Besplatni SSL/HTTPS (AWS Certificate Manager)
- ✅ Brži load vremena (CDN caching)
- ✅ Custom domain podrška
- ✅ Professional URL umesto S3 URL-a

**Koraci:**
```
AWS Console → CloudFront → Create distribution

Origin:
- Origin domain: freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
  ⚠️ NE biraj iz dropdown-a! Ručno unesi S3 WEBSITE endpoint!

Settings:
- Viewer protocol policy: Redirect HTTP to HTTPS
- Cache policy: CachingOptimized
- Price class: Use only North America and Europe
- Default root object: index.html

→ Create distribution (čeka 10-15 min)
```

**Error Pages za React Router:**
```
CloudFront → Distribution → Error Pages → Create custom error response

Error 1:
- HTTP error code: 403 Forbidden
- Response page path: /index.html
- HTTP response code: 200 OK

Error 2:
- HTTP error code: 404 Not Found
- Response page path: /index.html
- HTTP response code: 200 OK
```

**Update GitHub Secret:**
```
Settings → Secrets → Actions → New repository secret
Name: CLOUDFRONT_DISTRIBUTION_ID
Value: [tvoj distribution ID]
```

**Update frontend deployment:**
- Frontend CD workflow već ima CloudFront invalidation step
- Samo dodaj CLOUDFRONT_DISTRIBUTION_ID secret i radiće automatski

---

### 3. 🌐 **Custom Domain (Opciono)**

**Backend (api.yourdomain.com):**
- Kupi domain
- Konfiguriši DNS A record → Elastic IP
- SSL: Let's Encrypt (certbot)

**Frontend (app.yourdomain.com):**
- Konfiguriši DNS CNAME → CloudFront domain
- SSL: AWS Certificate Manager (besplatno)

---

### 4. 📊 **Monitoring & Alerts**

**CloudWatch Billing Alarm:**
```
AWS Console → CloudWatch → Billing → Create alarm
Metric: EstimatedCharges
Threshold: Greater than $1
Notification: Email
```

**Application Monitoring:**
- Django logging to CloudWatch
- RDS metrics tracking
- Uptime monitoring (opciono: UptimeRobot)

---

### 5. 🔐 **Security Hardening (Additional)**

**Pre-Production Checklist:**
- [ ] Enable RDS automated backups
- [ ] Enable RDS deletion protection
- [ ] Setup EC2 snapshots
- [ ] Enable S3 versioning
- [ ] Add Django rate limiting
- [ ] Enable security headers (HSTS, CSP)
- [ ] Review IAM permissions (least privilege)

---

## 🌐 Live URLs

- **Frontend:** http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
- **Backend API:** http://3.67.201.188/api/
- **Admin:** http://3.67.201.188/admin/

---

## 📝 Korisne komande

### SSH pristup GitHub Actions IP-ova (automation):
```bash
# Download GitHub Actions IP ranges
curl -s https://api.github.com/meta | jq -r '.actions[]' > github_ips.txt

# Svaki IP range dodaj u EC2 Security Group ručno ili koristi AWS CLI
```

### CI/CD - Ručno pokretanje workflow-a:
```
GitHub → Actions → Izaberi workflow → Run workflow → main
```

### Deployment provera:
```bash
# SSH na EC2
ssh -i ~/.ssh/aws-keys/freelance-server-key.pem ubuntu@3.67.201.188

# Proveri servise
sudo systemctl status gunicorn nginx

# Logovi
sudo journalctl -u gunicorn -f
sudo tail -f /var/log/nginx/error.log
```

### Baza podataka:
```bash
# Django shell (najlakše)
cd ~/Freelancer-Command-Center/backend
source venv/bin/activate
python manage.py shell

# Proveri modele
from core.models import Client, Invoice, TimeEntry
Client.objects.all()
```

---

**Poslednji update:** 2025-10-18
**Sledeći koraci:**
1. 🔐 Ograniči SSH pristup na GitHub Actions IP-ove
2. 🔒 CloudFront setup za HTTPS
