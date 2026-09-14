# 🏢 Digital Visitor Management System (VMS)

A complete, modern, full-stack web application for corporate and office visitor reception, badge pass generation, security check-in/check-out, employee host directory, and administrative reporting.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/vijay-vsr/Digital-Visitor-Management-System)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vijay-vsr/Digital-Visitor-Management-System)

---

## 📌 Project Overview

The **Digital Visitor Management System** replaces outdated manual paper registers with an automated, secure digital experience:
- **Visitors** can register quickly via a modern self-service form or reception terminal, receiving an immediate **Digital Visitor Pass** equipped with a scannable QR badge.
- **Reception / Security Staff** can search visitor records, process single-click **Check-Ins**, monitor visitors **Currently Inside**, and record **Check-Out** departures in real time while preventing duplicate entries.
- **Administrators** have complete oversight through a dashboard featuring live KPI counters, visitor footfall analytics charts, staff account controls, host employee management, and one-click CSV export audits.

---

## 🛠️ Technology Stack

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend** | **React.js 18** + **Vite** | Blazing fast client-side SPA |
| **Styling** | **Tailwind CSS** | Professional corporate UI with custom print badge formatting |
| **Icons** | **Lucide React** | Consistent, modern vector iconography |
| **Charts** | **Recharts** | Interactive SVG Area, Bar, and Pie analytics |
| **Backend** | **Node.js** + **Express.js** | RESTful API server |
| **Database** | **SQLite** (`node:sqlite`) | Zero-configuration native SQL storage (no native build tools needed) |
| **Authentication** | **JWT** + **bcryptjs** | Role-based token auth and salted password hashing |
| **HTTP Client** | **Axios** | Request interceptors for Bearer token authorization |

---

## 👥 User Roles & Access Control

### 1. 🛡️ Administrator (`admin`)
- Full access to the executive Dashboard and KPI metrics.
- Complete visitor directory: view, search, filter, edit details, and delete records.
- Check-in and check-out management.
- Employee host directory management (Add, edit, delete employees).
- Security/Reception staff account creation and deletion.
- Visual analytics reports and one-click CSV export.
- Office organization profile configuration.

### 2. 👮 Reception / Security Staff (`security`)
- Front desk dashboard with today's visitor counts.
- Visitor registration with optional instant walk-in check-in.
- Search visitors by **Visitor ID**, name, or phone number.
- One-click Check-In with prevention of duplicate check-ins.
- Live Check-Out monitoring of visitors currently on premises with elapsed duration timers.
- Digital visitor pass badge preview and printing.

### 3. 👤 Visitor (Public Kiosk)
- Accessible without login at `/kiosk`.
- Self-service check-in with host employee selection.
- Immediate generation of printable official office visitor pass.

---

## 🔑 Demo Login Credentials

Pre-seeded accounts are immediately available on initial server launch:

| Role | Email | Password | Quick Action |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@office.com` | `admin123` | Click "Admin Login" demo button on login screen |
| **Reception / Security** | `security@office.com` | `security123` | Click "Security Login" demo button on login screen |

---

## 📁 Project Folder Structure

```
visitor-management-system/
│
├── client/                     # Frontend React + Vite Application
│   ├── public/                 # Favicons and static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── VisitorPass.jsx
│   │   ├── context/            # Global React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── layouts/            # Page layouts
│   │   │   ├── MainLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   ├── pages/              # Application views
│   │   │   ├── CheckInPage.jsx
│   │   │   ├── CheckOutPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── EmployeesPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── PublicKioskPage.jsx
│   │   │   ├── RegisterVisitor.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── VisitorsPage.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios client with JWT interceptor
│   │   ├── App.jsx             # Route definitions
│   │   ├── index.css           # Tailwind base styles & print formatting
│   │   └── main.jsx            # Application entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Node.js Express Application
│   ├── controllers/            # Controller logic
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── employeeController.js
│   │   ├── reportController.js
│   │   ├── userController.js
│   │   └── visitorController.js
│   ├── database/               # Database files & migrations
│   │   ├── db.js               # SQLite connection helper
│   │   ├── schema.sql          # Table definitions
│   │   └── seed.js             # Automatic seeder for demo data
│   ├── middleware/             # Auth & Error handling middlewares
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/                 # REST API endpoints
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── userRoutes.js
│   │   └── visitorRoutes.js
│   ├── utils/
│   │   └── visitorIdGenerator.js
│   ├── .env
│   ├── package.json
│   └── server.js               # Express application entry
│
├── package.json                # Root package for running client & server together
└── README.md
```

---

## 🗄️ Database Design (SQLite)

### Tables

1. **`users`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `name`: TEXT NOT NULL
   - `email`: TEXT UNIQUE NOT NULL
   - `password`: TEXT NOT NULL (bcrypt hash)
   - `role`: TEXT NOT NULL ('admin' | 'security')
   - `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

2. **`employees`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `name`: TEXT NOT NULL
   - `email`: TEXT UNIQUE NOT NULL
   - `phone`: TEXT NOT NULL
   - `department`: TEXT NOT NULL
   - `designation`: TEXT NOT NULL
   - `is_active`: INTEGER DEFAULT 1
   - `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

3. **`visitors`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `visitor_id`: TEXT UNIQUE NOT NULL (e.g. `VMS-20260914-8821`)
   - `full_name`: TEXT NOT NULL
   - `phone`: TEXT NOT NULL
   - `email`: TEXT
   - `company`: TEXT
   - `person_to_meet`: TEXT NOT NULL
   - `employee_id`: INTEGER (FOREIGN KEY $\to$ `employees(id)`)
   - `purpose`: TEXT NOT NULL
   - `number_of_visitors`: INTEGER DEFAULT 1
   - `id_proof_type`: TEXT
   - `id_proof_number`: TEXT
   - `visit_date`: DATE NOT NULL
   - `expected_arrival`: TEXT
   - `expected_departure`: TEXT
   - `check_in_time`: DATETIME
   - `check_out_time`: DATETIME
   - `status`: TEXT ('Expected' | 'Checked In' | 'Checked Out' | 'Cancelled')
   - `notes`: TEXT
   - `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

4. **`settings`**
   - `key`: TEXT PRIMARY KEY
   - `value`: TEXT NOT NULL

---

## 🚀 How to Run the Application in VS Code on Windows

### Prerequisites
- **Node.js** v20+ or v24 (installed on your computer)
- **npm** (comes bundled with Node.js)

---

### Method 1: Simultaneous Startup (Recommended)

1. Open a terminal in the root workspace folder:
   ```bash
   # Install dependencies for both server and client
   npm run install:all
   ```

2. Start both the Backend API and the Frontend Client with a single command:
   ```bash
   npm run dev
   ```

3. Open your web browser at:
   - **Frontend Application**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)

---

### Method 2: Running Server & Client in Separate Terminals

#### Terminal 1 (Backend Server):
```powershell
cd server
npm install
npm run dev
```
*(Runs backend on port `5000` with automatic SQLite initialization and data seeding).*

#### Terminal 2 (Frontend Client):
```powershell
cd client
npm install
npm run dev
```
*(Runs Vite development server on port `5173`).*

---

## 🌐 REST API Endpoints

### Authentication
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Get current logged-in user profile (Protected)

### Visitors
- `POST /api/visitors` — Register a visitor (Public / Staff)
- `GET /api/visitors` — Query visitors with search, filter, and pagination (Protected)
- `GET /api/visitors/inside` — Get all visitors currently checked in (Protected)
- `GET /api/visitors/:id` — Get visitor details by numeric ID or string Visitor ID
- `POST /api/visitors/:id/checkin` — Check in a visitor (records check-in time, prevents duplicate)
- `POST /api/visitors/:id/checkout` — Check out a visitor (records departure time)
- `PUT /api/visitors/:id` — Update visitor details (Protected)
- `DELETE /api/visitors/:id` — Delete visitor record (Admin only)

### Host Employees
- `GET /api/employees` — List all active host employees and departments
- `GET /api/employees/:id` — Get employee details (Protected)
- `POST /api/employees` — Add an employee (Admin only)
- `PUT /api/employees/:id` — Update an employee (Admin only)
- `DELETE /api/employees/:id` — Delete an employee (Admin only)

### Dashboard & Analytics
- `GET /api/dashboard/stats` — Summary KPIs, 7-day traffic chart, and recent visitor logs
- `GET /api/reports` — Comprehensive analytics, 14-day history, purpose & employee rankings
- `GET /api/reports/export/csv` — Stream/download full visitor audit report as CSV

### System Settings & Staff Accounts
- `GET /api/users` — List staff accounts (Admin only)
- `POST /api/users` — Create new security staff user (Admin only)
- `DELETE /api/users/:id` — Delete staff user (Admin only)
- `GET /api/users/settings` — Get office profile and badge instructions
- `PUT /api/users/settings` — Update office profile (Admin only)

---

## 🧪 Testing the Complete Workflow

1. **Sign In**:
   - Go to [http://localhost:5173/login](http://localhost:5173/login) and click **"Admin Login"** (or use `admin@office.com` / `admin123`).
2. **Dashboard Overview**:
   - View the active KPI cards (**Total Visitors Today**, **Currently Inside**, **Checked Out Today**, **Total Staff Members**), the **7-Day Visitor Traffic** chart, and the **Visit Purpose** pie chart.
3. **Visitor Registration**:
   - Navigate to **Register Visitor** (or visit `/register`).
   - Fill in visitor details (e.g. *Jonathan Vance*), pick a host from the dropdown (e.g. *Alex Morgan*), and submit.
   - A unique **Visitor ID** (`VMS-...`) and an official **Digital Visitor Pass** will appear.
   - Click **Print Pass** to test print layout preview.
4. **Security Check-In**:
   - Navigate to **Check-In** (or visit `/check-in`).
   - Search for the visitor by ID or select them from the **Expected Arrivals Today** queue.
   - Click **Check In**. The status updates to `Checked In` and the entry time is recorded.
   - Try clicking **Check In** again to verify that double check-in is properly prevented.
5. **Security Check-Out**:
   - Navigate to **Check-Out** (or visit `/check-out`).
   - View all visitors currently inside premises with live elapsed duration.
   - Click **Check Out Visitor** and confirm the departure.
6. **Visitor Management**:
   - Navigate to **All Visitors** (or visit `/visitors`).
   - Test search, status filter (`Expected`, `Checked In`, `Checked Out`), edit visitor info, or view badge pass.
7. **Reports & Audit**:
   - Navigate to **Reports** (or visit `/reports`).
   - View the 14-day footfall trend, top visited host employees, and purpose distributions.
   - Click **Export Full CSV Audit** to download the spreadsheet file.
8. **Kiosk Mode**:
   - Visit [http://localhost:5173/kiosk](http://localhost:5173/kiosk) in a guest tab to experience self-service touch registration.

---

## 📄 License
Academic and Demonstration Project for Office Management Systems.
