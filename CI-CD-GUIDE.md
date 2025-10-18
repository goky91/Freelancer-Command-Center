# 📚 CI/CD - Kompletni Vodič za Početnike

## Sadržaj
1. [Šta je CI/CD i zašto ti treba?](#lekcija-1-šta-je-cicd-i-zašto-ti-treba)
2. [GitHub Actions - Osnove](#github-actions---tvoj-automatizovani-asistent)
3. [Struktura GitHub Actions](#struktura-github-actions)
4. [Backend CI Workflow](#backend-ci-workflow)
5. [Frontend CI Workflow](#frontend-ci-workflow)
6. [Backend CD Workflow](#backend-cd-workflow)
7. [Frontend CD Workflow](#frontend-cd-workflow)
8. [GitHub Secrets Setup](#github-secrets-setup)
9. [Testiranje Pipeline-a](#testiranje-pipeline-a)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Lekcija 1: Šta je CI/CD i zašto ti treba?

### Analogija - Fabrika Automobila 🚗

Zamislimo da praviš automobile. Bez automatizacije:

#### 1. **Ručni način (bez CI/CD):**
   - Ti ručno proveriš svaki deo automobila
   - Ručno sastaviš delove
   - Ručno testiraj da li auto radi
   - Ručno odvezеš auto u salon (deployment)
   - **Problem:** Sporo, greške se dešavaju, zaboraviš korak...

#### 2. **Sa fabričkom trakom (CI/CD):**
   - Svaki deo automatski prolazi kroz kontrolu kvaliteta (Testing)
   - Delovi se automatski sastavljaju (Build)
   - Auto se automatski testira
   - Auto se automatski dostavlja u salon (Deploy)
   - **Rezultat:** Brzo, konzistentno, bez grešaka!

---

## 🔍 Šta znače skraćenice?

### **CI = Continuous Integration** (Kontinuirana Integracija)

**Šta to znači?**
- Svaki put kada pushneš kod na GitHub, automatski se:
  - **Provere greške** (linting)
  - **Pokrenu testovi** (unit tests)
  - **Build-uje aplikacija** (provera da li se uspešno kompajlira)

**Zašto je bitno?**
- Odmah saznaš da li si nešto pokvaio
- Ne pushaš broken kod koji bi srušio production
- Kod je uvek u "ready to deploy" stanju

**Primer:**
```
Push kod → GitHub → Robot proveri kod →
  ✅ Sve OK: Kod je siguran za deploy
  ❌ Greška: Email ti stiže "Fix this!"
```

---

### **CD = Continuous Deployment/Delivery** (Kontinuirano Postavljanje)

**Šta to znači?**
- Ako su SVI testovi prošli (CI uspeo), automatski se:
  - **Deploy-uje na server** (EC2 za backend)
  - **Upload-uje na S3** (frontend)
  - **Restartuju servisi** (Gunicorn, Nginx)

**Zašto je bitno?**
- Ne moraš ručno da radiš deploy svaki put
- Deploy je uvek isti (konzistentan)
- Brže isporučuješ nove feature-e
- Smanjuješ ljudske greške

**Primer:**
```
CI prošao ✅ → Robot deploy-uje na server →
  ✅ Deploy uspeo: Users vide novu verziju!
  ❌ Deploy failed: Rollback na prethodnu verziju
```

---

## 📊 Razlika: Continuous Delivery vs Continuous Deployment

### **Continuous Delivery:**
```
Push → CI (testovi) → Build ✅ → ČEKA ODOBRENJE → Manual Deploy
                                      👆
                                  Ti klikneš "Deploy"
```

### **Continuous Deployment:**
```
Push → CI (testovi) → Build ✅ → AUTOMATSKI DEPLOY (bez odobrenja)
```

**Mi ćemo koristiti:** **Continuous Deployment** - potpuno automatski!

---

## 🏗️ GitHub Actions - Tvoj Automatizovani Asistent

### Šta je GitHub Actions?

**Analogija:** Zamišljaj GitHub Actions kao **robot-asistenta** koji živi u GitHub-u i čeka da mu daš zadatke.

Svaki put kada se nešto desi u tvom repository-ju (npr. push, pull request), robot se budi i izvršava zadatke koje si mu dao.

### Kako funkcioniše?

```
┌─────────────────────────────────────────────────┐
│  1. TI: git push (pushuješ kod na GitHub)       │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  2. GITHUB: Vidi novi push, pokreće robot-a     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  3. ROBOT (GitHub Actions):                     │
│     - Klonira tvoj kod                          │
│     - Pokreće testove                           │
│     - Build-uje aplikaciju                      │
│     - Deploy-uje na server                      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  4. TI: Dobijaš notifikaciju:                   │
│     ✅ "Success" ili ❌ "Failed"                 │
└─────────────────────────────────────────────────┘
```

---

## 📁 Struktura GitHub Actions

GitHub Actions čita fajlove iz specijalnog foldera:

```
tvoj-projekat/
├── .github/                    ← MORA ovako da se zove!
│   └── workflows/              ← Ovde žive svi "recipe"-i
│       ├── backend-ci.yml      ← Recept za Backend CI
│       ├── backend-cd.yml      ← Recept za Backend Deploy
│       ├── frontend-ci.yml     ← Recept za Frontend CI
│       └── frontend-cd.yml     ← Recept za Frontend Deploy
├── backend/
├── frontend/
└── README.md
```

**Važno:**
- Folder **MORA** da se zove `.github` (sa tačkom na početku)
- Subfolder **MORA** da se zove `workflows`
- Fajlovi mogu da se zovu kako hoćeš, ali **MORAJU** da imaju `.yml` ili `.yaml` ekstenziju

---

## 📝 Šta je YAML fajl (.yml)?

**YAML** = "YAML Ain't Markup Language"

**Analogija:** Kao kuvar reciept - listu instrukcija napisanu u strukturiranom formatu.

### Primer kuvar recepta:
```yaml
name: Napravi tortu           # Ime recepta

on:                           # Kada da se pokrene?
  kada_dodje_gost: true

jobs:                         # Lista poslova
  ispeci_tortu:               # Posao #1
    runs-on: kuhinja          # Gde se izvršava?
    steps:                    # Koraci
      - name: Sipaj brasno
      - name: Dodaj jaja
      - name: Peci 30 min
```

### GitHub Actions YAML - Stvarni primer:
```yaml
name: Backend CI              # Ime workflow-a

on:                           # Kada da se pokrene?
  push:                       # Kada neko push-uje kod
    branches: [main]          # Na koji branch?

jobs:                         # Lista poslova
  test:                       # Posao #1: Testiranje
    runs-on: ubuntu-latest    # Pokreni na Ubuntu serveru
    steps:                    # Koraci:
      - name: Checkout kod    # Korak 1
        uses: actions/checkout@v3

      - name: Instaliraj Python  # Korak 2
        uses: actions/setup-python@v4
        with:
          python-version: 3.11

      - name: Pokreni testove    # Korak 3
        run: pytest
```

---

## 🎯 Tvoj CI/CD Pipeline - Plan

Za tvoj projekat, imaćeš **4 workflow-a** (4 recepta):

### 1. **Backend CI** - Provera kvaliteta koda
**Kada se pokreće?** Svaki push ili pull request
**Šta radi?**
- Instalira Python dependencies
- Pokreće Django migracije (provera)
- Pokreće testove (ako ih imaš)
- Proveri da li se kod uspešno učitava

### 2. **Frontend CI** - Provera da frontend radi
**Kada se pokreće?** Svaki push ili pull request
**Šta radi?**
- Instalira npm packages
- Build-uje React aplikaciju
- Pokreće testove (ako ih imaš)

### 3. **Backend CD** - Automatski deploy na EC2
**Kada se pokreće?** Samo kada pushneš na `main` branch (i samo ako je CI uspeo!)
**Šta radi?**
- SSH-uje se na tvoj EC2 server
- Pull-uje najnoviji kod
- Pokreće migracije
- Restartuje Gunicorn

### 4. **Frontend CD** - Automatski deploy na S3
**Kada se pokreće?** Samo kada pushneš na `main` branch (i samo ako je CI uspeo!)
**Šta radi?**
- Build-uje React aplikaciju
- Upload-uje na S3 bucket
- (Opciono) Invalidira CloudFront cache

---

## 🔧 Backend CI Workflow

### Šta je cilj?

Svaki put kada push-uješ kod, automatski proveriš da li backend radi:
- Da li se dependencies instaliraju?
- Da li Django migracije rade?
- Da li postoje sintaksne greške?
- Da li testovi prolaze?

### Fajl: `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

# KADA da se pokrene ovaj workflow?
on:
  push:
    branches: [main, develop]  # Na push na main ili develop
    paths:
      - 'backend/**'           # Samo ako se menja backend kod
      - '.github/workflows/backend-ci.yml'  # Ili ovaj fajl
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

# POSLOVI (Jobs)
jobs:
  test:                        # Ime posla: test
    runs-on: ubuntu-latest     # Pokreni na Ubuntu serveru (GitHub daje besplatno!)

    # ENVIRONMENT VARIABLES
    env:
      DJANGO_SETTINGS_MODULE: config.settings  # Django settings fajl

    # KORACI (Steps)
    steps:
      # Korak 1: Preuzmi kod sa GitHub-a
      - name: Checkout kod
        uses: actions/checkout@v3

      # Korak 2: Instaliraj Python 3.11
      - name: Instaliraj Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      # Korak 3: Cache Python packages (da bude brže)
      - name: Cache pip packages
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-

      # Korak 4: Instaliraj dependencies
      - name: Instaliraj dependencies
        working-directory: ./backend
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      # Korak 5: Proveri sintaksu (flake8)
      - name: Lint sa flake8 (opciono)
        working-directory: ./backend
        run: |
          pip install flake8
          # Stop build ako ima kritičnih grešaka
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          # Warning za ostale greške (neće stop-ovati build)
          flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
        continue-on-error: true  # Nastavi ako flake8 fail-uje

      # Korak 6: Proveri migracije
      - name: Proveri Django migracije
        working-directory: ./backend
        run: |
          python manage.py check
          python manage.py makemigrations --check --dry-run

      # Korak 7: Pokreni testove (ako ih imaš)
      - name: Pokreni testove
        working-directory: ./backend
        run: |
          python manage.py test
        continue-on-error: true  # Za sada nastavi čak i ako testova nema
```

### Objašnjenje ključnih delova:

#### 1. **`uses: actions/checkout@v3`**
- Ovo je **gotova akcija** (kao gotov paket)
- Preuzima tvoj kod sa GitHub-a u virtuelnu mašinu
- `@v3` = verzija 3 te akcije

#### 2. **`uses: actions/setup-python@v4`**
- Instalira Python na virtuelnoj mašini
- `with:` = parametri za tu akciju
- `python-version: '3.11'` = koja verzija Pythona

#### 3. **`uses: actions/cache@v3`**
- **Caching** = čuvanje downloaded packages
- Ubrzava workflow (ne mora svaki put da download-uje sve)
- `key:` = jedinstveni identifikator (menja se samo ako se requirements.txt promeni)

#### 4. **`working-directory: ./backend`**
- Sve komande se izvršavaju u `backend/` folderu

#### 5. **`continue-on-error: true`**
- Nastavi sa sledećim korakom čak i ako ovaj fail-uje
- Korisno za testove koji još nisu napisani

---

## 🎨 Frontend CI Workflow

### Šta je cilj?

Proveri da li frontend build-uje i da li testovi prolaze.

### Fajl: `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # Korak 1: Preuzmi kod
      - name: Checkout kod
        uses: actions/checkout@v3

      # Korak 2: Instaliraj Node.js
      - name: Instaliraj Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'  # Node verzija
          cache: 'npm'        # Automatski cache npm packages
          cache-dependency-path: frontend/package-lock.json

      # Korak 3: Instaliraj npm dependencies
      - name: Instaliraj dependencies
        working-directory: ./frontend
        run: npm ci  # 'npm ci' = brža verzija 'npm install' za CI/CD

      # Korak 4: Build React aplikaciju
      - name: Build aplikaciju
        working-directory: ./frontend
        run: npm run build

      # Korak 5: Pokreni testove (ako ih imaš)
      - name: Pokreni testove
        working-directory: ./frontend
        run: npm test -- --coverage --watchAll=false
        continue-on-error: true

      # Korak 6: Upload build artifakta (opciono)
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: frontend/build/
          retention-days: 7  # Čuvaj 7 dana
```

### Objašnjenje:

#### 1. **`npm ci` vs `npm install`**
- `npm ci` = **Clean Install**
- Brži, predvidiviji (koristi `package-lock.json`)
- Preporučeno za CI/CD

#### 2. **`npm test -- --coverage --watchAll=false`**
- `--coverage` = Generiši test coverage report
- `--watchAll=false` = Pokreni testove jednom i izađi (ne čekaj promene)

#### 3. **`actions/upload-artifact@v3`**
- **Artifact** = fajl/folder koji želiš da sačuvaš posle build-a
- Možeš kasnije da download-uješ sa GitHub-a
- `retention-days: 7` = Čuvaj 7 dana

---

## 🚀 Backend CD Workflow (Deploy na EC2)

### Šta je cilj?

Kada CI prođe, automatski deploy-uj backend na EC2 server.

### Fajl: `.github/workflows/backend-cd.yml`

```yaml
name: Backend CD (Deploy to EC2)

on:
  push:
    branches: [main]  # Samo na push na main branch
    paths:
      - 'backend/**'
      - '.github/workflows/backend-cd.yml'

  # Manual trigger (možeš ručno pokrenuti sa GitHub UI)
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # Korak 1: Checkout kod
      - name: Checkout kod
        uses: actions/checkout@v3

      # Korak 2: Deploy preko SSH
      - name: Deploy na EC2 preko SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}           # EC2 IP adresa
          username: ${{ secrets.EC2_USERNAME }}   # Ubuntu (obično)
          key: ${{ secrets.EC2_SSH_KEY }}         # Private SSH key
          script: |
            # Navigate to project directory
            cd ~/Freelancer-Command-Center

            # Pull latest code
            git pull origin main

            # Activate virtual environment
            cd backend
            source venv/bin/activate

            # Install/update dependencies
            pip install -r requirements-aws.txt

            # Run migrations
            export DJANGO_SETTINGS_MODULE=config.settings_production
            python manage.py migrate --noinput

            # Collect static files
            python manage.py collectstatic --noinput

            # Restart Gunicorn
            sudo systemctl restart gunicorn

            # Restart Nginx
            sudo systemctl restart nginx

            echo "✅ Backend deployment completed!"
```

### Objašnjenje:

#### 1. **`workflow_dispatch:`**
- Omogućava **ručno pokretanje** workflow-a
- Ideš na GitHub → Actions → Izabereš workflow → "Run workflow"

#### 2. **`uses: appleboy/ssh-action@master`**
- **Gotova akcija** za SSH konekciju
- Povezuje se na tvoj EC2 server
- Izvršava komande koje napišeš u `script:`

#### 3. **`${{ secrets.EC2_HOST }}`**
- **GitHub Secret** = sensitive podatak (IP, SSH key, itd.)
- GitHub enkriptuje i čuva sigurno
- Ne pojavljuje se u logovima

#### 4. **Komande u `script:`**
- Identične komandama koje si koristio ručno za deploy!
- `cd`, `git pull`, `pip install`, `migrate`, `restart`

---

## 🌐 Frontend CD Workflow (Deploy na S3)

### Šta je cilj?

Build-uj React aplikaciju i upload-uj na S3 bucket.

### Fajl: `.github/workflows/frontend-cd.yml`

```yaml
name: Frontend CD (Deploy to S3)

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-cd.yml'

  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # Korak 1: Checkout kod
      - name: Checkout kod
        uses: actions/checkout@v3

      # Korak 2: Instaliraj Node.js
      - name: Instaliraj Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      # Korak 3: Update API URL u kodu (production URL)
      - name: Update API URL
        working-directory: ./frontend/src
        run: |
          # Zameni API_URL sa production IP-om
          sed -i "s|http://localhost:8000/api|http://${{ secrets.EC2_HOST }}/api|g" api.ts

      # Korak 4: Instaliraj dependencies
      - name: Instaliraj dependencies
        working-directory: ./frontend
        run: npm ci

      # Korak 5: Build production verziju
      - name: Build aplikaciju
        working-directory: ./frontend
        run: npm run build

      # Korak 6: Deploy na S3
      - name: Deploy na S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --delete  # Obriši stare fajlove koji više ne postoje
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: 'eu-central-1'
          SOURCE_DIR: 'frontend/build'

      # Korak 7: Invalidate CloudFront cache (opciono)
      - name: Invalidate CloudFront
        if: secrets.CLOUDFRONT_DISTRIBUTION_ID != ''
        uses: chetan/invalidate-cloudfront-action@master
        env:
          DISTRIBUTION: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
          PATHS: '/*'
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        continue-on-error: true
```

### Objašnjenje:

#### 1. **`sed` komanda**
```bash
sed -i "s|stari_text|novi_text|g" fajl.ts
```
- **Stream Editor** - zamenjuje text u fajlu
- `-i` = in-place (menja direktno u fajlu)
- `s|old|new|g` = substitute
- `g` = global (sve instance, ne samo prva)

#### 2. **`uses: jakejarvis/s3-sync-action@master`**
- **Gotova akcija** za S3 upload
- `--delete` = obriši fajlove koji više ne postoje (clean upload)

#### 3. **`if: secrets.CLOUDFRONT_DISTRIBUTION_ID != ''`**
- Izvršava korak **SAMO** ako postoji CloudFront Distribution ID
- Koristi se za **conditional execution**

---

## 🔐 GitHub Secrets Setup

### Šta su GitHub Secrets?

**Analogija:** Kao sef u banci gde čuvaš novac. GitHub enkriptuje i čuva sensitive podatke.

**Zašto su bitni?**
- Nikad ne commit-uješ SSH keys, AWS keys, passwords direktno u kod!
- GitHub ih enkriptuje i ne prikazuje u logovima
- Samo tvoji workflow-i mogu da ih koriste

---

### Kako dodati Secrets?

#### Korak po korak:

1. **Idi na GitHub repository:**
   ```
   https://github.com/goky91/Freelancer-Command-Center
   ```

2. **Klikni na:**
   ```
   Settings (tab na vrhu) →
   Secrets and variables (levo) →
   Actions →
   New repository secret (zeleno dugme)
   ```

3. **Dodaj sledeće secrets:**

---

### Lista Secrets koja ti treba:

#### **Backend Deploy Secrets:**

| Secret Name | Vrednost | Gde ga naći? |
|------------|---------|-------------|
| `EC2_HOST` | `3.67.201.188` | Tvoja EC2 Public IP (ili Elastic IP) |
| `EC2_USERNAME` | `ubuntu` | SSH username (obično `ubuntu` za Ubuntu AMI) |
| `EC2_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Tvoj `.pem` fajl (ceo sadržaj!) |

**Kako dobiti EC2_SSH_KEY:**
```bash
# Na svom kompjuteru:
cat ~/.ssh/aws-keys/freelance-server-key.pem

# Kopiraj KOMPLETAN output (sa BEGIN i END linijama)
# Paste-uj u GitHub Secret
```

---

#### **Frontend Deploy Secrets:**

| Secret Name | Vrednost | Gde ga naći? |
|------------|---------|-------------|
| `AWS_S3_BUCKET` | `freelance-frontend-goran-bucket` | Ime tvog S3 bucket-a |
| `AWS_ACCESS_KEY_ID` | `AKIAIOSFODNN7EXAMPLE` | AWS IAM User Access Key |
| `AWS_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | AWS IAM User Secret Key |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1234ABCDEFGH` | (Opciono) CloudFront Distribution ID |

**Kako dobiti AWS Keys:**
```
AWS Console → IAM → Users → tvoj-user →
Security credentials → Create access key →
Choose: "Application running outside AWS" →
Kopiraj Access Key ID i Secret Access Key
```

---

### ⚠️ VAŽNO - Security Best Practices:

1. **Nikad ne commit-uj secrets u kod!**
   ```bash
   # ❌ LOŠE:
   AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"

   # ✅ DOBRO:
   AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY_ID')
   ```

2. **Kreiraj poseban IAM User samo za GitHub Actions**
   - Ne koristi root AWS account!
   - Daj mu samo potrebne permissions (S3 upload, ništa više)

3. **Rotate keys redovno** (menjaj svakih 90 dana)

4. **Enable MFA** (Multi-Factor Authentication) na AWS account-u

---

## 🧪 Testiranje Pipeline-a

### Kako testirati da sve radi?

#### **Test 1: Backend CI**

1. Napravi malu promenu u backend kodu:
   ```bash
   cd backend
   # Dodaj komentar u nekom fajlu
   echo "# CI/CD test" >> manage.py
   ```

2. Commit i push:
   ```bash
   git add .
   git commit -m "Test: Backend CI workflow"
   git push origin main
   ```

3. Idi na GitHub:
   ```
   Repository → Actions tab →
   Vidi "Backend CI" workflow koji radi (žuta tačka = in progress)
   ```

4. Klikni na workflow → Vidi korake kako se izvršavaju

5. **Očekivani rezultat:**
   - ✅ Zelena kvačica = Success!
   - ❌ Crveni X = Failed (pogledaj logove da vidiš grešku)

---

#### **Test 2: Frontend CI**

1. Napravi promenu u frontend kodu:
   ```bash
   cd frontend/src
   echo "// CI/CD test" >> App.tsx
   ```

2. Commit i push:
   ```bash
   git add .
   git commit -m "Test: Frontend CI workflow"
   git push origin main
   ```

3. Proveri na GitHub Actions tab

---

#### **Test 3: Backend CD (Deploy)**

1. Napravi meaningul promenu u backend-u:
   ```python
   # backend/config/settings_production.py
   # Dodaj komentar ili promeni nešto
   ```

2. Commit i push:
   ```bash
   git add .
   git commit -m "Test: Backend CD deployment"
   git push origin main
   ```

3. **Proveri:**
   - GitHub Actions → Backend CD workflow
   - SSH-uj se na EC2 i proveri:
     ```bash
     ssh -i ~/.ssh/aws-keys/freelance-server-key.pem ubuntu@3.67.201.188
     cd ~/Freelancer-Command-Center
     git log -1  # Vidi poslednji commit
     sudo systemctl status gunicorn  # Vidi da li je restartovan
     ```

---

#### **Test 4: Frontend CD (Deploy na S3)**

1. Napravi promenu u frontend-u:
   ```tsx
   // frontend/src/App.tsx
   // Dodaj neki tekst ili promeni component
   ```

2. Commit i push:
   ```bash
   git add .
   git commit -m "Test: Frontend CD deployment"
   git push origin main
   ```

3. **Proveri:**
   - GitHub Actions → Frontend CD workflow
   - Otvori frontend URL:
     ```
     http://freelance-frontend-goran-bucket.s3-website.eu-central-1.amazonaws.com
     ```
   - Vidi da li se promene vide

---

## 🐛 Troubleshooting - Česte Greške

### 1. **Error: "Permission denied (publickey)"**

**Problem:** GitHub Actions ne može da se SSH-uje na EC2.

**Rešenje:**
```bash
# Proveri da li je SSH key ispravan:
1. Idi na GitHub Secrets
2. Proveri EC2_SSH_KEY
3. Mora da sadrži:
   -----BEGIN RSA PRIVATE KEY-----
   (mnoogo linija teksta)
   -----END RSA PRIVATE KEY-----

# Proveri da li EC2 Security Group dozvoljava SSH:
AWS Console → EC2 → Security Groups →
Proveri da ima pravilo: SSH (port 22) from 0.0.0.0/0
```

---

### 2. **Error: "npm ERR! code ELIFECYCLE"**

**Problem:** Frontend build failed.

**Rešenje:**
```bash
# Lokalno proveri da li build radi:
cd frontend
npm install
npm run build

# Ako radi lokalno, ali ne na GitHub:
- Proveri Node verziju (GitHub uses Node 18, ti možda koristiš 16)
- Proveri da li imaš package-lock.json commit-ovan
```

---

### 3. **Error: "The process '/usr/bin/git' failed with exit code 128"**

**Problem:** Git pull failed na EC2.

**Rešenje:**
```bash
# SSH-uj se na EC2:
ssh -i ~/.ssh/aws-keys/freelance-server-key.pem ubuntu@3.67.201.188

# Proveri git status:
cd ~/Freelancer-Command-Center
git status

# Ako ima uncommitted changes:
git stash  # Sačuvaj lokalne promene
git pull origin main
git stash pop  # Vrati lokalne promene (ako treba)
```

---

### 4. **Error: "Access Denied" za S3**

**Problem:** AWS credentials nisu ispravni ili nemaju permissions.

**Rešenje:**
```bash
# 1. Proveri AWS credentials u GitHub Secrets
# 2. Proveri IAM User permissions u AWS Console:

AWS Console → IAM → Users → tvoj-user → Permissions →
Mora da ima: AmazonS3FullAccess (ili custom policy)

# 3. Test AWS credentials lokalno:
aws s3 ls s3://freelance-frontend-goran-bucket
```

---

### 5. **Workflow se ne pokreće**

**Problem:** Push-uješ kod, ali workflow ne radi.

**Rešenje:**
```yaml
# Proveri 'paths' filter u workflow fajlu:
on:
  push:
    paths:
      - 'backend/**'  # Da li je path ispravan?

# Ako push-uješ frontend, ali workflow traži backend promene:
# Workflow se NEĆE pokrenuti!

# Rešenje: Promeni 'paths' ili napravi promenu u ispravnom folderu
```

---

## 📊 GitHub Actions - Status Badges

Dodaj **badge** u README.md da vidiš status CI/CD-a:

```markdown
# Freelance Command Center

![Backend CI](https://github.com/goky91/Freelancer-Command-Center/workflows/Backend%20CI/badge.svg)
![Frontend CI](https://github.com/goky91/Freelancer-Command-Center/workflows/Frontend%20CI/badge.svg)

...
```

**Rezultat:**
- ✅ Zeleni badge = Sve radi
- ❌ Crveni badge = Nešto je broken

---

## 🎓 Šta si naučio?

### GitHub Actions Koncepti:
- ✅ Šta je CI/CD i zašto je bitan
- ✅ Kako funkcioniše GitHub Actions
- ✅ YAML sintaksa za workflow fajlove
- ✅ Jobs, Steps, Actions
- ✅ GitHub Secrets za sensitive podatke
- ✅ Caching za brže build-ove
- ✅ Conditional execution (`if:`)
- ✅ Manual triggers (`workflow_dispatch`)

### DevOps Skills:
- ✅ Automated testing
- ✅ Automated deployment
- ✅ SSH automation
- ✅ AWS S3 deployment
- ✅ Environment variables management
- ✅ Security best practices

---

## 🚀 Sledeći koraci - Advanced CI/CD

### 1. **Environments (Staging vs Production)**
```yaml
jobs:
  deploy-staging:
    environment: staging  # Deploy prvo na staging
    # ... deploy logic

  deploy-production:
    needs: deploy-staging  # Čeka da staging prođe
    environment: production  # Zatim deploy na production
    # ... deploy logic
```

### 2. **Matrix Builds** (Testiranje na više Python verzija)
```yaml
jobs:
  test:
    strategy:
      matrix:
        python-version: [3.9, 3.10, 3.11, 3.12]
    steps:
      - uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
```

### 3. **Slack/Discord Notifications**
```yaml
- name: Slack Notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 4. **Automated Rollback**
```yaml
- name: Health check
  run: curl -f http://3.67.201.188/health || exit 1

- name: Rollback on failure
  if: failure()
  run: |
    # Vrati na prethodni commit
    git reset --hard HEAD~1
    sudo systemctl restart gunicorn
```

---

## 📚 Dodatni resursi

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Awesome GitHub Actions](https://github.com/sdras/awesome-actions) - Lista gotovih akcija
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [YAML Tutorial](https://www.cloudbees.com/blog/yaml-tutorial-everything-you-need-get-started)

---

## 🎯 Checklist - Pre Go-Live

Pre nego što pustiš CI/CD u produkciju:

- [ ] Svi workflow fajlovi kreirani
- [ ] GitHub Secrets postavljeni
- [ ] Testirano lokalno (workflows syntax valid)
- [ ] Test push - CI workflow radi
- [ ] Test deployment - CD workflow radi
- [ ] Rollback plan spreman
- [ ] Monitoring setup (emails, Slack notifications)
- [ ] Documentation written (ovaj fajl!)
- [ ] Team je obučen kako da koristi CI/CD

---

**Kreirao:** Goran Spasojević
**Datum:** 2025-10-18
**Status:** 📚 Educational Guide - Ready to implement!

---

## 💡 Quick Reference

### Osnovne komande:

```bash
# Kreiraj workflow folder
mkdir -p .github/workflows

# Kreiraj workflow fajl
touch .github/workflows/backend-ci.yml

# Commit i push
git add .github/
git commit -m "Add CI/CD workflows"
git push origin main

# Proveri GitHub Actions
# Idi na: https://github.com/goky91/Freelancer-Command-Center/actions
```

### GitHub Secrets dodavanje:

```
GitHub Repo → Settings → Secrets and variables → Actions →
New repository secret →
Name: EC2_HOST
Value: 3.67.201.188
→ Add secret
```

---

**Srecan CI/CD! 🚀**
