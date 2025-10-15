# 🎯 START HERE - AWS Deployment Vodič

**Dobrodošao! Ovaj fajl je tvoja polazna tačka za deployment na AWS.**

---

## 📖 Ko si ti?

Odaberi svoj profil:

### 👶 Potpuni početnik u AWS-u

**Nikad nisi koristio AWS? Nemoj se plašiti!**

Idi ovim redom:

1. **[AWS-CONCEPTS.md](AWS-CONCEPTS.md)** 🎓
   - Pročitaj PRVO ovo - objašnjava sve osnovne AWS koncepte
   - Ima analogije i vizualizacije
   - ~30 min čitanja

2. **[AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md)** 📚
   - Kompletni vodič sa teorijom + praksom
   - Detaljno objašnjava svaki korak
   - ~1-2 sata deployment

3. **[AWS-CHECKLIST.md](AWS-CHECKLIST.md)** ✅
   - Koristi dok deployuješ da ne zaboraviš ništa
   - Checkbox-uj svaki završeni korak

---

### 🧑‍💻 Znam nešto o AWS-u

**Koristio si AWS pre, ali trebaju ti detalji za ovaj projekat?**

Idi ovim redom:

1. **[README-AWS.md](README-AWS.md)** 📋
   - Brzi pregled arhitekture i setup-a
   - ~10 min čitanja

2. **[AWS-QUICK-START.md](AWS-QUICK-START.md)** ⚡
   - Konkretni koraci bez dugih objašnjenja
   - Reference dok deployuješ
   - ~30 min deployment

3. **[AWS-CHECKLIST.md](AWS-CHECKLIST.md)** ✅
   - Za pracenje progresa

---

### 🚀 AWS Pro

**Već radis sa AWS-om svaki dan?**

Dovoljno ti je:

1. **[AWS-QUICK-START.md](AWS-QUICK-START.md)** ⚡
   - Sve što ti treba u jednom fajlu
   - Deployment skripte ready

---

## 🗺️ Mapa Dokumentacije

```
START-HERE.md  ←  TI SI OVDE!
│
├─── 🎓 ZA UČENJE
│    │
│    ├─ AWS-CONCEPTS.md
│    │  └─ Šta je EC2, RDS, S3, CloudFront, IAM?
│    │     Analogije i objašnjenja
│    │
│    └─ AWS-DEPLOYMENT-GUIDE.md
│       └─ Kompletni teorija + praksa vodič
│          Koraci za AWS konzolu
│
├─── ⚡ ZA DEPLOYMENT
│    │
│    ├─ README-AWS.md
│    │  └─ Arhitektura i quick overview
│    │
│    ├─ AWS-QUICK-START.md
│    │  └─ Brzi vodič, korak-po-korak
│    │
│    └─ AWS-CHECKLIST.md
│       └─ Interaktivni checklist
│
└─── 🛠️ CONFIGURATION FILES
     │
     ├─ backend/
     │  ├─ Dockerfile
     │  ├─ requirements-aws.txt
     │  ├─ .env.example
     │  ├─ setup_ec2.sh          (chmod +x)
     │  ├─ deploy.sh              (chmod +x)
     │  └─ config/
     │     └─ settings_production.py
     │
     └─ frontend/
        └─ deploy-frontend.sh     (chmod +x)
```

---

## ⏱️ Koliko vremena treba?

### Prvo deployment (sa učenjem):

```
📚 Čitanje dokumentacije:  1-2 sata
☁️  Kreiranje AWS resursa:   30-45 min
🖥️  Backend deployment:       20-30 min
🎨 Frontend deployment:      10-15 min
🧪 Testing:                  15-20 min
────────────────────────────────────
   UKUPNO:                  ~3-4 sata
```

### Deployment kad već znaš:

```
☁️  AWS resursi:     15 min
🖥️  Backend:         10 min
🎨 Frontend:         5 min
────────────────────────────
   UKUPNO:         ~30 min
```

---

## 💰 Koliko košta?

### Prvih 12 meseci (FREE TIER):

```
✅ 100% BESPLATNO!

EC2 t2.micro:       750h/mes FREE
RDS db.t3.micro:    750h/mes FREE
S3:                 5GB FREE
CloudFront:         50GB FREE
Data transfer:      100GB FREE
```

### Nakon 12 meseci:

```
EC2:           ~$8.50/mes
RDS:           ~$15/mes
S3:            ~$0.50/mes
CloudFront:    ~$4/mes
──────────────────────────
TOTAL:         ~$28/mes
```

**TIP:** Postavi billing alert na $1 da dobijaš notifikaciju!

---

## 🎯 Šta ćeš deployovati?

```
Frontend (React + TypeScript)
   ↓ build
Static Files (HTML, CSS, JS)
   ↓ deploy
S3 Bucket + CloudFront (CDN)
   ↓
KORISNIK PRISTUPA OVDE
   ↓ API pozivi
Backend (Django + PostgreSQL)
   ↓ deploy
EC2 Server (Ubuntu + Nginx + Gunicorn)
   ↓ data
RDS PostgreSQL + S3 (media)
```

---

## 📋 Quick Pre-Flight Checklist

Pre nego što kreneš, proveri da imaš:

- [ ] AWS nalog (može se napraviti za 5 min)
- [ ] Kreditna kartica (za verifikaciju, neće naplatiti)
- [ ] Git repository (GitHub, GitLab, ili bilo koji)
- [ ] 3-4 sata slobodnog vremena (za prvo deployment)
- [ ] Kafa ☕ (opciono ali preporučeno 😄)

---

## 🚀 Let's Go!

**Odaberi svoj put:**

### Path 1: Potpuni početnik
👉 Otvori [AWS-CONCEPTS.md](AWS-CONCEPTS.md)

### Path 2: Znam AWS
👉 Otvori [AWS-QUICK-START.md](AWS-QUICK-START.md)

### Path 3: Samo pregledaj
👉 Otvori [README-AWS.md](README-AWS.md)

---

## 🆘 Pomoć

### Dokumentacija nije jasna?

Svi fajlovi su pisani sa detaljnim objašnjenjima i analogijama.
Ako nešto nije jasno:

1. Proveri [AWS-CONCEPTS.md](AWS-CONCEPTS.md) za pojašnjenje termina
2. Proveri [AWS-CHECKLIST.md](AWS-CHECKLIST.md) za troubleshooting
3. Otvori Issue na GitHub-u

### AWS konzola izgleda drugačije?

AWS često update-uje UI. Principi ostaju isti:
- Tražiš iste opcije (Free Tier, Instance Type, itd.)
- Isti resursi se kreiraju
- Poredak koraka može biti malo drugačiji

### Nešto ne radi?

**Backend issues:**
```bash
# SSH na EC2
ssh -i key.pem ubuntu@EC2-IP

# Proveri logove
sudo journalctl -u gunicorn -f
sudo systemctl status nginx
```

**Frontend issues:**
- Proveri browser DevTools → Console
- Proveri browser DevTools → Network tab
- Proveri API endpoint URL

**RDS konekcija:**
- Proveri Security Group rules
- Proveri .env credentials
- Test sa: `psql -h ENDPOINT -U postgres -d dbname`

---

## 🎓 Šta ćeš naučiti?

Kroz ovaj deployment proces naučićeš:

✅ **AWS Cloud Computing:**
- Virtuelne mašine (EC2)
- Managed baze (RDS)
- Object storage (S3)
- Content Delivery Network (CloudFront)
- Security & Permissions (IAM, Security Groups)

✅ **DevOps:**
- Linux server administracija
- Nginx web server
- Systemd services
- Deployment automation
- Environment variables

✅ **Production Best Practices:**
- Database migracije u production-u
- Static file serving
- Media file storage
- CORS i Security
- Logging i monitoring

---

## 🎉 Kada završiš

Tvoja aplikacija će biti:

✅ **Live na internetu** - bilo ko može pristupiti
✅ **Skalabilna** - možeš lako povećati resurse
✅ **Sigurna** - production-ready security settings
✅ **Brza** - CDN za static fajlove
✅ **Održiva** - deployment skripte za buduće update-e

---

## 💪 Ready?

**Klikni na svoj nivo i kreni:**

🟢 **Početnik** → [AWS-CONCEPTS.md](AWS-CONCEPTS.md)
🟡 **Srednji** → [AWS-QUICK-START.md](AWS-QUICK-START.md)
🔴 **Expert** → [AWS-QUICK-START.md](AWS-QUICK-START.md)

---

**Srećno! 🚀**

*P.S. Sve ove fajlove možeš čitati direktno na GitHub-u - lepše se renderuju!*
