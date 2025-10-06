# Freelance Command Center

Application for managing freelance work, clients, working hours, and invoices.

## Technologies

### Backend
- Python 3.x
- Django 5.0
- Django REST Framework
- JWT authentication
- ReportLab (PDF generation)
- SQLite database

### Frontend
- React 18
- TypeScript
- Bootstrap 5
- React Bootstrap
- React Router
- Axios

## Features

✅ **Authentication**
- User registration and login
- JWT token authentication
- Protected routes

✅ **Client Management**
- Add new clients
- Edit client information
- Delete clients
- Store information: name, company, email, address, Tax ID

✅ **Time Tracking**
- Track working hours by month
- Set hourly rate for each entry
- Automatic total amount calculation
- Filter by clients

✅ **Invoices**
- Create invoices based on time entries
- Generate professional PDF invoices
- Download PDF invoices
- Track status (Draft, Sent, Paid)
- Automatic total amount calculation

✅ **Dashboard**
- View statistics (number of clients, entries, invoices)
- Total revenue

## Installation and Setup

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
```

3. Activate the virtual environment:
```bash
# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser account (admin):
```bash
python manage.py createsuperuser
```

7. Run development server:
```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

**Admin panel:** `http://localhost:8000/admin`

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm start
```

Frontend will be available at: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns JWT token)
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Current user data

### Clients
- `GET /api/clients/` - List clients
- `POST /api/clients/` - Create new client
- `GET /api/clients/{id}/` - Client details
- `PUT /api/clients/{id}/` - Update client
- `DELETE /api/clients/{id}/` - Delete client

### Time Entries
- `GET /api/time-entries/` - List time entries
- `POST /api/time-entries/` - Create new entry
- `GET /api/time-entries/{id}/` - Entry details
- `PUT /api/time-entries/{id}/` - Update entry
- `DELETE /api/time-entries/{id}/` - Delete entry

### Invoices
- `GET /api/invoices/` - List invoices
- `POST /api/invoices/` - Create new invoice
- `GET /api/invoices/{id}/` - Invoice details
- `PUT /api/invoices/{id}/` - Update invoice
- `DELETE /api/invoices/{id}/` - Delete invoice
- `GET /api/invoices/{id}/download_pdf/` - Download PDF invoice
- `POST /api/invoices/{id}/mark_as_sent/` - Mark as sent
- `POST /api/invoices/{id}/mark_as_paid/` - Mark as paid

## Project Structure

```
freelance-command-center/
├── backend/
│   ├── config/              # Django configuration
│   │   ├── settings.py      # Project settings
│   │   ├── urls.py          # URL routing
│   │   └── wsgi.py
│   ├── core/                # Main application
│   │   ├── models.py        # Models (Client, TimeEntry, Invoice)
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # API views
│   │   ├── urls.py          # API endpoints
│   │   ├── admin.py         # Admin configuration
│   │   └── pdf_generator.py # PDF generation
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Navigation.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Clients.tsx
    │   │   ├── TimeEntries.tsx
    │   │   └── Invoices.tsx
    │   ├── api.ts           # API client (Axios)
    │   ├── types.ts         # TypeScript types
    │   ├── App.tsx          # Main component
    │   ├── index.tsx
    │   └── index.css
    ├── package.json
    └── tsconfig.json
```

## Using the Application

### 1. Registration and Login
- Open the application at `http://localhost:3000`
- Register or log in

### 2. Adding Clients
- Go to "Clients"
- Click "Add Client"
- Fill in the details (name, company, email, Tax ID, address)
- Save

### 3. Time Entry
- Go to "Time Entries"
- Click "Add Entry"
- Select client, month, year
- Enter number of hours and hourly rate
- Add work description (optional)
- Save

### 4. Creating Invoices
- Go to "Invoices"
- Click "Create Invoice"
- Select client
- Select time entry for that client
- Enter invoice number, dates, and status
- Save

### 5. Downloading PDF Invoice
- In the invoices list, click the "PDF" button
- Invoice will be downloaded as a PDF file

### 6. Tracking Invoice Status
- Change invoice status by clicking "Mark Sent" or "Mark Paid"
- Status is displayed in the invoices list

## Notes

- For production environment, change `SECRET_KEY` in Django settings
- Set `DEBUG = False` for production
- Recommended to use PostgreSQL or MySQL database instead of SQLite for production
- For frontend deployment, run `npm run build` and serve the `build` folder

## License

MIT
