# Uputstvo za pokretanje Freelance Command Center

## Frontend je već pokrenut! ✅

Frontend se trenutno pokreće na: **http://localhost:3000**

---

## Backend - potrebna instalacija

Vaš sistem nema instaliran `pip` (Python package manager). Evo kako da pokrenete backend:

### Opcija 1: Instalacija pip-a (preporučeno)

```bash
# Ažurirajte sistem
sudo apt update

# Instalirajte pip za Python 3
sudo apt install python3-pip python3-venv -y

# Pređite u backend direktorijum
cd backend

# Kreirajte virtuelno okruženje
python3 -m venv venv

# Aktivirajte virtuelno okruženje
source venv/bin/activate

# Instalirajte zavisnosti
pip install -r requirements.txt

# Pokrenite migracije
python manage.py migrate

# Kreirajte admin korisnika
python manage.py createsuperuser

# Pokrenite backend server
python manage.py runserver
```

Backend će biti dostupan na: **http://localhost:8000**

### Opcija 2: Bez virtualnog okruženja

```bash
# Instalirajte pip
sudo apt update
sudo apt install python3-pip -y

# Pređite u backend direktorijum
cd backend

# Instalirajte zavisnosti globalno
pip3 install --user -r requirements.txt

# Pokrenite migracije
python3 manage.py migrate

# Kreirajte admin korisnika
python3 manage.py createsuperuser

# Pokrenite backend server
python3 manage.py runserver
```

---

## Brzo pokretanje (kada instalirate pip)

### Terminal 1 - Backend:
```bash
cd /home/spasojevici/DevProjects/freelance-command-center/backend
source venv/bin/activate  # ako koristite venv
python manage.py runserver
```

### Terminal 2 - Frontend:
```bash
cd /home/spasojevici/DevProjects/freelance-command-center/frontend
npm start
```

---

## Pristup aplikaciji

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin panel:** http://localhost:8000/admin

---

## Prvi koraci

1. Otvorite http://localhost:3000 u browseru
2. Registrujte se kao novi korisnik
3. Dodajte prvog klijenta
4. Unesite sate rada
5. Kreirajte fakturu i preuzmite PDF

---

## Napomena

Frontend se već kompajlira i biće dostupan za nekoliko trenutaka na http://localhost:3000
Nakon što instalirate pip i pokrenete backend, aplikacija će biti potpuno funkcionalna!
