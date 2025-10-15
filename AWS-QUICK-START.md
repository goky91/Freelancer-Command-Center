# 🚀 AWS Quick Start Guide - Brzi vodič za pokretanje

Ovaj fajl je BRZI pregled svih koraka. Za detaljna objašnjenja, pogledaj [AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md).

---

## ✅ Pre nego što počneš - Checklist

- [ ] AWS nalog kreiran
- [ ] Kreditna kartica verifikovana
- [ ] Billing alerts uključeni
- [ ] Region odabran: **EU (Frankfurt) - eu-central-1**
- [ ] Git repository setup (da bi mogao da clone-uješ na EC2)

---

## 📋 Korak po Korak - AWS Konzola

### 1️⃣ RDS - PostgreSQL Baza (10 min)

```
AWS Console → RDS → Create database

✅ Template: Free tier
✅ Engine: PostgreSQL 15.x
✅ DB instance: db.t3.micro
✅ Storage: 20 GB (max za Free Tier)
✅ Public access: Yes (za početak)
❌ Automated backups: Disable (ušteda)
❌ Encryption: Disable

Credentials:
  Master username: postgres
  Password: [SAČUVAJ LOZINKU!]
  DB name: freelance_db
```

**Nakon kreiranja:**
- Kopiraj **Endpoint** (npr: `freelance-db.xxx.rds.amazonaws.com`)
- Idi na Security Group → Inbound rules
- Dodaj pravilo: PostgreSQL (5432), Source: Anywhere (0.0.0.0/0)
  ⚠️ (Kasnije ćemo ovo ograničiti samo na EC2!)

---

### 2️⃣ S3 Buckets - File Storage (5 min)

#### Frontend Bucket

```
AWS Console → S3 → Create bucket

Name: freelance-frontend-[tvoje-ime]
Region: eu-central-1
❌ Block all public access: UNCHECKED
✅ I acknowledge... (potvrdi checkbox)
```

**Konfigurisanje:**

1. **Properties** → Static website hosting → Enable
   - Index: `index.html`
   - Error: `index.html`

2. **Permissions** → Bucket Policy → Edit:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::freelance-frontend-[tvoje-ime]/*"
    }
  ]
}
```

#### Media Bucket

```
Name: freelance-media-[tvoje-ime]
Region: eu-central-1
✅ Block all public access: CHECKED (privatni fajlovi!)
```

---

### 3️⃣ IAM Role - Dozvole za EC2 (3 min)

```
AWS Console → IAM → Roles → Create role

Trusted entity: AWS service
Use case: EC2
Permissions:
  ✅ AmazonS3FullAccess
  ✅ CloudWatchLogsFullAccess

Role name: FreelanceEC2Role
```

---

### 4️⃣ EC2 Instance - Server (10 min)

```
AWS Console → EC2 → Launch instance

Name: FreelanceBackendServer
AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
Instance type: t2.micro
```

**Key pair:**
- Create new key pair
- Name: `freelance-server-key`
- Type: RSA
- Format: .pem (Linux/Mac) ili .ppk (Windows)
- ⚠️ **PREUZMI I SAČUVAJ!**

**Network settings:**
- Auto-assign public IP: ✅ Enable
- Security group: Create new
  - Name: `freelance-backend-sg`
  - Rules:
    | Type  | Port | Source    |
    |-------|------|-----------|
    | SSH   | 22   | My IP     |
    | HTTP  | 80   | Anywhere  |
    | HTTPS | 443  | Anywhere  |
    | Custom| 8000 | Anywhere  |

**Storage:** 8 GB (default)

**Advanced details:**
- IAM instance profile: `FreelanceEC2Role`

**Launch!**

---

### 5️⃣ AWS CLI Setup - Lokalno (5 min)

```bash
# Instaliraj AWS CLI
# Linux:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Mac:
brew install awscli

# Proveri instalaciju
aws --version
```

**Konfigurisanje:**

1. Idi na AWS Console → IAM → Users → Create user
   - User name: `deployer`
   - Permissions: `AmazonS3FullAccess`

2. Security credentials → Create access key
   - Use case: CLI
   - Kopiraj **Access Key ID** i **Secret Access Key**

3. Lokalno:
```bash
aws configure

AWS Access Key ID: [tvoj key]
AWS Secret Access Key: [tvoj secret]
Default region name: eu-central-1
Default output format: json
```

---

## 🔧 Deployment - Praktični koraci

### Backend Deployment na EC2

#### 1. Konektuj se na EC2

```bash
# Podesi permissions na key-u
chmod 400 ~/.ssh/aws-keys/freelance-server-key.pem

# SSH na server (zameni IP sa svojim)
ssh -i ~/.ssh/aws-keys/freelance-server-key.pem ubuntu@3.121.45.78
```

#### 2. Pokreni setup skriptu

```bash
# Na EC2 serveru:
cd ~
git clone https://github.com/TVOJ-USERNAME/freelance-command-center.git
cd freelance-command-center/backend
chmod +x setup_ec2.sh
./setup_ec2.sh
```

**Skripta će instalirati:**
- Python, Nginx, PostgreSQL client
- Gunicorn systemd service
- Nginx reverse proxy
- Firewall (UFW)

#### 3. Edituj .env fajl

```bash
nano .env

# Unesi prave vrednosti:
SECRET_KEY=....                           # generisan automatski
DEBUG=False
ALLOWED_HOSTS=3.121.45.78,tvoj-domen.com  # tvoj EC2 public IP

DB_NAME=freelance_db
DB_USER=postgres
DB_PASSWORD=tvoja-rds-lozinka
DB_HOST=freelance-db.xxx.rds.amazonaws.com
DB_PORT=5432

AWS_ACCESS_KEY_ID=tvoj-access-key
AWS_SECRET_ACCESS_KEY=tvoj-secret-key
AWS_STORAGE_BUCKET_NAME=freelance-media-tvoje-ime
AWS_S3_REGION_NAME=eu-central-1

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://freelance-frontend-tvoje.s3-website.eu-central-1.amazonaws.com
```

Sačuvaj: `Ctrl+O`, `Enter`, `Ctrl+X`

#### 4. Primeni migracije i kreiraj superuser-a

```bash
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings_production

python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

#### 5. Proveri da li radi

```bash
# Proveri servise
sudo systemctl status gunicorn
sudo systemctl status nginx

# Testovi
curl http://localhost
curl http://3.121.45.78  # tvoj public IP
```

---

### Frontend Deployment na S3

#### 1. Update API endpoint

Edituj `frontend/src/api.ts`:

```typescript
const API_BASE_URL = 'http://3.121.45.78:8000/api';  // tvoj EC2 IP
```

#### 2. Build i deploy

```bash
# Lokalno, u frontend folderu:
cd frontend

# Edituj deploy skripty
nano deploy-frontend.sh

# Promeni:
S3_BUCKET="freelance-frontend-tvoje-ime"

# Pokreni deployment
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

#### 3. Testiraj

Otvori u browser-u:
```
http://freelance-frontend-tvoje-ime.s3-website.eu-central-1.amazonaws.com
```

---

### 6️⃣ CloudFront - CDN (opciono, 10 min)

```
AWS Console → CloudFront → Create distribution

Origin domain: freelance-frontend-tvoje-ime.s3-website.eu-central-1.amazonaws.com
  ⚠️ Izaberi S3 WEBSITE endpoint, ne obični S3!

Origin protocol: HTTP only (S3 website ne podržava HTTPS)
Viewer protocol: Redirect HTTP to HTTPS

Default root object: index.html

Price class: Use only North America and Europe (najjeftinija)
```

**Error pages (važno za React Router!):**

Idi na Error Pages → Create custom error response:
- HTTP error code: 403
- Customize error response: Yes
- Response page path: `/index.html`
- HTTP response code: 200

Ponovi za error code 404.

**Nakon kreiranja:**
- Kopiraj **Distribution domain name** (npr: `d123abc.cloudfront.net`)
- Update frontend API calls da koriste ovaj domain
- Update Django CORS_ALLOWED_ORIGINS sa CloudFront domenom

---

## 🎯 Čestitamo! Tvoja aplikacija je LIVE! 🎉

### Test plan

- [ ] Frontend se učitava
- [ ] Login/Register radi
- [ ] Mogu da kreiram klijenta
- [ ] Mogu da kreiram time entry
- [ ] Mogu da kreiram fakturu
- [ ] PDF download radi
- [ ] Podaci se čuvaju u bazi

---

## 📊 Monitoring & Maintenance

### Provera Free Tier Usage

```
AWS Console → Billing → Free Tier
```

Prati:
- EC2 hours (max 750h)
- RDS hours (max 750h)
- S3 storage (max 5GB)
- Data transfer (max 100GB)

### Logovi

```bash
# Backend logs
ssh -i key.pem ubuntu@EC2-IP
tail -f ~/freelance-command-center/backend/logs/django.log
sudo journalctl -u gunicorn -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update aplikacije

```bash
# SSH na server
ssh -i key.pem ubuntu@EC2-IP

# Pokreni deployment skriptu
cd ~/freelance-command-center/backend
./deploy.sh
```

---

## 🔐 Sigurnosna poboljšanja (nakon što sve radi)

### 1. Ograniči RDS pristup

```
RDS → Security Group → Edit inbound rules
PostgreSQL (5432): Source = EC2 security group (ne Anywhere!)
```

### 2. Stavi HTTPS (besplatni SSL)

```bash
# Na EC2 serveru
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tvoj-domen.com
```

### 3. Environment variables iz AWS Systems Manager

Umesto .env fajla, koristi AWS SSM Parameter Store (sigurnije).

---

## 🆘 Troubleshooting

### Backend ne radi

```bash
# Proveri status
sudo systemctl status gunicorn
sudo systemctl status nginx

# Restart servisa
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# Proveri logove
sudo journalctl -u gunicorn --no-pager -n 100
```

### RDS konekcija ne radi

```bash
# Test konekcije sa EC2
psql -h freelance-db.xxx.rds.amazonaws.com -U postgres -d freelance_db

# Proveri Security Group
# - RDS security group mora dozvoliti pristup sa EC2 security grupe
```

### Frontend ne vidi backend

- Proveri EC2 Security Group (port 80 otvoren?)
- Proveri CORS u Django settings
- Proveri API_BASE_URL u frontend kodu
- Otvori browser DevTools → Network tab

---

## 📚 Dodatni resursi

- [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 💡 Sledeći koraci (opciono)

1. **Custom domain**: Kupi domain i povežite sa CloudFront
2. **Database backups**: Uključi automated backups u RDS
3. **Monitoring**: Postavi CloudWatch alarme
4. **CI/CD**: GitHub Actions za automatski deployment
5. **Email**: Amazon SES za slanje faktura email-om
6. **Redis**: ElastiCache za caching

---

Srećno! 🚀
