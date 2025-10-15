# 🎓 AWS Deployment Guide - Freelance Command Center
## Kompletni vodič za učenje AWS-a kroz praksu

---

## 📚 Sadržaj
1. [Uvod u AWS i Cloud Computing](#uvod)
2. [AWS Free Tier - Šta je besplatno](#free-tier)
3. [Arhitektura našeg sistema](#arhitektura)
4. [Priprema projekta](#priprema)
5. [AWS Konzola - Kreiranje resursa](#aws-setup)
6. [Deployment proces](#deployment)
7. [Održavanje i monitoring](#maintenance)

---

## 🌐 1. Uvod u AWS i Cloud Computing {#uvod}

### Šta je Cloud Computing?

**Cloud Computing** je korišćenje tuđih servera (računara) preko interneta umesto da držiš svoje fizičke servere.

**Analogija:** Umesto da kupuješ i održavaš sopstveni generator struje, plaćaš račun za struju elektrodistribuciji. Tako i sa serverima - umesto da kupuješ hardver, "iznajmljuješ" ga od AWS-a.

### Šta je AWS (Amazon Web Services)?

AWS je Amazon-ova cloud platforma koja nudi preko 200 različitih servisa. Mi ćemo koristiti samo 5-6 najbitnijih.

**Prednosti:**
- ✅ Ne moraš kupovati servere
- ✅ Plaćaš samo ono što koristiš
- ✅ Skalabilnost (lako povećaš/smanjiš resurse)
- ✅ Globalna dostupnost (serveri širom sveta)
- ✅ Automatski backup i sigurnost

---

## 💰 2. AWS Free Tier - Šta je besplatno {#free-tier}

AWS nudi **Free Tier** - besplatne resurse za učenje i male projekte.

### Dva tipa Free Tier-a:

#### A) **12 meseci besplatno** (od registracije)
```
EC2 (Server):           750 sati/mesec t2.micro instance
                        = možeš držati 1 server 24/7 ceo mesec!

RDS (Baza podataka):    750 sati/mesec db.t3.micro
                        20 GB storage

S3 (File storage):      5 GB storage
                        20,000 GET zahteva
                        2,000 PUT zahteva

CloudFront (CDN):       50 GB data transfer mesečno
```

#### B) **Uvek besplatno** (i nakon 12 meseci)
```
Lambda:                 1 milion zahteva mesečno
DynamoDB:               25 GB storage
CloudWatch:             10 custom metrika
```

**VAŽNO:** Naš projekat će koristiti samo resurse iz kategorije A) i biće 100% besplatan prvih 12 meseci!

---

## 🏗️ 3. Arhitektura našeg sistema {#arhitektura}

Hajde da razumemo kako će izgledati naša aplikacija na AWS-u:

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                         │
│  Šta je to? Mreža servera širom sveta koji keširaju        │
│  tvoje fajlove i brže ih služe korisnicima.                │
│                                                              │
│  Zašto? Ako korisnik iz Srbije pristupi sajtu, CloudFront  │
│  će mu poslati fajlove sa najbližeg servera (Frankfurt)    │
│  umesto iz Amerike - MNOGO brže!                            │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│                    S3 Bucket (Frontend)                     │
│  Šta je to? "Virtualni hard disk u oblaku"                 │
│  Čuva: HTML, CSS, JS fajlove tvog React frontend-a        │
│                                                              │
│  Analogija: Dropbox, ali optimizovan za hosting website-a  │
└─────────────────────────────────────────────────────────────┘

             │ API zahtevi (axios)
             ▼
┌────────────────────────────────────────────────────────────┐
│              EC2 Instance (Backend Server)                  │
│  Šta je to? Virtuelna mašina (računar) u oblaku           │
│  Pokreće: Django backend + Gunicorn                         │
│  Tip: t2.micro (1 vCPU, 1GB RAM) - FREE TIER              │
│                                                              │
│  Analogija: Kao da iznajmljuješ računar koji radi 24/7    │
│             i na kome pokrećeš svoj Django server           │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│           RDS - PostgreSQL (Baza podataka)                  │
│  Šta je to? Managed baza podataka                          │
│  Čuva: Klijenti, faktore, radne sate                       │
│  Tip: db.t3.micro - FREE TIER                              │
│                                                              │
│  Managed = AWS automatski:                                  │
│    - Pravi backup-e                                         │
│    - Update-uje PostgreSQL                                  │
│    - Čuva sigurnosne kopije                                 │
│                                                              │
│  Zašto ne SQLite? SQLite je fajl na disku, ako se server   │
│  restartuje ili padne, možeš izgubiti podatke. RDS je      │
│  profesionalno rešenje sa automatskim backup-ima.           │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│              S3 Bucket (Media Files)                        │
│  Šta je to? Drugi S3 bucket za upload-ovane fajlove       │
│  Čuva: PDF faktore, logo slike, upload-i korisnika        │
│                                                              │
│  Zašto odvojen od EC2? EC2 instance mogu biti restarted    │
│  ili zamenjene - sve na njima se briše. S3 je trajno       │
│  storage, fajlovi ostaju zauvek.                            │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                 Security Groups (Firewall)                  │
│  Šta je to? Pravila ko sme da pristupi tvojim resursima   │
│                                                              │
│  Primeri:                                                   │
│    - EC2: Dozvoli HTTP (80) i HTTPS (443) sa interneta    │
│    - RDS: Dozvoli pristup SAMO od EC2 instance             │
│    - SSH: Dozvoli pristup SAMO sa tvoje IP adrese          │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                        IAM Roles                            │
│  Šta je to? "Dozvole" - ko šta sme da radi                │
│                                                              │
│  Primer: EC2 instanci dajemo IAM rolu koja joj dozvoljava  │
│  da čita/piše u S3 bucket, ali ne i da briše RDS bazu.    │
│                                                              │
│  Analogija: Kao administrator prava na računaru             │
└─────────────────────────────────────────────────────────────┘
```

### Tok podataka - Primer:

**Korisnik otvara sajt:**
1. Browser → CloudFront → S3 → Učita React app
2. React app → EC2 Django API → RDS → Vrati podatke
3. Korisnik upload-uje PDF fakturu → Django → S3 bucket (media)

---

## 🛠️ 4. Priprema projekta {#priprema}

### 4.1. Šta smo već pripremili?

✅ **Dockerfile** - "recept" kako se pokreće naša aplikacija
✅ **.env.example** - primer kako izgledaju environment varijable
✅ **requirements-aws.txt** - Python biblioteke potrebne za AWS

### 4.2. Šta još treba da dodamo?

Potrebno je:
1. Prilagoditi Django settings.py za production
2. Dodati S3 storage konfiguraciju
3. Dodati Nginx konfiguraciju (web server)
4. Kreirati deployment skripte

**Ovo ćemo uraditi u sledećem koraku!**

---

## ☁️ 5. AWS Konzola - Kreiranje resursa {#aws-setup}

### Pre nego što počnemo:

**Šta ti treba:**
- AWS nalog (možeš napraviti na aws.amazon.com)
- Kreditna kartica (traže za verifikaciju, ali NE NAPLAĆUJU ako koristiš Free Tier)

---

### KORAK 1: Kreiranje AWS naloga

1. Idi na: https://aws.amazon.com/
2. Klikni **"Create an AWS Account"**
3. Unesi email i kreiraj password
4. Odaberi **"Personal account"**
5. Unesi podatke kreditne kartice (neće naplatiti, samo verifikacija)
6. Odaberi **"Basic Support - Free"** plan

**VAŽNO:** Uključi **Billing Alerts** da dobijaš notifikacije ako slučajno pređeš Free Tier!

---

### KORAK 2: VPC (Virtual Private Cloud)

**Šta je VPC?**
VPC je tvoja privatna virtuelna mreža u AWS-u. Kao da praviš svoju lokalnu mrežu kod kuće, ali u oblaku.

**Analogija:** VPC je kao tvoj stan - imaš svoju privatnu mrežu, biraš ko može da uđe, koje sobe (subnets) postoje, itd.

**AWS koristi default VPC, tako da za početak NE MORAŠ ništa da menjaš.**

---

### KORAK 3: RDS - PostgreSQL baza podataka

**Šta ćemo kreirati:** Managed PostgreSQL bazu veličine db.t3.micro (FREE TIER)

#### Koraci u AWS konzoli:

1. **Loguj se na AWS konzolu:** https://console.aws.amazon.com/
2. **Odaberi region:** Gore desno, odaberi **"EU (Frankfurt)" - eu-central-1**
   - Zašto Frankfurt? Najbliži server Srbiji = najbrža konekcija!

3. **Idi na RDS:**
   - U search bar-u kucaj "RDS"
   - Klikni na "RDS" (Relational Database Service)

4. **Klikni "Create database"**

5. **Database creation method:**
   - ✅ Standard create

6. **Engine options:**
   - Engine type: **PostgreSQL**
   - Engine version: **PostgreSQL 15.x** (najnovija dostupna)

   **Šta je PostgreSQL?** Otvorena, profesionalna relaciona baza podataka.
   Kao MySQL, ali moćnija. Django super radi sa njom.

7. **Templates:**
   - ⚠️ **VAŽNO:** Odaberi **"Free tier"**
   - Ovo automatski podešava veličinu na db.t3.micro

8. **Settings:**
   ```
   DB instance identifier: freelance-db
   Master username: postgres
   Master password: [UNESI JAKU LOZINKU - sačuvaj je!]
   Confirm password: [PONOVI LOZINKU]
   ```

   **Šta je Master username/password?**
   To su kredencijali za pristup bazi. Django će koristiti ove podatke.

9. **Instance configuration:**
   - DB instance class: **db.t3.micro** (trebalo bi već biti odabrano)
   - vCPUs: 2
   - RAM: 1 GB

10. **Storage:**
    ```
    Storage type: General Purpose SSD (gp3)
    Allocated storage: 20 GB (FREE TIER limit)
    ❌ ISKLJUČI "Enable storage autoscaling"
       (da slučajno ne pređeš free tier)
    ```

11. **Connectivity:**
    ```
    Compute resource: Don't connect to an EC2 compute resource (za sada)
    VPC: Default VPC
    Public access: YES ⚠️ (za sada, dok ne postavimo EC2)
    VPC security group: Create new
    New VPC security group name: freelance-db-sg
    Availability Zone: No preference
    ```

    **Zašto Public access YES?**
    Da bi mogao da testiram bazu sa svog računara pre nego što digneš EC2.
    Nakon što postaviš EC2, promenićemo ovo na NO iz sigurnosnih razloga.

12. **Database authentication:**
    - ✅ Password authentication

13. **Additional configuration (klikni da proširis):**
    ```
    Initial database name: freelance_db
    ❌ ISKLJUČI "Enable automated backups" (za sada, da uštediš storage)
    ❌ ISKLJUČI "Enable encryption"
    ✅ UKLJUČI "Enable deletion protection" (da slučajno ne obrišeš bazu)
    ```

14. **Klikni "Create database"**

⏳ **Kreiranje traje 5-10 minuta.** Čekaćemo da status bude **"Available"**.

---

#### Šta se dešava u pozadini?

AWS trenutno:
1. Rezerviše db.t3.micro instancu za tebe
2. Instalira PostgreSQL 15
3. Kreira tvoju bazu "freelance_db"
4. Podešava networking (VPC, security groups)
5. Startuje PostgreSQL service

**Endpoint:** Nakon kreiranja, dobijaš endpoint (URL) baze, npr:
```
freelance-db.c123xyz.eu-central-1.rds.amazonaws.com:5432
```

Ovo ćeš koristiti u Django settings umesto "localhost".

---

### KORAK 4: S3 Buckets (File Storage)

**Šta je S3?**
Simple Storage Service - beskonačni cloud storage za fajlove.

**Kreiraćemo 2 S3 bucketa:**
1. **Frontend bucket** - za React build fajlove (HTML, CSS, JS)
2. **Media bucket** - za PDF faktore i upload-ovane fajlove

#### 4A. Frontend Bucket

1. **Idi na S3:**
   - Search bar: "S3"
   - Klikni "S3"

2. **Klikni "Create bucket"**

3. **Bucket settings:**
   ```
   Bucket name: freelance-frontend-[tvoje-ime]
                (mora biti globalno unique!)

   Region: EU (Frankfurt) eu-central-1
   ```

   **Zašto unique ime?** S3 bucket imena su globalna - niko drugi na svetu
   ne sme imati isto ime. Zato dodaj nešto lično (npr. tvoje ime ili random broj).

4. **Object Ownership:**
   - ✅ ACLs disabled (recommended)

5. **Block Public Access settings:**
   - ⚠️ **ISKLJUČI** "Block all public access"
   - ✅ Potvrdi checkbox da razumeš da će biti javno

   **Zašto public?** Frontend mora biti dostupan svima preko interneta!

6. **Bucket Versioning:**
   - Disabled (ne treba nam za sada)

7. **Default encryption:**
   - Disable (za Free Tier)

8. **Klikni "Create bucket"**

✅ **Frontend bucket kreiran!**

---

#### 4B. Media Bucket

Ponovi iste korake, ali sa ovim razlikama:

```
Bucket name: freelance-media-[tvoje-ime]

Block Public Access:
  - ✅ UKLJUČI "Block all public access"

  Zašto? Media fajlovi (fakture) su privatni, ne smeju biti javni!
  Samo tvoj Django backend može da im pristupi.
```

✅ **Media bucket kreiran!**

---

#### Konfigurisanje Frontend Bucket za Static Website Hosting

1. **Otvori frontend bucket** (klikni na njegovo ime)

2. **Properties tab**
   - Scroll dole do **"Static website hosting"**
   - Klikni **"Edit"**

3. **Static website hosting:**
   ```
   ✅ Enable

   Hosting type: Host a static website
   Index document: index.html
   Error document: index.html (za React Router)
   ```

   **Zašto index.html za oba?**
   React je Single Page App - sve rute idu kroz index.html!

4. **Sačuvaj**

5. **Kopiraj Bucket website endpoint URL** (npr: http://freelance-frontend-tvoje.s3-website.eu-central-1.amazonaws.com)
   - Ovo ćemo kasnije povezati sa CloudFront

---

#### Konfigurisanje Bucket Policy (dozvole)

Moramo reći S3-u: "Dozvoli SVIMA da čitaju fajlove iz frontend bucketa"

1. **Permissions tab** frontend bucketa

2. **Bucket Policy** - klikni "Edit"

3. **Unesi ovaj JSON:**
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

   **Objašnjenje:**
   - `"Principal": "*"` = SVI ljudi na internetu
   - `"Action": "s3:GetObject"` = Mogu SAMO da ČITAJU fajlove
   - `"Resource": ".../*"` = Sve fajlove u bucket-u

   ⚠️ **Zameni** `freelance-frontend-[tvoje-ime]` sa stvarnim imenom tvog bucketa!

4. **Save changes**

---

### KORAK 5: IAM Role za EC2

**Šta je IAM?**
Identity and Access Management - sistem dozvola. Određuješ KO šta SME da radi.

**Zašto nam treba IAM Role?**
EC2 instanca (server) treba dozvolu da piše/čita fajlove iz S3 bucketa.

**Analogija:** Kao kada daješ korisnički nalog nekome na računaru - možeš dati "samo čitanje" ili "puno administratorskih prava".

---

#### Kreiranje IAM Role

1. **Idi na IAM:**
   - Search: "IAM"
   - Klikni "IAM"

2. **Levi meni: "Roles"**

3. **Klikni "Create role"**

4. **Trusted entity type:**
   - ✅ AWS service
   - Use case: **EC2**
   - Klikni "Next"

   **Šta znači?** Ova rola će biti data EC2 instance.

5. **Add permissions (traži ove policies):**

   U search-u kucaj i selektuj:
   - ✅ **AmazonS3FullAccess**
   - ✅ **CloudWatchLogsFullAccess** (za logove)

   **Šta je Policy?**
   Policy je lista dozvola. AmazonS3FullAccess = puna kontrola nad S3.

   Klikni "Next"

6. **Role details:**
   ```
   Role name: FreelanceEC2Role
   Description: Allows EC2 to access S3 and CloudWatch
   ```

7. **Klikni "Create role"**

✅ **IAM Role kreiran!** Ovu rolu ćemo dodeliti EC2 instanci kad je kreiramo.

---

### KORAK 6: EC2 Instance (Server)

**Šta je EC2?**
Elastic Compute Cloud - virtuelna mašina (računar) u oblaku.

**Mi kreiramo:** t2.micro Linux server (FREE TIER: 750h/mesec)

---

#### Kreiranje EC2 Instance

1. **Idi na EC2:**
   - Search: "EC2"
   - Klikni "EC2"

2. **Klikni "Launch instance"** (velika narandžasta dugmad)

3. **Name and tags:**
   ```
   Name: FreelanceBackendServer
   ```

4. **Application and OS Images (Amazon Machine Image - AMI):**

   **Šta je AMI?**
   To je "template" operativnog sistema. Kao kada instaliraš Windows ili Ubuntu.

   ```
   Quick Start: Ubuntu
   AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
   Architecture: 64-bit (x86)
   ```

   **Zašto Ubuntu?** Popularan, stabilan, dobra podrška za Python/Django.

5. **Instance type:**
   ```
   ✅ t2.micro (Free tier eligible)

   1 vCPU, 1 GB RAM
   ```

   **Je li dovoljno?** Za mali projekat sa par korisnika - DA!
   Ako ti treba više, kasnije možeš lako upgrade-ovati.

6. **Key pair (login):**

   **Šta je Key pair?**
   SSH ključ za pristup serveru. Kao lozinka, ali sigurnija.

   - Klikni **"Create new key pair"**
   ```
   Key pair name: freelance-server-key
   Key pair type: RSA
   Private key file format: .pem (za Linux/Mac) ili .ppk (za Windows/PuTTY)
   ```
   - Klikni "Create key pair"

   ⚠️ **PREUZMI .pem fajl i SAČUVAJ GA!** Nećeš moći ponovo da ga preuzmeš!

   **Gde sačuvati?**
   ```bash
   # Linux/Mac:
   mkdir ~/.ssh/aws-keys
   mv ~/Downloads/freelance-server-key.pem ~/.ssh/aws-keys/
   chmod 400 ~/.ssh/aws-keys/freelance-server-key.pem
   ```

   `chmod 400` = samo ti možeš da čitaš, niko drugi (sigurnosni zahtev za SSH)

7. **Network settings:**

   Klikni **"Edit"**

   ```
   VPC: Default VPC
   Subnet: No preference
   Auto-assign public IP: Enable ✅
   ```

   **Firewall (Security groups):**

   - ✅ Create security group
   ```
   Security group name: freelance-backend-sg
   Description: Security group for Django backend
   ```

   **Inbound Security Group Rules:**

   Dodaj sledeća pravila (klikni "Add security group rule"):

   | Type  | Protocol | Port | Source      | Description          |
   |-------|----------|------|-------------|----------------------|
   | SSH   | TCP      | 22   | My IP       | SSH access           |
   | HTTP  | TCP      | 80   | Anywhere    | HTTP access          |
   | HTTPS | TCP      | 443  | Anywhere    | HTTPS access         |
   | Custom| TCP      | 8000 | Anywhere    | Django dev server    |

   **Objašnjenje:**
   - **SSH (22):** Za pristup serveru terminalom - SAMO sa tvog IP-a!
   - **HTTP (80) / HTTPS (443):** Za frontend da pristupi API-ju
   - **8000:** Django port (privremeno, dok ne postavimo Nginx)

8. **Configure storage:**
   ```
   Size: 8 GB (default)
   Volume type: gp3 (General Purpose SSD)
   ❌ ISKLJUČI "Delete on termination" (radi sigurnosti)
   ```

   **FREE TIER:** 30 GB EBS storage - 8 GB je više nego dovoljno!

9. **Advanced details (proširiti accordion):**

   Scroll dole do **IAM instance profile**:
   ```
   IAM instance profile: FreelanceEC2Role
   ```

   **Šta smo uradili?** Dali smo EC2-u dozvolu da koristi S3!

10. **Launch instance!**

⏳ **Inicijalizacija traje 2-3 minuta.** Status će biti "Running" kad je spremno.

---

#### Connecting to EC2 (SSH pristup)

Kad je EC2 status "Running":

1. **Kopiraj Public IPv4 address** (npr: 3.121.45.78)

2. **Otvori terminal:**

```bash
# Linux/Mac:
ssh -i ~/.ssh/aws-keys/freelance-server-key.pem ubuntu@3.121.45.78

# Zameni IP adresu sa svojom!
```

**Ako vidiš:**
```
Welcome to Ubuntu 22.04 LTS
ubuntu@ip-xxx:~$
```

✅ **Uspešno si se povezao na svoj AWS server!** 🎉

---

### KORAK 7: CloudFront (CDN)

**Šta je CloudFront?**
Content Delivery Network - mreža servera širom sveta koji keširaju tvoje fajlove.

**Zašto?** Korisnik iz Srbije će dobiti fajlove sa servera u Frankfurtu, ne iz Amerike = MNOGO brže!

**Ovo ćemo podesiti NAKON što deploy-ujemo frontend!**

---

## 📦 6. Deployment proces {#deployment}

### 6.1. Priprema Django za AWS

#### A) Update settings.py

**Kreiraćemo dva settings fajla:**
1. `settings.py` - development (lokalno)
2. `settings_production.py` - production (AWS)

---

## 📦 6. Deployment proces {#deployment}

### 6.1. Django Settings za Production

Već smo kreirali [backend/config/settings_production.py](backend/config/settings_production.py) koji koristi:

**Osnovne razlike od development settings:**

```python
# Development (settings.py)
DEBUG = True
DATABASES = SQLite
STATIC_URL = '/static/'
MEDIA handling = Local disk

# Production (settings_production.py)
DEBUG = False                    # NIKAD True u production!
DATABASES = PostgreSQL (RDS)     # Managed baza
STATIC = WhiteNoise              # Brže serviranje
MEDIA = S3                       # Cloud storage
```

**Zašto ove promene?**

1. **DEBUG=False:**
   - DEBUG=True pokazuje detaljne error poruke sa strukturom projekta
   - Haker može videti SQL queries, putanje fajlova, environment vars
   - U production-u, error pages su generičke (404, 500)

2. **PostgreSQL umesto SQLite:**
   - SQLite je jedan fajl - može biti corrupt ako server padne
   - PostgreSQL podržava više konekcija istovremeno
   - RDS automatski pravi backup-e

3. **WhiteNoise za static:**
   - Služi CSS/JS fajlove direktno iz Django app-a
   - Kompresuje fajlove za brže učitavanje
   - Alternativa je nginx, ali WhiteNoise je jednostavniji

4. **S3 za media:**
   - EC2 storage je ograničen (8GB)
   - Ako se EC2 restartuje, fajlovi na disku mogu nestati
   - S3 je trajno storage sa automatskim backup-ima

---

### 6.2. Backend Deployment na EC2

Konačno deployujemo Django backend na server!

#### Korak 1: Konektuj se na EC2

```bash
# Lokalno, otvori terminal
cd ~/.ssh/aws-keys

# SSH na server (zameni IP sa svojim)
ssh -i freelance-server-key.pem ubuntu@3.121.45.78
```

**Šta se dešava?**
- `-i` = identity file (tvoj privatni SSH ključ)
- `ubuntu` = default username za Ubuntu AMI
- `3.121.45.78` = Public IP tvog EC2 servera

**Ako vidiš:**
```
Welcome to Ubuntu 22.04.3 LTS
ubuntu@ip-172-31-xx-xx:~$
```

✅ **Uspešno si se povezao!**

---

#### Korak 2: Kloniraj Repository

```bash
# Proveri da li Git postoji
git --version

# Ako ne postoji, instaliraj:
sudo apt update && sudo apt install git -y

# Kloniraj tvoj projekat (zameni sa svojim GitHub URL-om)
git clone https://github.com/TVOJ-USERNAME/freelance-command-center.git

# Navigiraj u backend folder
cd freelance-command-center/backend
```

**Šta je Git Clone?**
Preuzima ceo tvoj projekat sa GitHub-a na EC2 server.

---

#### Korak 3: Pokreni Setup Skriptu

Napravili smo skriptu koja automatski instalira sve potrebno!

```bash
# Daj skripti dozvolu za izvršavanje
chmod +x setup_ec2.sh

# Pokreni setup
./setup_ec2.sh
```

**Šta ova skripta radi?** (10-15 minuta)

1. ✅ Update-uje Ubuntu pakete
2. ✅ Instalira Python 3.11, pip, venv
3. ✅ Instalira PostgreSQL client (za RDS konekciju)
4. ✅ Instalira Nginx web server
5. ✅ Kreira Python virtual environment
6. ✅ Instalira sve Python dependencies iz requirements-aws.txt
7. ✅ Kreira `.env` fajl (sa placeholder vrednostima)
8. ✅ Konfiguriše Gunicorn kao systemd service
9. ✅ Konfiguriše Nginx kao reverse proxy
10. ✅ Pokreće Gunicorn i Nginx

**Output koji očekuješ:**
```
🎬 Starting EC2 setup for Django deployment...
📦 Updating system packages...
📦 Installing system dependencies...
📁 Setting up project directory...
...
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         ✅ EC2 SETUP COMPLETE! 🎉                    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

#### Korak 4: Konfiguriši Environment Variables

Setup skripta je kreirala `.env` fajl, ali sa placeholder vrednostima. Moramo uneti PRAVE credentials!

```bash
# Edituj .env
nano .env
```

**Nano editor basics:**
- Krećeš se strelicama
- Brišeš backspace-om
- `Ctrl+O` = Save (pa Enter)
- `Ctrl+X` = Exit

**Evo šta treba da promeniš:**

```bash
# Django Settings
SECRET_KEY=django-insecure-xxx  # ← OVO JE VEĆ GENERISANO, ne diraj!
DEBUG=False                      # ← MORA biti False!
ALLOWED_HOSTS=3.121.45.78,localhost,127.0.0.1  # ← Dodaj svoj EC2 IP!

# RDS Database - OVDE UNESI PRAVE VREDNOSTI!
DB_NAME=freelance_db             # ← Ime koje si dao RDS bazi
DB_USER=postgres                 # ← Master username iz RDS
DB_PASSWORD=TVOJA_RDS_LOZINKA   # ← Lozinku koju si kreirao!
DB_HOST=freelance-db.c1abc2def3.eu-central-1.rds.amazonaws.com  # ← RDS endpoint!
DB_PORT=5432                     # ← Default PostgreSQL port

# AWS S3 - OVDE UNESI AWS CREDENTIALS!
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE      # ← Iz IAM user-a "deployer"
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MD    # ← Iz IAM user-a
AWS_STORAGE_BUCKET_NAME=freelance-media-tvoje-ime  # ← Media bucket ime
AWS_S3_REGION_NAME=eu-central-1

# CORS - Frontend URL
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://freelance-frontend-tvoje.s3-website.eu-central-1.amazonaws.com
```

**Gde naći ove vrednosti?**

| Varijabla | Gde naći |
|-----------|----------|
| RDS Endpoint | AWS Console → RDS → Databases → Klikni na freelance-db → Connectivity & security → Endpoint |
| RDS Password | Lozinka koju si kreirao kad si pravio RDS bazu (moraš znati!) |
| AWS Keys | AWS Console → IAM → Users → deployer → Security credentials → Access keys |
| S3 Bucket | AWS Console → S3 → Buckets (kopiraj ime media bucketa) |

**Sačuvaj fajl:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

#### Korak 5: Proveri RDS Konekciju (opciono, ali preporučeno)

Pre nego što nastavimo, hajde da proverimo da li možemo da se povežemo na RDS:

```bash
# Instaliraj PostgreSQL client ako već nije
sudo apt install postgresql-client -y

# Test konekcija (unesi RDS password kad te pita)
psql -h freelance-db.xxx.rds.amazonaws.com -U postgres -d freelance_db
```

**Ako vidiš:**
```
Password for user postgres: [unesi password]
psql (14.x, server 15.x)
Type "help" for help.

freelance_db=>
```

✅ **Konekcija uspešna!** Ukucaj `\q` da izađeš.

**Ako dobiješ error:**
```
psql: error: connection to server at "..." failed: Connection timed out
```

❌ **Problem sa Security Group!** Proveri:
1. RDS Security Group Inbound rules
2. Mora imati pravilo: PostgreSQL (5432) → Source: 0.0.0.0/0 (ili EC2 SG)

---

#### Korak 6: Django Setup

Sada kada je .env podešen, možemo pokrenuti Django setup:

```bash
# Aktiviraj virtual environment
source venv/bin/activate

# Postavi Django settings na production
export DJANGO_SETTINGS_MODULE=config.settings_production

# Primeni database migracije
python manage.py migrate
```

**Šta se dešava:**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, core, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  ...
```

✅ **Django tabele su kreirane u RDS bazi!**

---

#### Korak 7: Kreiraj Superuser-a

```bash
python manage.py createsuperuser

# Unesi podatke:
Username: admin
Email: tvoj-email@example.com
Password: [sigurna lozinka]
Password (again): [ponovi]
```

**Šta je superuser?**
Admin nalog koji može pristupiti Django admin panel-u (`/admin`)

---

#### Korak 8: Collect Static Files

Django mora "sakupiti" sve static fajlove (CSS, JS) u jedan folder:

```bash
python manage.py collectstatic --noinput
```

**Output:**
```
Copying '/home/ubuntu/freelance-command-center/backend/venv/lib/python3.11/site-packages/django/contrib/admin/static/admin/css/base.css'
...
123 static files copied to '/home/ubuntu/freelance-command-center/backend/staticfiles'
```

**Šta se dešava?**
- Django prikuplja sve static fajlove iz installed apps
- Stavlja ih u `staticfiles/` folder
- WhiteNoise ih kompresuje i služi klijentima

---

#### Korak 9: Proveri Servise

Setup skripta je već pokrenula Gunicorn i Nginx. Hajde da proverimo:

```bash
# Proveri Gunicorn
sudo systemctl status gunicorn

# Očekuješ:
● gunicorn.service - Gunicorn daemon for Freelance Command Center
   Loaded: loaded
   Active: active (running) since ...
```

```bash
# Proveri Nginx
sudo systemctl status nginx

# Očekuješ:
● nginx.service - A high performance web server
   Loaded: loaded
   Active: active (running) since ...
```

**Ako je neki stopped:**
```bash
sudo systemctl start gunicorn
sudo systemctl start nginx
```

---

#### Korak 10: Test Backend-a

**Test sa servera (internal):**
```bash
curl http://localhost
```

**Očekuješ:** HTML output ili `{"detail":"..."}` JSON odgovor.

**Test sa spoljašnjeg računara:**

Otvori browser na **svom računaru** (ne na serveru):
```
http://3.121.45.78
```
*(Zameni IP sa svojim EC2 Public IP-em)*

**Ako vidiš bilo kakav output (HTML ili JSON) = RADI!** ✅

**Ako ne radi:**
```bash
# Proveri logove
sudo journalctl -u gunicorn -n 50 --no-pager
sudo tail -f /var/log/nginx/error.log
```

---

#### Korak 11: Test Django Admin Panel-a

```
http://3.121.45.78/admin
```

**Trebao bi videti Django login stranicu!**

Uloguj se sa superuser credentials-ima koje si kreirao.

Ako vidiš Django admin dashboard = ✅ **Backend je LIVE!**

---

### 6.3. Frontend Deployment na S3

Sada deployujemo React frontend!

#### Korak 1: Update API Endpoint (lokalno)

Na **svom računaru** (ne na EC2!), otvori frontend projekat:

```bash
cd ~/DevProjects/freelance-command-center/frontend
```

**Edituj `src/api.ts`:**

```typescript
// Staro (development):
const API_BASE_URL = 'http://localhost:8000/api';

// Novo (production):
const API_BASE_URL = 'http://3.121.45.78/api';  // ← Tvoj EC2 IP!
```

**Zašto ova promena?**
React aplikacija mora znati GOLI da poziva Django API na EC2 serveru!

**Sačuvaj fajl.**

---

#### Korak 2: Update CORS u Django

Frontend će sada slati request-e sa S3 URL-a, moramo dodati taj URL u CORS:

**SSH na EC2:**
```bash
ssh -i key.pem ubuntu@EC2-IP
cd ~/freelance-command-center/backend
nano .env
```

**Dodaj S3 frontend URL u CORS:**
```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://freelance-frontend-tvoje-ime.s3-website.eu-central-1.amazonaws.com
```

**Restart Gunicorn:**
```bash
sudo systemctl restart gunicorn
```

---

#### Korak 3: Build React Aplikacije (lokalno)

```bash
# U frontend folderu
cd frontend

# Proveri da li node_modules postoji
# Ako ne, instaliraj:
npm install

# Build production verziju
npm run build
```

**Šta se dešava:** (1-2 minute)
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:

  52.41 kB  build/static/js/main.abc123.js
  1.78 kB   build/static/css/main.def456.css
  ...

The build folder is ready to be deployed.
```

**Kreiran je `build/` folder sa:**
- `index.html` - glavna HTML stranica
- `static/js/` - JavaScript bundle-i
- `static/css/` - CSS fajlovi
- Svi fajlovi su minifikovani i optimizovani!

---

#### Korak 4: Deploy na S3

**Edituj deployment skriptu:**
```bash
nano deploy-frontend.sh
```

**Promeni ove linije:**
```bash
S3_BUCKET="freelance-frontend-tvoje-ime"  # ← Tvoj bucket name!
CLOUDFRONT_DISTRIBUTION_ID=""             # ← Ostavimo prazno za sada
AWS_REGION="eu-central-1"
```

**Sačuvaj i pokreni:**
```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

**Output:**
```
🚀 Starting frontend deployment...
🔍 Checking AWS CLI...
✅ AWS CLI found
📦 Checking dependencies...
🏗️  Building React application...
✅ Build completed
☁️  Uploading to S3...
upload: build/index.html to s3://freelance-frontend-tvoje/index.html
upload: build/static/js/main.abc123.js to s3://...
...
✅ Files uploaded to S3
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       ✅ FRONTEND DEPLOYMENT SUCCESSFUL! 🎉          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

🌐 Your website is available at:
   S3: http://freelance-frontend-tvoje.s3-website.eu-central-1.amazonaws.com
```

---

#### Korak 5: Test Frontend-a

**Otvori S3 website URL u browseru:**
```
http://freelance-frontend-tvoje-ime.s3-website.eu-central-1.amazonaws.com
```

**Trebao bi videti Freelance Command Center aplikaciju!** 🎉

**Testiraj:**
- ✅ Aplikacija se učitava
- ✅ Login forma je vidljiva
- ✅ Register forma radi
- ✅ Pokušaj da se uloguješ

**Ako login radi = Backend + Frontend komunikacija uspešna!**

---

### 6.4. CloudFront CDN Setup

CloudFront će:
- Keširovati fajlove bliže korisnicima (brže učitavanje)
- Automatski pruži HTTPS (S3 website nema SSL)
- Smanjiti broj S3 request-a (ušteda troškova)

#### Kreiranje CloudFront Distribucije

```
AWS Console → CloudFront → Create distribution
```

**1. Origin settings:**
```
Origin domain: NE BIRATI iz dropdown-a!
              Ručno unesi: freelance-frontend-tvoje.s3-website.eu-central-1.amazonaws.com

              ⚠️ VAŽNO: Mora biti S3 WEBSITE endpoint, ne obični S3!

Origin path: (ostavi prazno)
Name: S3-Frontend (automatski popunjeno)
```

**Zašto S3 website endpoint?**
Obični S3 endpoint ne podržava index.html fallback (potrebno za React Router).

**2. Default cache behavior:**
```
Path pattern: Default (*)
Compress objects automatically: Yes
Viewer protocol policy: Redirect HTTP to HTTPS  ← HTTPS za sve!
Allowed HTTP methods: GET, HEAD
Cache policy: CachingOptimized
```

**3. Settings:**
```
Price class: Use only North America and Europe
             (najjeftiniji + pokriva Evropu)

Alternate domain name (CNAME): (ostavi prazno za sada)
                                (kasnije možeš dodati custom domain)

Custom SSL certificate: Default CloudFront certificate

Default root object: index.html
```

**4. Klikni "Create distribution"**

⏳ **Status: Deploying** (10-15 minuta)

Čekaćemo da status postane **"Enabled"**.

---

#### Error Pages za React Router

React Router koristi client-side routing - sve rute idu kroz `index.html`.

Moramo reći CloudFront-u: "Ako fajl ne postoji (404), vrati index.html"

**Kada je distribution Enabled:**

```
CloudFront → Tvoja distribucija → Error Pages → Create custom error response
```

**Kreiraj 2 pravila:**

**Pravilo 1:**
```
HTTP error code: 403 Forbidden
Customize error response: Yes
Response page path: /index.html
HTTP response code: 200 OK
```

**Pravilo 2:**
```
HTTP error code: 404 Not Found
Customize error response: Yes
Response page path: /index.html
HTTP response code: 200 OK
```

**Zašto ovo radimo?**

React Router rute (npr: `/clients`, `/invoices`) ne postoje kao fajlovi na S3.
S3 bi vratio 404. CloudFront interceptuje taj 404 i vraća `index.html` umesto toga.
React Router onda učitava pravu rutu client-side!

---

#### Test CloudFront-a

**Kopiraj CloudFront domain name:**
```
CloudFront → Distribucija → General → Distribution domain name
Primer: d1234abcd.cloudfront.net
```

**Otvori u browseru:**
```
https://d1234abcd.cloudfront.net
```

✅ **Trebao bi videti aplikaciju preko HTTPS-a!**

---

#### Update Django CORS

Dodaj CloudFront domain u Django CORS:

**SSH na EC2:**
```bash
nano ~/freelance-command-center/backend/.env
```

**Dodaj CloudFront URL:**
```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://freelance-frontend-tvoje.s3-website.eu-central-1.amazonaws.com,https://d1234abcd.cloudfront.net
```

**Restart Gunicorn:**
```bash
sudo systemctl restart gunicorn
```

---

#### Update Frontend API URL (opciono - za HTTPS)

Ako želiš da koristiš HTTPS na backend-u takođe, moraćeš:

1. Kupiti domain
2. Postaviti SSL certifikat na EC2 (Let's Encrypt)
3. Update-ovati frontend API_BASE_URL

Za sada, HTTP na backend-u je OK za test!

---

## 🔒 7. Security Hardening {#security}

### 7.1. Ograniči RDS Pristup

**Trenutno:** RDS dozvoljava pristup sa bilo koje IP (0.0.0.0/0) - NESIGURNO!

**Bolje:** Dozvoli SAMO sa EC2 instance.

```
AWS Console → RDS → Databases → freelance-db → Connectivity & security
→ VPC security groups → Klikni na security group

Inbound rules → Edit inbound rules
```

**Promeni PostgreSQL pravilo:**
```
STARO:
Type: PostgreSQL
Port: 5432
Source: 0.0.0.0/0

NOVO:
Type: PostgreSQL
Port: 5432
Source: [EC2 Security Group ID]  ← Selektuj iz dropdown-a!
```

**Sada samo tvoj EC2 može pristupiti bazi!** ✅

---

### 7.2. Ukloni Port 8000 iz EC2

```
AWS Console → EC2 → Security Groups → freelance-backend-sg
Inbound rules → Edit inbound rules
```

**Obriši:**
```
Custom TCP | Port 8000 | Anywhere
```

Koristimo samo port 80 (HTTP) i 443 (HTTPS). Nginx proxy-uje na Gunicorn.

---

### 7.3. HTTPS na EC2 (opciono - za custom domain)

**Ako imaš domain:**

```bash
# SSH na EC2
sudo apt install certbot python3-certbot-nginx -y

# Dobij SSL certifikat
sudo certbot --nginx -d tvoj-domen.com

# Auto-renewal test
sudo certbot renew --dry-run
```

Certbot automatski konfiguriše Nginx za HTTPS!

---

## 📊 8. Monitoring & Maintenance {#maintenance}

### 8.1. CloudWatch Billing Alarm

```
AWS Console → CloudWatch → Billing → Create alarm

Metric: EstimatedCharges
Threshold: Greater than $1
Notification: Create new SNS topic → Unesi email
```

Dobijaš email ako troškovi pređu $1 - rano upozorenje!

---

### 8.2. Logovi

**Gunicorn logs:**
```bash
sudo journalctl -u gunicorn -f
```

**Nginx logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Django logs:**
```bash
tail -f ~/freelance-command-center/backend/logs/django.log
```

---

### 8.3. Update Aplikacije

**Backend update:**
```bash
ssh -i key.pem ubuntu@EC2-IP
cd ~/freelance-command-center/backend
./deploy.sh
```

**Frontend update:**
```bash
# Lokalno
cd frontend
npm run build
./deploy-frontend.sh
```

---

## 🎉 9. Čestitamo! Aplikacija je LIVE!

### 9.1. Final Checklist

- ✅ RDS PostgreSQL baza radi
- ✅ EC2 backend server radi
- ✅ S3 frontend hosted
- ✅ CloudFront CDN aktivan
- ✅ HTTPS enabled (CloudFront)
- ✅ Security Groups konfigurisani
- ✅ Billing alert postavljen

### 9.2. Tvoji URL-ovi

```
Frontend: https://d1234abcd.cloudfront.net
Backend:  http://3.121.45.78
Admin:    http://3.121.45.78/admin
```

### 9.3. Šta si naučio

🎓 **AWS Koncepti:**
- EC2, RDS, S3, CloudFront, IAM, Security Groups, VPC

💻 **DevOps Skills:**
- Linux server administracija
- Nginx + Gunicorn setup
- SSH i systemd services
- Deployment automation

🐍 **Django Production:**
- Production settings
- PostgreSQL migracije
- Static/media file handling
- Environment variables

⚛️ **React Deployment:**
- Production build
- S3 static hosting
- CDN integration

---

## 📚 10. Dodatni Resursi

- [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Gunicorn Docs](https://docs.gunicorn.org/)
- [Nginx Docs](https://nginx.org/en/docs/)

---

## 🚀 11. Sledeći Koraci

1. **Custom Domain** - Kupi domain (Namecheap, GoDaddy)
2. **Route 53** - AWS DNS service
3. **SSL na Backend-u** - Let's Encrypt certifikat
4. **CI/CD** - GitHub Actions automatski deployment
5. **Database Backups** - RDS automated backups
6. **Monitoring** - CloudWatch dashboards
7. **Email** - Amazon SES za slanje faktura

---

**Srećno sa projektom! 🎉**

*Imaš pitanja? Otvori Issue na GitHub-u ili kontaktiraj autora.*
