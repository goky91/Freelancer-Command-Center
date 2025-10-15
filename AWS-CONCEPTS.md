# 🎓 AWS Koncepti - Objašnjenja za Početnike

Ovaj dokument detaljno objašnjava AWS koncepte koje koristimo u projektu.

---

## 📦 1. EC2 (Elastic Compute Cloud)

### Šta je to?

**EC2 je virtuelna mašina (računar) u oblaku.**

### Analogija

Zamišljaj kao da iznajmljuješ računar u data centru koji radi 24/7:
- Ne moraš da kupiš hardver
- Ne plaćaš struju
- Ne brineš o održavanju
- Možeš ga uključiti/isključiti kad hoćeš

### Instance Types

```
Format: [Familija][Generacija].[Veličina]

Primer: t2.micro
  t  = Type family (burstable performance)
  2  = Generation (novija je bolja)
  micro = Size (najmanji)
```

**Free Tier:**
- **t2.micro:** 1 vCPU, 1GB RAM
- **750 sati mesečno** = može raditi 24/7 ceo mesec!

### Burstable Performance (T2 familija)

T2 instance imaju "credit" sistem:
- **Baseline performance:** Konstantan CPU koji uvek imaš
- **CPU Credits:** Akumuliraš kad ne koristiš mnogo CPU
- **Burst:** Kad ti treba više CPU-a, potrošiš kredite

**Analogija:** Kao prepaid mobilni - akumuliraš minute kad ne pričaš,
potrošiš ih kad ti treba više.

### Instance Lifecycle States

```
┌──────────┐  Launch    ┌─────────┐
│ Stopped  │ ──────────>│ Running │
└──────────┘            └─────────┘
     ↑                       │
     └───────────────────────┘
            Stop
```

- **Running:** Radi i plaćaš compute hours
- **Stopped:** Ne radi, NE plaćaš compute, ALI plaćaš storage

⚠️ **Free Tier:** 750h running stanje. Ako prekoračiš, plaćaš ~$0.012/sat.

---

## 🗄️ 2. RDS (Relational Database Service)

### Šta je to?

**Managed baza podataka - AWS održava bazu umesto tebe.**

### Managed znači da AWS radi:

✅ Automatski backup-e svaki dan
✅ Software updates (PostgreSQL verzije)
✅ Hardware maintenance
✅ Replication (kopije podataka)
✅ Monitoring

**Ti samo koristiš bazu - kao unajmljeni Database Administrator!**

### Zašto ne SQLite na EC2?

| SQLite na EC2 | RDS PostgreSQL |
|---------------|----------------|
| Fajl na disku | Managed server |
| Ako EC2 padne, fajl može biti corrupt | Automatski backups |
| Jedna konekcija po vrijeme | Hiljade konekcija |
| Moraš ručno backup-ovati | AWS se brine |
| Besplatno | Free Tier 750h |

**Za production, RDS je MUST!**

### DB Instance Classes

```
db.t3.micro (FREE TIER)
  - 2 vCPU
  - 1 GB RAM
  - 20 GB storage (max za free tier)
  - Network bandwidth: Do 2 Gbps
```

### Backup & Recovery

**Automated Backups:**
- Retention: 0-35 dana
- Free Tier: Storage za backup se naplaćuje (zato smo disabled-ovali)
- Za production: UKLJUČI (makar 7 dana)

**Manual Snapshots:**
- Rucno kreiras snapshot baze
- Čuvaš ga beskonacno
- Možeš restore-ovati u novi DB instance

### Multi-AZ vs Single-AZ

**Availability Zone (AZ)** = Data centar u regionu

**Single-AZ (Free Tier):**
```
┌─────────────────┐
│   eu-central-1a │
│                 │
│  [PostgreSQL]   │
│                 │
└─────────────────┘
```
- Baza je u jednom data centru
- Ako AZ padne, baza je dole

**Multi-AZ (Production):**
```
┌─────────────────┐     ┌─────────────────┐
│   eu-central-1a │     │   eu-central-1b │
│                 │     │                 │
│  [Primary DB]   │────>│  [Standby DB]   │
│                 │     │  (automatic)    │
└─────────────────┘     └─────────────────┘
```
- Automatska replikacija u drugi data centar
- Ako jedan AZ padne, automatski failover
- ~2x skuplje

---

## 📂 3. S3 (Simple Storage Service)

### Šta je to?

**Beskonačan cloud storage za bilo koje fajlove.**

### Analogija

Dropbox ili Google Drive, ali:
- Nemaš folder strukturu (sve je "flat")
- Optimizovan za velike količine fajlova
- Plaćaš po GB i broju requests

### Bucket

**Bucket = Kontejner za fajlove**

Pravila:
- Ime mora biti globalno jedinstveno (ceo AWS!)
- Ime može imati samo mala slova, brojeve, crtice
- Ne može se menjati nakon kreiranja
- Max 100 buckets po AWS account-u

### Object

**Object = Fajl u bucket-u**

Svaki object ima:
- **Key:** Putanja (npr: `media/invoices/2024/invoice-123.pdf`)
- **Value:** Sadržaj fajla (binary data)
- **Metadata:** Dodatne informacije (content-type, cache-control)
- **Version ID:** Ako je versioning enabled

### Storage Classes

```
Standard (Free Tier)
  - Najbrži pristup
  - Najviša cena
  - Za često korišćene fajlove

Standard-IA (Infrequent Access)
  - Jeftiniji storage
  - Plaćaš retrieval cost
  - Za arhivu

Glacier
  - Najjeftiniji
  - Retrieval traje minute/sate
  - Za backup-e
```

**Mi koristimo Standard** (FREE TIER: 5GB)

### Public vs Private

**Public bucket (frontend):**
```json
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::bucket/*"
}
```
- Bilo ko na internetu može da čita fajlove
- Mora za static website hosting

**Private bucket (media):**
- Samo autorizovani korisnici/aplikacije
- EC2 koristi IAM Role za pristup
- Može generisati **presigned URLs** (privremene URL-ove)

### Presigned URLs

Django može kreirati privremene URL-ove za privatne fajlove:

```python
# Ovaj URL radi samo 1 sat
url = s3_client.generate_presigned_url(
    'get_object',
    Params={'Bucket': 'bucket', 'Key': 'invoice.pdf'},
    ExpiresIn=3600  # 1 hour
)
```

Korisnik može downloadovati fajl preko ovog URL-a,
ali URL expiruje nakon 1 sata - sigurnije!

### Static Website Hosting

S3 može hostovati static website-ove (HTML, CSS, JS):

```
URL format:
http://bucket-name.s3-website.region.amazonaws.com

Primer:
http://freelance-frontend.s3-website.eu-central-1.amazonaws.com
```

**Index document:** Glavni fajl (index.html)
**Error document:** Za 404 greške (kod nas isto index.html za React Router)

---

## 🌐 4. CloudFront (CDN)

### Šta je CDN?

**Content Delivery Network = Mreža servera širom sveta.**

### Kako radi?

```
Bez CDN-a:
  Korisnik (Beograd) → S3 (Frankfurt) → 50ms latency

Sa CDN-om:
  Korisnik (Beograd) → CloudFront Edge (Frankfurt) → 5ms latency
                           ↓
                       Cache (ako fajl već postoji)
                           ↓
                       S3 (Frankfurt) - samo prvi put
```

### Edge Locations

CloudFront ima **400+ edge location-a** širom sveta:

```
├─ Evropa: Frankfurt, London, Milano, Amsterdam, Stokholm, ...
├─ Amerika: New York, LA, Miami, Sao Paolo, ...
├─ Azija: Tokyo, Singapore, Mumbai, Seoul, ...
└─ Australija: Sydney, Melbourne
```

**Korisnik uvek dobija fajl sa najbližeg edge servera!**

### Cache Behavior

**TTL (Time To Live)** = Koliko dugo CloudFront keširaj fajl

```javascript
// index.html - NIKAD ne keširaj (uvek nova verzija)
Cache-Control: no-cache, no-store, must-revalidate

// app.js - keširaj 1 godinu (ima hash u imenu)
Cache-Control: max-age=31536000, immutable
```

### Invalidation

Kad upload-uješ novi fajl, moraš "invalidate" cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id ABCD123 \
  --paths "/*"
```

**Šta se dešava:**
- CloudFront briše sve keširane fajlove
- Sledeći request uzima novu verziju sa S3
- Novi fajl se keširaj ponovo

⚠️ **Free Tier:** 1000 invalidation paths mesečno

### Origin

**Origin** = Gde CloudFront uzima fajlove (source)

Za nas:
- Origin = S3 bucket website endpoint
- CloudFront keširaj fajlove sa S3

### SSL/HTTPS

CloudFront AUTOMATSKI pruža besplatan SSL certifikat!

```
http://bucket.s3-website.amazonaws.com   (HTTP only)
           ↓
https://d123.cloudfront.net              (HTTPS!)
```

---

## 🔐 5. IAM (Identity and Access Management)

### Šta je to?

**Sistem za upravljanje dozvolama - ko šta sme da radi.**

### 3 glavna koncepta:

#### 1. Users

**User = Osoba ili aplikacija sa credentials-ima**

Primeri:
- Ti (admin)
- Deployment bot
- Backup script

User ima:
- Username
- Password (za Console login)
- Access Key + Secret Key (za CLI/API)

#### 2. Groups

**Group = Skup usera sa istim dozvolama**

```
Group: Developers
  Users: Marko, Ana, Petar
  Permissions: EC2, RDS, S3 read/write
```

#### 3. Roles

**Role = Dozvole koje se dodeljuju AWS resursima (ne ljudima!)**

**VAŽNA razlika:**
- **User:** Ima credentials (lozinku/key)
- **Role:** NEMA credentials, dodeljuje se resursu

Primer:
```
EC2 instance → IAM Role → S3 dozvole

EC2 automatski dobija privremene credentials
i može da piše u S3, bez hardcoded keys!
```

### Policies

**Policy = JSON dokument sa dozvolama**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bucket/*"
    }
  ]
}
```

Elementi:
- **Effect:** Allow ili Deny
- **Action:** Šta sme (s3:GetObject, ec2:StartInstance, ...)
- **Resource:** Na koji resurs (ARN)

### AWS Managed Policies

AWS ima gotove policies:

- **AmazonS3FullAccess:** Puna kontrola nad S3
- **AmazonS3ReadOnlyAccess:** Samo čitanje S3
- **AmazonEC2FullAccess:** Puna kontrola nad EC2

**Za production:** Pravi custom policies sa MINIMALNIM dozvolama (Principle of Least Privilege)

### ARN (Amazon Resource Name)

**ARN = Jedinstveni ID svakog AWS resursa**

Format:
```
arn:partition:service:region:account-id:resource

Primeri:
arn:aws:s3:::my-bucket/file.txt
arn:aws:ec2:eu-central-1:123456789:instance/i-abc123
arn:aws:rds:eu-central-1:123456789:db:freelance-db
```

---

## 🔒 6. Security Groups

### Šta je to?

**Virtuelni firewall za AWS resurse.**

### Analogija

Security Group = Portir ispred zgrade:
- Odlučuje ko sme da uđe (inbound rules)
- Odlučuje ko sme da izađe (outbound rules)
- Proverava na osnovu liste (IP adrese, protokol, port)

### Inbound vs Outbound

**Inbound rules:** Ko sme da PRISTUPI tvom resursu

```
| Type  | Protocol | Port | Source      | Opis                |
|-------|----------|------|-------------|---------------------|
| SSH   | TCP      | 22   | 1.2.3.4/32  | Samo tvoj računar  |
| HTTP  | TCP      | 80   | 0.0.0.0/0   | Bilo ko sa neta    |
| HTTPS | TCP      | 443  | 0.0.0.0/0   | Bilo ko sa neta    |
```

**Outbound rules:** Tvoj resurs šta sme da POZIVA

```
Default: All traffic, All protocols, All ports → ANYWHERE
(EC2 može pozivati bilo šta na internetu)
```

### CIDR Notation

**CIDR = IP range notacija**

```
0.0.0.0/0       = EVERYWHERE (bilo ko)
1.2.3.4/32      = JEDNA IP adresa (1.2.3.4)
10.0.0.0/24     = 256 IP adresa (10.0.0.0 - 10.0.0.255)
```

**Broj iza / = broj fixed bitova**

### Security Group Referencing

Možeš referencirati drugi security group umesto IP adrese:

```
RDS Security Group:
  Inbound: PostgreSQL (5432) Source: EC2-Security-Group

= RDS dozvoljava konekcije SAMO od EC2 instance-i
  koje imaju taj security group
```

**Prednost:** Ne moraš znati tačnu IP adresu EC2 instance-a!

### Stateful Firewall

Security Groups su **stateful**:
- Ako dozvoliš inbound konekciju, outbound response je automatski dozvoljen
- Ne moraš ručno dodavati return traffic rule

```
Request:  Korisnik (1.2.3.4) → EC2 (port 80) ✅ Allowed
Response: EC2 → Korisnik (1.2.3.4)          ✅ Auto-allowed
```

---

## 🌍 7. Regions & Availability Zones

### Region

**Region = Geografska lokacija sa više data centara**

AWS ima **30+ regiona** širom sveta:

```
eu-central-1    = Frankfurt, Nemačka
eu-west-1       = Irska
us-east-1       = Severna Virdžinija, USA
us-west-2       = Oregon, USA
ap-southeast-1  = Singapur
```

**Zašto Frankfurt?**
- Najbliži Srbiji
- Najniža latencija
- GDPR compliance (EU data laws)

### Availability Zone (AZ)

**AZ = Jedan ili više data centara u regionu**

Svaki region ima **2-6 AZ-a:**

```
eu-central-1
  ├─ eu-central-1a (Data centar A)
  ├─ eu-central-1b (Data centar B)
  └─ eu-central-1c (Data centar C)
```

**Izolovani su fizički:**
- Različiti data centri (desetine km udaljenosti)
- Različite električne mreže
- Različita internet konekcija

**Zašto?** Ako jedan AZ padne (požar, poplava, elektrika), drugi rade normalno!

### High Availability Architecture

**Production setup:**

```
                       ┌──────────────────┐
                       │   Load Balancer  │
                       └────────┬─────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
        │   EC2 (1a)   │ │  EC2 (1b)  │ │  EC2 (1c)  │
        └──────────────┘ └────────────┘ └────────────┘
                │               │               │
                └───────────────┼───────────────┘
                                │
                       ┌────────▼─────────┐
                       │  RDS (Multi-AZ)  │
                       │  Primary:   1a   │
                       │  Standby:   1b   │
                       └──────────────────┘
```

Ako 1 AZ padne, aplikacija radi dalje!

**Free Tier setup (naš):**

```
┌──────────────┐
│  EC2 (1a)    │ ← Samo jedan AZ
└──────┬───────┘
       │
┌──────▼───────┐
│  RDS (1a)    │ ← Single-AZ
└──────────────┘
```

---

## 💰 8. Pricing & Free Tier

### Pricing Model

AWS koristi **Pay-as-you-go** model:
- Plaćaš samo ono što koristiš
- Nema ugovora, nema monthly fee
- Možeš zaustaviti resurse kad god hoćeš

### Free Tier Tipovi

#### 1. 12 meseci free (od registracije)

```
EC2:       750h/mesec t2.micro
RDS:       750h/mesec db.t3.micro + 20GB storage
S3:        5GB storage + 20k GET + 2k PUT
CloudFront: 50GB transfer + 2M requests
```

#### 2. Always free

```
Lambda:    1M requests/mesec
DynamoDB:  25GB storage
CloudWatch: 10 custom metrics
```

#### 3. Free trials

```
SageMaker:  250h/2 meseca
Inspector:  15 dana
```

### Šta SE naplaćuje?

**EC2:**
- Running time (po sekundi, zaokruženo na minutu)
- EBS storage (hard disk), čak i kad je stopped
- Data transfer OUT (iz AWS-a ka internetu)

**RDS:**
- Running time
- Storage (GB/mesec)
- Backup storage (iznad 100% DB size-a)
- Data transfer OUT

**S3:**
- Storage (GB/mesec)
- Requests (GET, PUT, DELETE)
- Data transfer OUT

**CloudFront:**
- Data transfer OUT
- Requests

### Šta je FREE?

- **Data transfer IN:** Upload-ovanje u AWS je uvek free!
- **Data transfer between services in SAME region:** EC2 ↔ RDS je free!
- **S3 storage (prvih 5GB)**

### Cost Estimation Tool

AWS nudi **Pricing Calculator:**
https://calculator.aws/

Možeš simulirati koliko bi koštalo:

```
Primer (nakon Free Tier-a):

EC2 t2.micro 24/7:       ~$8.50/mesec
RDS db.t3.micro:         ~$15/mesec
S3 (10GB):               ~$0.23/mesec
CloudFront (50GB):       ~$4/mesec
───────────────────────────────────
Total:                   ~$28/mesec
```

### Billing Alerts

**UVEK postavi billing alert!**

```
CloudWatch → Billing → Create alarm
Threshold: $1
```

Dobijaš email ako troškovi pređu $1 - rano upozorenje!

---

## 🚀 9. Deployment Pojmovi

### CI/CD

**Continuous Integration / Continuous Deployment**

**CI (Continuous Integration):**
```
git push → GitHub Actions →
  ├─ Run tests
  ├─ Check code style
  └─ Build application
```

**CD (Continuous Deployment):**
```
Tests passed → Automatically deploy →
  ├─ Build Docker image
  ├─ Push to ECR
  ├─ Update ECS
  └─ Application live!
```

### Blue-Green Deployment

**Zero-downtime deployment strategija:**

```
┌─────────────┐           ┌─────────────┐
│  Blue Env   │ ◄─────────│ Load Bal.   │
│  (old ver)  │  100%     │             │
└─────────────┘           └─────────────┘

                          ↓ Deploy new version

┌─────────────┐           ┌─────────────┐
│  Blue Env   │           │ Load Bal.   │
│  (old ver)  │           │             │
└─────────────┘           └──────┬──────┘
                                 │ Switch
┌─────────────┐                  │
│  Green Env  │ ◄────────────────┘
│  (new ver)  │  100%
└─────────────┘
```

Ako ima problema, switch back na Blue!

### Load Balancer

**Distribuira saobraćaj na više servera:**

```
                    ┌──────────────────┐
Users ──────────────►  Load Balancer   │
                    └────────┬─────────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
         ┌─────▼────┐  ┌────▼─────┐ ┌────▼─────┐
         │ Server 1 │  │ Server 2 │ │ Server 3 │
         └──────────┘  └──────────┘ └──────────┘
```

**Tipovi:**
- **ALB (Application Load Balancer):** Layer 7 (HTTP/HTTPS)
- **NLB (Network Load Balancer):** Layer 4 (TCP/UDP)
- **CLB (Classic Load Balancer):** Stari, deprecated

---

## 📚 Dodatni resursi

- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

Srećno sa učenjem! 🎓
