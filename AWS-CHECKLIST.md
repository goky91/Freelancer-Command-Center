# ✅ AWS Deployment Checklist

Koristi ovaj checklist dok deployuješ aplikaciju. Obeležavaj svaki korak!

---

## 📋 Pre Deployments

### AWS Account Setup
- [ ] AWS nalog kreiran
- [ ] Email verifikovan
- [ ] Kreditna kartica dodata (samo verifikacija, neće naplatiti)
- [ ] Free Tier plan odabran
- [ ] Billing alerts uključeni ($1 threshold)
- [ ] Region odabran: **EU (Frankfurt) - eu-central-1**

### Lokalna Priprema
- [ ] Git repository postavljen (GitHub/GitLab)
- [ ] `.gitignore` podešen (ne commit-uj `.env`, `*.pem`)
- [ ] AWS CLI instaliran lokalno
- [ ] AWS CLI konfigurisan (`aws configure`)

---

## 🗄️ Database - RDS PostgreSQL

### Kreiranje
- [ ] RDS konzola otvorena
- [ ] "Create database" kliknuto
- [ ] **Template:** Free tier odabran
- [ ] **Engine:** PostgreSQL 15.x
- [ ] **Instance class:** db.t3.micro
- [ ] **Storage:** 20 GB (max free tier)
- [ ] **DB name:** freelance_db
- [ ] **Master username:** postgres
- [ ] **Master password:** kreiran i sačuvan negde sigurno!
- [ ] **Public access:** Yes (privremeno)
- [ ] **Automated backups:** Disabled (za free tier)
- [ ] Database kreirana (status = Available)

### Post-Kreiranje
- [ ] **Endpoint** kopiran (npr: `freelance-db.xxx.rds.amazonaws.com`)
- [ ] **Port** notiran (default: 5432)
- [ ] Security Group ID kopiran
- [ ] Security Group Inbound rules:
  - [ ] PostgreSQL (5432) → Source: 0.0.0.0/0 (privremeno)

### Test Konekcije (opciono)
- [ ] PostgreSQL client instaliran lokalno (`psql`)
- [ ] Test konekcija:
  ```bash
  psql -h freelance-db.xxx.rds.amazonaws.com -U postgres -d freelance_db
  ```
- [ ] Uspešna konekcija?

---

## 📂 Storage - S3 Buckets

### Frontend Bucket
- [ ] S3 konzola otvorena
- [ ] "Create bucket" kliknuto
- [ ] **Name:** `freelance-frontend-[tvoje-ime]` (globally unique!)
- [ ] **Region:** eu-central-1
- [ ] **Block public access:** ❌ UNCHECKED
- [ ] Checkbox "I acknowledge..." potvrđen
- [ ] Bucket kreiran

#### Frontend Bucket Konfiguracija
- [ ] **Properties** → Static website hosting
  - [ ] Static website hosting: **Enabled**
  - [ ] Index document: `index.html`
  - [ ] Error document: `index.html`
  - [ ] **Website endpoint** kopiran
- [ ] **Permissions** → Bucket Policy
  - [ ] Policy paste-ovan (vidi AWS-QUICK-START.md)
  - [ ] Bucket name zamenjen u policy-ju
  - [ ] Save changes

### Media Bucket
- [ ] S3 konzola otvorena
- [ ] "Create bucket" kliknuto
- [ ] **Name:** `freelance-media-[tvoje-ime]`
- [ ] **Region:** eu-central-1
- [ ] **Block public access:** ✅ CHECKED (privatno!)
- [ ] Bucket kreiran

---

## 🔐 IAM - Permissions

### IAM User za Deployment
- [ ] IAM → Users → Create user
- [ ] **Username:** deployer
- [ ] **Permissions:** AmazonS3FullAccess
- [ ] User kreiran
- [ ] Security credentials → Create access key
  - [ ] Use case: CLI
  - [ ] **Access Key ID** kopiran
  - [ ] **Secret Access Key** kopiran i sačuvan!
- [ ] Lokalno: `aws configure` pokrenut sa ovim credentials-ima

### IAM Role za EC2
- [ ] IAM → Roles → Create role
- [ ] **Trusted entity:** AWS service
- [ ] **Use case:** EC2
- [ ] **Permissions policies:**
  - [ ] AmazonS3FullAccess
  - [ ] CloudWatchLogsFullAccess
- [ ] **Role name:** FreelanceEC2Role
- [ ] Role kreiran

---

## 🖥️ Server - EC2 Instance

### Kreiranje Instance
- [ ] EC2 konzola otvorena
- [ ] "Launch instance" kliknuto
- [ ] **Name:** FreelanceBackendServer
- [ ] **AMI:** Ubuntu Server 22.04 LTS
- [ ] **Instance type:** t2.micro
- [ ] **Key pair:**
  - [ ] "Create new key pair" kliknuto
  - [ ] Name: `freelance-server-key`
  - [ ] Type: RSA
  - [ ] Format: .pem (Linux/Mac) ili .ppk (Windows)
  - [ ] Key pair preuzet i sačuvan
  - [ ] Permissions podešeni (`chmod 400 key.pem`)

### Network Settings
- [ ] **Auto-assign public IP:** Enabled
- [ ] **Security group:** Create new
  - [ ] Name: `freelance-backend-sg`
  - [ ] Rules:
    - [ ] SSH (22) → My IP
    - [ ] HTTP (80) → Anywhere (0.0.0.0/0)
    - [ ] HTTPS (443) → Anywhere (0.0.0.0/0)
    - [ ] Custom TCP (8000) → Anywhere (privremeno)

### Advanced Settings
- [ ] **IAM instance profile:** FreelanceEC2Role odabran

### Launch
- [ ] "Launch instance" kliknuto
- [ ] Instance status: **Running**
- [ ] **Public IPv4 address** kopiran

---

## 🚀 Backend Deployment

### SSH Pristup
- [ ] Terminal otvoren
- [ ] SSH komanda:
  ```bash
  ssh -i ~/.ssh/freelance-server-key.pem ubuntu@[EC2-IP]
  ```
- [ ] Uspešno konektovan na server?
- [ ] Welcome poruka prikazana?

### Kloniranje Repository-ja
- [ ] Git instaliran na serveru (apt install git)
- [ ] Repository kloniran:
  ```bash
  git clone https://github.com/[username]/freelance-command-center.git
  ```
- [ ] Navigacija u backend folder:
  ```bash
  cd freelance-command-center/backend
  ```

### Pokretanje Setup Skripte
- [ ] Permissions: `chmod +x setup_ec2.sh`
- [ ] Skripta pokrenuta: `./setup_ec2.sh`
- [ ] Svi paketi instalirani?
- [ ] Virtual environment kreiran?
- [ ] Python dependencies instalirane?
- [ ] Gunicorn systemd service kreiran?
- [ ] Nginx konfigurisan?

### Environment Variables (.env)
- [ ] `.env` fajl editovan: `nano .env`
- [ ] **SECRET_KEY:** generisan i unet
- [ ] **DEBUG:** False
- [ ] **ALLOWED_HOSTS:** EC2 public IP dodat
- [ ] **DB_NAME:** freelance_db
- [ ] **DB_USER:** postgres
- [ ] **DB_PASSWORD:** RDS password unet
- [ ] **DB_HOST:** RDS endpoint unet
- [ ] **DB_PORT:** 5432
- [ ] **AWS_ACCESS_KEY_ID:** unet
- [ ] **AWS_SECRET_ACCESS_KEY:** unet
- [ ] **AWS_STORAGE_BUCKET_NAME:** media bucket name
- [ ] **AWS_S3_REGION_NAME:** eu-central-1
- [ ] **CORS_ALLOWED_ORIGINS:** frontend S3 URL dodat
- [ ] Fajl sačuvan (Ctrl+O, Enter, Ctrl+X)

### Django Setup
- [ ] Virtual env aktiviran: `source venv/bin/activate`
- [ ] Settings module: `export DJANGO_SETTINGS_MODULE=config.settings_production`
- [ ] Migracije pokrenute: `python manage.py migrate`
- [ ] Superuser kreiran: `python manage.py createsuperuser`
- [ ] Static fajlovi sakupljeni: `python manage.py collectstatic`

### Servisi
- [ ] Gunicorn status proveren: `sudo systemctl status gunicorn`
- [ ] Gunicorn radi? (active/running)
- [ ] Nginx status proveren: `sudo systemctl status nginx`
- [ ] Nginx radi? (active/running)

### Test Backenда
- [ ] Lokalno sa servera: `curl http://localhost`
- [ ] Odgovor 200 OK?
- [ ] Sa spoljašnjeg računara: `curl http://[EC2-IP]`
- [ ] Radi?
- [ ] Django admin: `http://[EC2-IP]/admin`
- [ ] Login radi?

---

## 🎨 Frontend Deployment

### Lokalna Priprema
- [ ] Navigacija u frontend folder lokalno
- [ ] `src/api.ts` editovan:
  ```typescript
  const API_BASE_URL = 'http://[EC2-IP]:8000/api';
  ```
- [ ] Fajl sačuvan

### Build
- [ ] Dependencies instalirane: `npm install`
- [ ] Build pokrenut: `npm run build`
- [ ] `build/` folder kreiran?
- [ ] Fajlovi u `build/` postoje?

### Deployment na S3
- [ ] `deploy-frontend.sh` editovan:
  - [ ] `S3_BUCKET` promenjen na tvoj bucket name
- [ ] Permissions: `chmod +x deploy-frontend.sh`
- [ ] Skripta pokrenuta: `./deploy-frontend.sh`
- [ ] Upload uspešan?

### Test Frontenda
- [ ] Browser otvoren
- [ ] S3 website URL otvoren: `http://freelance-frontend-[ime].s3-website.eu-central-1.amazonaws.com`
- [ ] Sajt se učitava?
- [ ] Login/Register radi?
- [ ] Može da kreira klijenta?
- [ ] API pozivi rade?

---

## 🌐 CloudFront (Opciono)

### Kreiranje Distribucije
- [ ] CloudFront konzola otvorena
- [ ] "Create distribution" kliknuto
- [ ] **Origin domain:** S3 website endpoint (ne obični S3!)
- [ ] **Origin protocol:** HTTP only
- [ ] **Viewer protocol:** Redirect HTTP to HTTPS
- [ ] **Price class:** North America and Europe
- [ ] **Default root object:** index.html
- [ ] Distribucija kreirana

### Error Pages (za React Router)
- [ ] Error Pages → Create custom error response
  - [ ] HTTP code: 403
  - [ ] Customize: Yes
  - [ ] Response path: `/index.html`
  - [ ] HTTP code: 200
- [ ] Ponovi za error code 404

### Post-Kreiranje
- [ ] **Distribution domain name** kopiran (npr: d123.cloudfront.net)
- [ ] Status = **Deployed** (traje 10-15min)
- [ ] Django CORS_ALLOWED_ORIGINS update-ovan sa CloudFront domenom
- [ ] Backend restart-ovan

### Test CloudFront
- [ ] CloudFront URL otvoren u browseru
- [ ] HTTPS radi?
- [ ] Aplikacija se učitava?

---

## 🔒 Sigurnost (Post-Deployment)

### RDS Security
- [ ] RDS Security Group → Edit inbound rules
- [ ] PostgreSQL rule promenjen:
  - [ ] Source: EC2 security group (umesto 0.0.0.0/0)
- [ ] Public access promenjen na **No** (opciono)

### EC2 Security
- [ ] Port 8000 uklonjen iz security group (koristimo samo 80/443)
- [ ] SSH rule proverен: samo tvoja IP?

### Django Settings
- [ ] DEBUG = False (proveri .env)
- [ ] SECRET_KEY različit od development-a
- [ ] ALLOWED_HOSTS podešen pravilno

### SSL (Opciono - ako imaš domen)
- [ ] Domen kupljen
- [ ] DNS podešen (Route 53 ili eksterno)
- [ ] Certbot instaliran: `sudo apt install certbot python3-certbot-nginx`
- [ ] SSL certifikat kreiran: `sudo certbot --nginx -d tvoj-domen.com`
- [ ] Auto-renewal testiran: `sudo certbot renew --dry-run`

---

## 📊 Monitoring & Maintenance

### CloudWatch
- [ ] CloudWatch konzola otvorena
- [ ] Billing alarm kreiran ($1 threshold)
- [ ] EC2 monitoring uključen (basic je free)

### Logs
- [ ] Gunicorn logs: `sudo journalctl -u gunicorn -f`
- [ ] Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] Django logs: `tail -f ~/freelance-command-center/backend/logs/django.log`

### Backups
- [ ] RDS automated backups uključeni (7 dana retention)
- [ ] Manual snapshot kreiran
- [ ] S3 versioning uključen (opciono)

### Dokumentacija
- [ ] Credentials sačuvani negde sigurno (password manager)
- [ ] EC2 IP adresa notirana
- [ ] RDS endpoint notiran
- [ ] S3 bucket names notirani
- [ ] CloudFront domain notiran

---

## ✅ Final Test Plan

### Funkcionalnost
- [ ] Registracija novog korisnika radi
- [ ] Login radi
- [ ] Dashboard se učitava
- [ ] Kreiranje klijenta radi
- [ ] Editovanje klijenta radi
- [ ] Brisanje klijenta radi
- [ ] Kreiranje time entry radi
- [ ] Kreiranje fakture radi
- [ ] PDF download radi
- [ ] Mark as sent radi
- [ ] Mark as paid radi

### Performance
- [ ] Stranica se učitava < 3 sekunde
- [ ] API responses < 1 sekunda
- [ ] PDF generisanje < 5 sekundi

### Security
- [ ] Login je required za sve rute
- [ ] HTTPS radi (ako CloudFront postavljen)
- [ ] SQL injection zaštita (Django ORM automatski)
- [ ] CSRF zaštita aktivna

---

## 🎉 Deployment Complete!

Čestitamo! Tvoja aplikacija je live na AWS-u!

### Šta dalje?

#### Immediate Next Steps
- [ ] Testiraj sa pravim podacima
- [ ] Pozovi prijatelje da testiraju
- [ ] Monitoring free tier usage (AWS Console → Billing)

#### Future Improvements
- [ ] Custom domain + SSL
- [ ] Email funkcionalnost (Amazon SES)
- [ ] Database backups automatizovani
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Redis caching (ElastiCache)
- [ ] Skaliranje na više EC2 instance-i

#### Učenje
- [ ] Pročitaj AWS Well-Architected Framework
- [ ] Eksperimentisaj sa drugim AWS servisima
- [ ] Implementiraj monitoring (CloudWatch dashboards)

---

**🎓 Naučio si:**
- ✅ AWS osnovne koncepte (EC2, RDS, S3, CloudFront)
- ✅ Django production deployment
- ✅ React production build
- ✅ Database migracije u cloudu
- ✅ Nginx + Gunicorn setup
- ✅ AWS security best practices

**Svaka čast! 🚀**
