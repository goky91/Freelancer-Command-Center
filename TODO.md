# 📋 Freelance Command Center - Deployment Status

## 🎉 DEPLOYMENT USPEŠAN! (Completed - October 16, 2025)

---

## ✅ Završeno (Completed)

### Backend Deployment (EC2 + RDS)
- ✅ EC2 instanca kreirana i konfigurisana (Ubuntu 22.04 - t2.micro)
- ✅ Gunicorn systemd service konfigurisan i pokrenut
- ✅ Nginx web server instaliran i konfigurisan kao reverse proxy
- ✅ Nginx→Gunicorn Unix socket konekcija ispravljena (dodato `:` na kraju socket path-a)
- ✅ RDS PostgreSQL baza kreirana i konfigurisana (db.t3.micro - FREE TIER)
- ✅ Django migracije izvršene - sve tabele kreirane u bazi
- ✅ Environment varijable (.env) konfigurisane sa production credentials
- ✅ Security Groups pravilno konfigurisani
  - EC2: HTTP (80), HTTPS (443), SSH (22)
  - RDS: PostgreSQL (5432) - pristup samo od EC2
- ✅ Django superuser kreiran: `goky91`
- ✅ Admin panel funkcionalan: `http://3.67.201.188/admin/`

### Frontend Deployment (S3)
- ✅ S3 bucket kreiran: `freelance-frontend-goran-bucket`
- ✅ Static website hosting omogućen
- ✅ Bucket policy konfigurisana za public read access
- ✅ React aplikacija build-ovana i deploy-ovana
- ✅ S3 redirect rules konfigurisani (eliminirani 404 console errors)
- ✅ Frontend URL: `http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com`

### AWS Credentials & Permissions
- ✅ AWS CLI instaliran i konfigurisan lokalno
- ✅ Novi AWS Access Keys generisani
- ✅ IAM user permissions konfigurisani (AmazonS3FullAccess)
- ✅ EC2 .env update-ovan sa validnim AWS credentials
- ✅ S3 media bucket spreman za upload: `freelance-media-goran-bucket`
- ✅ S3 upload funkcionalan (testirano iz Django shell-a)

### CORS & API Connectivity
- ✅ Django CORS settings konfigurisani
- ✅ S3 frontend URL dodat u CORS_ALLOWED_ORIGINS (BEZ space-a!)
- ✅ Frontend API endpoint update-ovan na novu EC2 IP: `http://3.67.201.188/api`
- ✅ Register/Login funkcionalan sa frontend-a
- ✅ API komunikacija frontend ↔ backend radi

### Konfiguracioni fajlovi
- ✅ `backend/setup_ec2.sh` - ispravljeni path-evi (Freelancer-Command-Center)
- ✅ `backend/setup_ec2.sh` - Nginx Unix socket syntax fix (`gunicorn.sock:`)
- ✅ `backend/setup_ec2.sh` - uklonjen automatski git clone
- ✅ `backend/setup_ec2.sh` - uklonjena automatska kreacija superuser-a
- ✅ `frontend/deploy-frontend.sh` - bucket name: `freelance-frontend-goran-bucket`
- ✅ `frontend/deploy-frontend.sh` - uklonjeni `--acl` flag-ovi (bucket owner enforced)
- ✅ `frontend/src/api.ts` - API URL update-ovan na EC2 IP

---

## 📊 Trenutno stanje aplikacije

### 🌐 Live URL-ovi:
- **Frontend:** http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
- **Backend API:** http://3.67.201.188/api/
- **Admin Panel:** http://3.67.201.188/admin/

### ✅ Funkcionalne Features:
- User registration i authentication
- Login/Logout
- Django admin panel pristup
- API endpoints dostupni
- CORS pravilno konfigurisan
- S3 redirect rules eliminišu 404 errors

### 📦 AWS Resursi:
| Resurs | Tip | Status | Region |
|--------|-----|--------|--------|
| EC2 | t2.micro | ✅ Running | eu-central-1 |
| RDS | db.t3.micro PostgreSQL | ✅ Available | eu-central-1 |
| S3 Frontend | freelance-frontend-goran-bucket | ✅ Active | eu-central-1 |
| S3 Media | freelance-media-goran-bucket | ✅ Active | eu-central-1 |

---

## ⚠️ Poznati Issue-vi i Rešenja

### 1. **EC2 IP adresa se menja posle STOP/START**
- **Problem:** Kada se EC2 stopira i ponovo startuje, dobija novu Public IP
- **Trenutna IP:** `3.67.201.188` (promenila se sa `18.184.247.135`)
- **Impact:** Moraš update-ovati:
  - Django `ALLOWED_HOSTS` u `.env`
  - Frontend `API_URL` u `src/api.ts`
  - Rebuild i redeploy frontend
- **Rešenje:** 👉 **Alociraj Elastic IP** (vidi sledeće korake)

### 2. **Nginx i Gunicorn servisi se ne pokreću automatski posle STOP**
- **Problem:** Systemd servisi nisu automatski startovani
- **Rešenje:** Ručno pokreni:
  ```bash
  sudo systemctl start nginx
  sudo systemctl start gunicorn
  sudo systemctl enable nginx
  sudo systemctl enable gunicorn
  ```

### 3. **S3 Upload 403 Forbidden error**
- **Problem:** Stari AWS credentials u EC2 `.env` fajlu
- **Rešenje:** ✅ Resolved - update-ovani sa novim credentials-ima

### 4. **CORS error na frontendu**
- **Problem:** Space posle zapete u `CORS_ALLOWED_ORIGINS`
- **Rešenje:** ✅ Resolved - uklonjeni space-ovi

### 5. **PDF fakture ne idu na S3**
- **Razlog:** PDF-ovi se generišu "on-the-fly" i ne persist-uju u bazi
- **Status:** ✅ Očekivano ponašanje - nije bug
- **Objašnjenje:** `Invoice` model nema `pdf_file` field - PDF se dinamički generiše pri download-u

---

## 🔜 Sledeći koraci (Recommended)

### 1. 🎯 **Elastic IP - PRIORITET!**

**Zašto je bitno:**
- IP adresa ostaje ista čak i posle EC2 STOP/START
- Ne moraš update-ovati frontend svaki put
- Besplatno dok god je attached na running instancu

**Kako alcocirati:**
```
AWS Console → EC2 → Elastic IPs → Allocate Elastic IP address
→ Actions → Associate Elastic IP address
→ Instance: [tvoja EC2 instanca]
→ Private IP: [selektuj iz dropdown-a]
→ Associate
```

**Nakon alokacije:**
1. Update Django `.env` na EC2:
   ```bash
   ALLOWED_HOSTS=localhost,127.0.0.1,[ELASTIC_IP]
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
   ```

2. Update frontend `src/api.ts`:
   ```typescript
   const API_URL = 'http://[ELASTIC_IP]/api';
   ```

3. Rebuild i redeploy frontend:
   ```bash
   npm run build
   ./deploy-frontend.sh
   ```

4. Restart Gunicorn:
   ```bash
   sudo systemctl restart gunicorn
   ```

**⚠️ VAŽNO:** Elastic IP košta ako je **NEATTACHED** na running instancu! Mora biti attached ili se briše.

---

### 2. 🔒 **HTTPS sa CloudFront (Opciono)**

**Prednosti:**
- SSL/HTTPS besplatno (AWS Certificate Manager)
- Brži load vremena (CDN caching)
- Custom domain podrška
- Professional URL umesto S3 URL-a

**Koraci:**
```
AWS Console → CloudFront → Create distribution

Origin domain: freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
  ⚠️ NE biraj iz dropdown-a! Ručno unesi S3 WEBSITE endpoint!

Viewer protocol policy: Redirect HTTP to HTTPS
Cache policy: CachingOptimized
Price class: Use only North America and Europe
Default root object: index.html

Create distribution (čeka 10-15 min)
```

**Konfiguriši Error Pages za React Router:**
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

**Update deployment script:**
```bash
# frontend/deploy-frontend.sh
CLOUDFRONT_DISTRIBUTION_ID="E1234ABCDEFGH"  # Tvoj distribution ID
```

---

### 3. 🌐 **Custom Domain (Opciono)**

**Backend:**
- Kupi domain (npr: yourdomain.com)
- Konfiguriši DNS A record: `api.yourdomain.com` → Elastic IP
- SSL certifikat: Let's Encrypt (certbot)

**Frontend:**
- Konfiguriši DNS CNAME: `app.yourdomain.com` → CloudFront domain
- SSL: AWS Certificate Manager (besplatno)

---

### 4. 🔐 **Security Hardening (Pre Production)**

**RDS:**
- ✅ Public access: NO (already done)
- ✅ Security Group: Only EC2 access (already done)
- ⚠️ Enable automated backups
- ⚠️ Enable deletion protection

**EC2:**
- ✅ SSH restricted to your IP
- ⚠️ Update `ALLOWED_HOSTS` sa final domain/Elastic IP
- ⚠️ Enable CloudWatch monitoring
- ⚠️ Setup automated snapshots

**Django:**
- ✅ DEBUG=False (already done)
- ✅ SECRET_KEY unique (already done)
- ⚠️ Add rate limiting (django-ratelimit)
- ⚠️ Enable security middleware (SECURE_SSL_REDIRECT, SECURE_HSTS, etc.)

**S3:**
- ✅ Media bucket: Private (already done)
- ✅ Frontend bucket: Public read only (already done)
- ⚠️ Enable versioning
- ⚠️ Enable logging

---

### 5. 📊 **Monitoring & Alerts**

**CloudWatch Billing Alarm:**
```
AWS Console → CloudWatch → Billing → Create alarm
Metric: EstimatedCharges
Threshold: Greater than $1 (early warning!)
Notification: Create SNS topic → Unesi email
```

**Application Monitoring:**
- Setup Django logging to CloudWatch
- Monitor Gunicorn/Nginx error logs
- Track RDS metrics (connections, CPU, storage)

---

## 📝 Važne komande za održavanje

### EC2 Server Maintenance

**SSH pristup:**
```bash
ssh -i ~/.ssh/aws-keys/freelance-server-key.pem ubuntu@3.67.201.188
# (Update IP nakon Elastic IP alokacije)
```

**Restart servisa:**
```bash
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

**Proveri status:**
```bash
sudo systemctl status gunicorn
sudo systemctl status nginx
```

**Logovi:**
```bash
# Gunicorn logs (live)
sudo journalctl -u gunicorn -f

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Django app logs
tail -f ~/Freelancer-Command-Center/backend/logs/gunicorn-error.log
```

**Django management:**
```bash
cd ~/Freelancer-Command-Center/backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings_production

# Migracije
python manage.py migrate

# Collect static
python manage.py collectstatic --noinput

# Django shell
python manage.py shell

# Kreiraj superuser
python manage.py createsuperuser
```

**Update aplikacije (git pull):**
```bash
cd ~/Freelancer-Command-Center
git pull
cd backend
source venv/bin/activate
pip install -r requirements-aws.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

---

### Frontend Deployment (Lokalno)

**Build i deploy:**
```bash
cd ~/DevProjects/freelance-command-center/frontend

# Instaliraj dependencies (ako treba)
npm install

# Build production verzija
npm run build

# Deploy na S3
./deploy-frontend.sh
```

**Update API endpoint (ako se IP promeni):**
```bash
# Edituj src/api.ts
nano src/api.ts

# Promeni:
const API_URL = 'http://[NOVA_IP]/api';

# Rebuild i deploy
npm run build
./deploy-frontend.sh
```

---

## 🎓 Šta si naučio kroz ovaj deployment

### AWS Services:
- ✅ **EC2** - Virtuelne mašine, instance types, security groups
- ✅ **RDS** - Managed PostgreSQL baza, backups, multi-AZ
- ✅ **S3** - Object storage, static website hosting, bucket policies
- ✅ **IAM** - Users, roles, policies, access keys
- ✅ **VPC** - Networking, security groups, subnets

### DevOps Skills:
- ✅ Linux server administracija (Ubuntu)
- ✅ SSH i secure key management
- ✅ Systemd services (Gunicorn, Nginx)
- ✅ Nginx kao reverse proxy
- ✅ Environment variables management
- ✅ Deployment automation (bash scripts)

### Django Production:
- ✅ Production settings vs Development
- ✅ PostgreSQL konfiguracija
- ✅ Static/Media file handling (WhiteNoise, S3)
- ✅ CORS konfiguracija
- ✅ Security best practices (DEBUG=False, SECRET_KEY, ALLOWED_HOSTS)

### React Deployment:
- ✅ Production build optimizacija
- ✅ S3 static hosting
- ✅ React Router sa S3 (redirect rules)
- ✅ Environment-specific configurations

### Troubleshooting:
- ✅ CORS errors
- ✅ 502 Bad Gateway (Nginx→Gunicorn)
- ✅ S3 403 Forbidden (permissions)
- ✅ SignatureDoesNotMatch (AWS credentials)
- ✅ Unix socket syntax (`gunicorn.sock:`)
- ✅ Bucket owner enforced (ACL disabled)

---

## 📚 Korisni resursi

- [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Gunicorn Docs](https://docs.gunicorn.org/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [React Router with S3](https://via.studio/journal/hosting-a-reactjs-app-with-routing-on-aws-s3)

---

## 🐛 Troubleshooting Common Issues

### EC2 ne reaguje nakon reboot-a:
```bash
# Proveri da li su servisi startovani
sudo systemctl status nginx
sudo systemctl status gunicorn

# Ako nisu:
sudo systemctl start nginx
sudo systemctl start gunicorn
```

### CORS error na frontendu:
```bash
# Proveri CORS_ALLOWED_ORIGINS u .env
cat ~/Freelancer-Command-Center/backend/.env | grep CORS

# Mora biti BEZ space-ova:
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://bucket-name.s3-website...

# Restart Gunicorn
sudo systemctl restart gunicorn
```

### 502 Bad Gateway:
```bash
# Proveri Gunicorn status
sudo systemctl status gunicorn

# Proveri socket fajl
ls -la ~/Freelancer-Command-Center/backend/gunicorn.sock

# Proveri Nginx error log
sudo tail -20 /var/log/nginx/error.log

# Restart oba
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

### S3 upload ne radi:
```bash
# Proveri AWS credentials u .env
cat ~/Freelancer-Command-Center/backend/.env | grep AWS_

# Testiraj upload
cd ~/Freelancer-Command-Center/backend
source venv/bin/activate
python manage.py shell

>>> from django.core.files.storage import default_storage
>>> from django.core.files.base import ContentFile
>>> path = default_storage.save("test.txt", ContentFile(b"test"))
>>> print(path)
```

---

## 💰 Cost Monitoring

**Free Tier Limits (12 meseci):**
- EC2 t2.micro: 750 sati/mesec (1 instanca 24/7)
- RDS db.t3.micro: 750 sati/mesec + 20GB storage
- S3: 5GB storage + 20,000 GET + 2,000 PUT
- Data transfer: 15GB/mesec

**⚠️ Šta MOŽE koštati:**
- Elastic IP ako je **UNATTACHED** ($0.005/sat)
- RDS backup storage iznad 20GB
- S3 storage iznad 5GB
- Data transfer iznad 15GB

**Billing Alarm Setup:**
```
CloudWatch → Billing → Create alarm
Threshold: $1 → Email notification
```

---

## 🎯 Production Checklist (Pre Go-Live)

### Security:
- [ ] Elastic IP alocirano
- [ ] SSH limited to specific IP
- [ ] RDS public access disabled
- [ ] Django DEBUG=False
- [ ] Strong SECRET_KEY
- [ ] HTTPS enabled (CloudFront)
- [ ] ALLOWED_HOSTS updated
- [ ] Rate limiting enabled

### Performance:
- [ ] CloudFront CDN setup
- [ ] Static files cached
- [ ] Database indexes optimized
- [ ] Gunicorn workers tuned

### Monitoring:
- [ ] Billing alerts active
- [ ] CloudWatch monitoring enabled
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring

### Backups:
- [ ] RDS automated backups enabled
- [ ] EC2 snapshots scheduled
- [ ] Database dump script created
- [ ] S3 versioning enabled

---

**Poslednji update:** 2025-10-16
**Status:** ✅ Production-ready (nakon Elastic IP alokacije)
**Sledeći korak:** 🎯 Alociraj Elastic IP da IP ne bi se menjala!
