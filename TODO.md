# 📋 Freelance Command Center - Deployment TODO

## ✅ Završeno (Completed)

### Backend Deployment
- ✅ EC2 instanca konfigurisana
- ✅ Gunicorn service pokrenut i radi
- ✅ Nginx web server konfigurisan
- ✅ Nginx→Gunicorn konekcija ispravljena (Unix socket syntax - dodato `:`)
- ✅ RDS PostgreSQL baza kreirana i konfigurisana
- ✅ Django migracije izvršene - tabele kreirane u bazi
- ✅ Environment varijable (.env) konfigurisane na EC2
- ✅ Security Groups konfigurisani (HTTP port 80 otvoren)
- ✅ Admin panel dostupan: `http://18.184.247.135/admin/`

### Fajlovi izmenjeni i push-ovani na GitHub
- ✅ `backend/setup_ec2.sh` - ispravljeni path-evi (Freelancer-Command-Center)
- ✅ `backend/setup_ec2.sh` - Nginx Unix socket syntax fix (`gunicorn.sock:`)
- ✅ `backend/setup_ec2.sh` - uklonjen automatski git clone (pretpostavka da je ručno klonirano)
- ✅ `backend/setup_ec2.sh` - uklonjena automatska kreacija superuser-a
- ✅ `frontend/deploy-frontend.sh` - bucket name postavljen na `freelance-frontend-goran-bucket`

---

## ⏸️ Trenutni problem (Where We Stopped)

### AWS S3 Frontend Deployment - Credentials Error

**Problem:**
```
SignatureDoesNotMatch - AWS Access Keys nisu validni
```

Frontend build radi lokalno, ali upload na S3 ne uspeva zbog problema sa AWS credentials.

---

## 🔧 Sledeći koraci (Next Steps)

### 1. Popravi AWS Credentials

#### A) Kreiraj NOVE AWS Access Keys:
```
AWS Console → IAM → Users → [tvoj IAM user] → Security credentials tab
```

**Koraci:**
1. Obriši stare Access Keys:
   - Access keys → Actions → Deactivate/Delete

2. Kreiraj NOV Access Key:
   - Access keys → Create access key
   - Use case: Command Line Interface (CLI)
   - ✅ Čekiran checkbox "I understand..."
   - Create access key

3. **VAŽNO: SAČUVAJ OBA KREDENCIJALA ODMAH!**
   - Access Key ID (npr: AKIAXXXXXXXXXXXXXXXX)
   - Secret Access Key (prikazuje se samo jednom!)
   - Download .csv ili kopiraj u password manager

#### B) Proveri IAM Permissions:
```
IAM → Users → [tvoj user] → Permissions tab
```

**Proveri da ima policy:**
- ✅ **AmazonS3FullAccess** (ili custom S3 policy)

Ako nema, dodaj:
- Add permissions → Attach policies directly → Selektuj AmazonS3FullAccess → Add permissions

---

### 2. Konfiguriši AWS CLI sa NOVIM credentials

```bash
# Obriši stare credentials
rm -rf ~/.aws/

# Konfiguriši sa novim
aws configure

# Unesi:
AWS Access Key ID: [NOVI KEY koji si upravo kreirao]
AWS Secret Access Key: [NOVI SECRET koji si upravo kreirao]
Default region name: eu-central-1
Default output format: json
```

---

### 3. Testiraj AWS konekciju

```bash
# Test 1: Proveri identitet
aws sts get-caller-identity

# Očekivani output:
# {
#     "UserId": "AIDAXXXXXXXXXXXXXXXXX",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/deployer"
# }

# Test 2: Lista S3 bucketa
aws s3 ls

# Trebao bi videti listu bucketa, uključujući:
# freelance-frontend-goran-bucket
# freelance-media-goran-bucket
```

**Ako oba testa prođu ✅ - credentials su validni!**

---

### 4. Deploy Frontend na S3

```bash
# Navigiraj u frontend folder
cd ~/DevProjects/freelance-command-center/frontend

# Pokreni deployment skriptu
./deploy-frontend.sh
```

**Šta skripta radi:**
1. Proverava da li je AWS CLI instaliran ✅
2. Proverava node_modules (instalira ako treba)
3. Build-uje React aplikaciju (`npm run build`)
4. Upload-uje build/ folder na S3
5. Postavlja cache headers

**Očekivani output:**
```
🚀 Starting frontend deployment...
🔍 Checking AWS CLI...
✅ AWS CLI found
📦 Checking dependencies...
🏗️  Building React application...
✅ Build completed
☁️  Uploading to S3...
✅ Files uploaded to S3
✅ FRONTEND DEPLOYMENT SUCCESSFUL! 🎉

🌐 Your website is available at:
   S3: http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
```

---

### 5. Konfiguriši S3 Bucket za Static Website Hosting

Ako već nije konfigurisano:

```
AWS Console → S3 → freelance-frontend-goran-bucket
→ Properties tab → Static website hosting → Edit
```

**Settings:**
- ✅ Enable
- Hosting type: Host a static website
- Index document: `index.html`
- Error document: `index.html` (za React Router)
- Save changes

**Kopiraj Bucket website endpoint URL** (npr: `http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com`)

---

### 6. Update Django CORS Settings

Dodaj frontend URL u Django CORS:

```bash
# SSH na EC2
ssh -i ~/.ssh/aws-keys/freelance-server-key.pem ubuntu@18.184.247.135

# Edituj .env
nano ~/Freelancer-Command-Center/backend/.env
```

**Promeni:**
```bash
# Staro:
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Novo (dodaj S3 URL):
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
```

**Sačuvaj i restart Gunicorn:**
```bash
sudo systemctl restart gunicorn
```

---

### 7. Kreiraj Django Superuser

```bash
# Na EC2 serveru
cd ~/Freelancer-Command-Center/backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings_production

# Kreiraj superuser-a
python manage.py createsuperuser

# Unesi:
Username: admin
Email: admin@example.com
Password: [tvoja sigurna lozinka]
Password (again): [ponovi]
```

**Output:**
```
Superuser created successfully.
```

---

### 8. Update Frontend API Endpoint

Edituj frontend da koristi EC2 backend URL:

```bash
# Lokalno na svom računaru
cd ~/DevProjects/freelance-command-center/frontend
```

**Pronađi i edituj API config fajl** (npr: `src/api.ts`, `src/config.ts`, ili `.env`):

```typescript
// Staro (development):
const API_BASE_URL = 'http://localhost:8000/api';

// Novo (production):
const API_BASE_URL = 'http://18.184.247.135/api';
```

**Rebuild i redeploy:**
```bash
npm run build
./deploy-frontend.sh
```

---

### 9. Testiranje

#### A) Test Backend:
```
http://18.184.247.135/admin/
```
- ✅ Django admin login stranica se učitava
- ✅ Login sa superuser credentials radi

#### B) Test Frontend:
```
http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
```
- ✅ React aplikacija se učitava
- ✅ Login/Register forme su vidljive
- ✅ API pozivi rade (frontend→backend komunikacija)

#### C) Test Full Flow:
1. Otvori frontend
2. Registruj novog korisnika
3. Uloguj se
4. Kreiraj test klijenta
5. Kreiraj test fakturu
6. Proveri u Django admin panelu da su podaci u bazi

---

## 📊 Opciono: CloudFront CDN (za HTTPS i bolji performance)

### Kreiranje CloudFront Distribution:

```
AWS Console → CloudFront → Create distribution
```

**Settings:**
- Origin domain: `freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com`
  - ⚠️ NE biraj iz dropdown-a! Ručno unesi S3 WEBSITE endpoint!
- Viewer protocol policy: Redirect HTTP to HTTPS
- Allowed HTTP methods: GET, HEAD
- Cache policy: CachingOptimized
- Price class: Use only North America and Europe
- Default root object: `index.html`

**Create distribution** (čeka 10-15 minuta da deploy-uje)

---

### CloudFront Error Pages (za React Router):

```
CloudFront → [tvoja distribucija] → Error Pages → Create custom error response
```

**Kreiraj 2 pravila:**

**Pravilo 1:**
- HTTP error code: 403 Forbidden
- Customize error response: Yes
- Response page path: `/index.html`
- HTTP response code: 200 OK

**Pravilo 2:**
- HTTP error code: 404 Not Found
- Customize error response: Yes
- Response page path: `/index.html`
- HTTP response code: 200 OK

---

### Update Deployment Script za CloudFront:

```bash
nano frontend/deploy-frontend.sh
```

**Dodaj CloudFront Distribution ID:**
```bash
CLOUDFRONT_DISTRIBUTION_ID="E1234ABCDEFGHI"  # Tvoj distribution ID
```

**Sada deployment skripta će automatski invalidate-ovati CloudFront cache!**

---

## 🔐 Security Checklist (Pre Go-Live)

### RDS Security:
- ✅ Public access: NO
- ✅ Security Group: Dozvoljava pristup SAMO od EC2 Security Group-a

### EC2 Security:
- ✅ SSH (port 22): SAMO sa tvoje IP adrese
- ✅ HTTP (port 80): Anywhere (0.0.0.0/0)
- ✅ HTTPS (port 443): Anywhere (0.0.0.0/0) - ako koristiš SSL

### Django Settings:
- ✅ DEBUG=False
- ✅ SECRET_KEY = random i jedinstven
- ✅ ALLOWED_HOSTS = EC2 IP, CloudFront domain (ako ga koristiš)

### AWS Credentials:
- ❌ NIKAD ne commituj .env fajl sa credentials-ima!
- ✅ Proveri da je `.env` u `.gitignore`

---

## 📝 Važne komande za održavanje

### Backend (EC2):

```bash
# SSH pristup
ssh -i ~/.ssh/aws-keys/freelance-server-key.pem ubuntu@18.184.247.135

# Restart servisa
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# Proveri status
sudo systemctl status gunicorn
sudo systemctl status nginx

# Logovi
sudo journalctl -u gunicorn -f
sudo tail -f /var/log/nginx/error.log

# Django komande
cd ~/Freelancer-Command-Center/backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings_production
python manage.py migrate
python manage.py collectstatic --noinput
```

### Frontend (Lokalno):

```bash
# Build i deploy
cd ~/DevProjects/freelance-command-center/frontend
npm run build
./deploy-frontend.sh

# Testiranje lokalno
npm run dev
```

---

## 🎯 Krajnji cilj

**Aplikacija pristupačna na:**
- Frontend: `https://[cloudfront-domain]` (sa CloudFront) ili `http://[s3-bucket].s3-website.eu-central-1.amazonaws.com`
- Backend API: `http://18.184.247.135/api/`
- Admin panel: `http://18.184.247.135/admin/`

**Sve funkcionalnosti rade:**
- ✅ User authentication (login/register)
- ✅ CRUD operacije za klijente
- ✅ CRUD operacije za fakture
- ✅ Time tracking
- ✅ PDF export faktura (upload na S3)

---

## 📚 Resursi

- [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Gunicorn Docs](https://docs.gunicorn.org/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [AWS CLI Docs](https://docs.aws.amazon.com/cli/)

---

**Poslednji update:** 2025-10-15
**Status:** Frontend S3 deployment - čeka AWS credentials fix
