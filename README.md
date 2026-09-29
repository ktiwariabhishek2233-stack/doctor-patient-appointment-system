# 🏥 MediConnect — Doctor-Patient Appointment Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Fallback%20Ready-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**MediConnect** is an enterprise-grade, full-stack healthcare platform engineered for appointment scheduling, doctor availability management, and secure medical document handling. Powered by a **React (Vite)** frontend and an **Express.js** backend integrated with **Supabase PostgreSQL** and cloud storage (with automatic MongoDB fallback for local development).

---

## 🌟 Key Features

### 🧑‍⚕️ Patient Portal
* **Doctor Directory**: Search doctors by name and filter by medical specializations (Cardiology, Neurology, Pediatrics, Dermatology, Orthopedics).
* **Real-Time Booking**: View live available doctor slots and book consultations with visit reasons.
* **Double-Booking Engine**: Enforces strict database-level partial unique constraints and transactional slot locking so no two patients can claim the same slot.
* **Status Lifecycle**: Track appointment progression through `PENDING` ➔ `ACCEPTED` / `REJECTED` ➔ `COMPLETED`.
* **Private Medical Reports**: Upload health records (PDF, JPG, PNG) stored in private cloud storage and viewed exclusively via expiring 24-hour **signed URLs**.
* **Profile Management**: Maintain personal contact info, age, gender, and address.

### 🩺 Doctor Workstation
* **Schedule Management**: Add custom date/time slots. Open slots can be deleted; booked slots are protected against accidental removal.
* **Appointment Review Workflow**: Review incoming appointment requests and **ACCEPT** or **REJECT** in real time. (Rejecting an appointment automatically releases the slot back to `Available`).
* **Medical Record Access**: Securely view patient consultation notes and attached diagnostic reports.
* **Doctor Profile**: Update credentials, qualifications, experience, and consultation details.

### 🔐 Security Architecture
* **Dual Database Architecture**: Native **Supabase PostgreSQL** with auto-fallback to local **MongoDB** if cloud credentials are unset.
* **Bcrypt Password Security**: Passwords are cryptographically salted and hashed. Plaintext passwords or hashes are never returned by any API endpoint.
* **Stateless JWT Authentication**: Secure bearer token sessions with centralized role guards (`Doctor` & `Patient`).
* **HIPAA/Privacy-First Document Storage**: Medical reports are kept in a **private bucket** (`public = false`) protected by Row Level Security (RLS) and accessible only through backend-issued signed URLs.
* **Serverless Ready**: Fully configured with `vercel.json` for edge/serverless deployment on Vercel or persistent hosting on Render/Railway.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Vanilla CSS (Glassmorphism & Dark UI) |
| **Backend** | Node.js (ES Modules), Express.js, `@supabase/supabase-js`, Mongoose, Multer, JWT, bcryptjs |
| **Primary Database** | **Supabase PostgreSQL** (Relational, ACID, RLS, Indexes, Triggers) |
| **Cloud Storage** | **Supabase Storage** (Private `medical-reports` bucket with Signed URLs) |
| **Fallback Database**| MongoDB / Mongoose (Local development) |
| **Deployment** | Vercel Serverless, Render Web Services, Railway |

---

## 📂 Project Structure

```text
doctor-patient-appointment-system/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB fallback connection
│   │   └── supabase.js           # Supabase client (Service Role initialization)
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & Supabase/Mongo user lookup
│   │   └── upload.js             # Multer storage engine & MIME validator
│   ├── models/                   # Mongoose schemas (Fallback layer)
│   │   ├── Appointment.js
│   │   ├── AvailableSlot.js
│   │   ├── Doctor.js
│   │   ├── MedicalReport.js
│   │   ├── Patient.js
│   │   └── User.js
│   ├── routes/                   # Unified API routes (Supabase + Mongo adapter)
│   │   ├── appointment.routes.js
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── patient.routes.js
│   │   ├── profile.routes.js
│   │   ├── report.routes.js
│   │   └── slot.routes.js
│   ├── services/
│   │   └── supabaseDb.js         # Dedicated Supabase PostgreSQL query service
│   ├── seed_supabase.js          # PostgreSQL database seeder
│   ├── seed.js                   # MongoDB database seeder
│   ├── server.js                 # Express server & dual-adapter initialization
│   ├── supabase_schema.sql       # Hardened PostgreSQL schema & migration script
│   ├── vercel.json               # Serverless deployment configuration
│   ├── .env.example              # Documented environment variables template
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js            # Axios client with JWT interceptor & API methods
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation header
│   │   │   └── Sidebar.jsx       # Portal sidebar
│   │   ├── pages/
│   │   │   ├── Auth.jsx          # Login & registration portal
│   │   │   ├── Doctor.jsx        # Doctor workstation & schedule manager
│   │   │   ├── Landing.jsx       # Public landing page
│   │   │   └── Patient.jsx       # Patient booking & medical report portal
│   │   ├── App.jsx               # Client-side router & global state
│   │   ├── index.css             # Glassmorphic dark design system
│   │   └── main.jsx              # React DOM entrypoint
│   ├── index.html
│   ├── preview.html              # Standalone demonstration page
│   ├── vite.config.js            # Vite configuration (port 3000)
│   └── package.json
│
├── .gitignore                    # Root gitignore (protects secrets & node_modules)
└── README.md
```

---

## 🗄️ Supabase Database Architecture

The system uses 7 hardened relational tables defined in [`backend/supabase_schema.sql`](backend/supabase_schema.sql):

```
              ┌───────────────┐
              │     users     │
              │───────────────│
              │ id (PK, UUID) │
              │ email (UQ)    │
              │ password      │
              │ role          │
              └───────┬───────┘
                      │ 1:1
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│     doctors     │       │    patients     │
│─────────────────│       │─────────────────│
│ id (PK, UUID)   │       │ id (PK, UUID)   │
│ user_id (FK)    │       │ user_id (FK)    │
│ name, email(UQ) │       │ name, email(UQ) │
│ specialization  │       │ age, gender     │
│ qualification   │       │ phone, address  │
└────────┬────────┘       └────────┬────────┘
         │ 1:N                     │ 1:N
         ├──────────────┐          │
         ▼              ▼          ▼
┌─────────────────┐   ┌───────────────────────┐       ┌───────────────────┐
│ available_slots │   │     appointments      │       │  medical_reports  │
│─────────────────│   │───────────────────────│       │───────────────────│
│ id (PK, UUID)   │   │ id (PK, UUID)         │       │ id (PK, UUID)     │
│ doctor_id (FK)  │   │ doctor_id (FK)        │       │ patient_id (FK)   │
│ time, date      │   │ patient_id (FK)       │       │ file_name         │
│ status          │   │ patient_email         │       │ file_url          │
└─────────────────┘   │ status (PENDING, etc) │       │ file_type         │
                      └───────────────────────┘       └───────────────────┘
```

### Double-Booking Prevention (PostgreSQL Partial Unique Index)
```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_doctor_appointment 
ON appointments(doctor_id, date, time) 
WHERE status IN ('PENDING', 'ACCEPTED');
```

---

## 🚦 Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [Git](https://git-scm.com/)
* A free [Supabase](https://supabase.com/) project (or local MongoDB for fallback)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/ktiwariabhishek2233-stack/doctor-patient-appointment-system.git
cd doctor-patient-appointment-system
```

---

### Step 2: Set Up Supabase Database

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and navigate to **SQL Editor**.
2. Copy the entire contents of [`backend/supabase_schema.sql`](backend/supabase_schema.sql), paste into the SQL Editor, and click **Run**.
3. Go to **Storage** ➔ Click **New bucket** ➔ Name it **`medical-reports`** ➔ Leave **Public bucket** unchecked (**Private**).

---

### Step 3: Configure Backend Environment

Create a `.env` file in `backend/` (refer to `backend/.env.example`):

```env
PORT=5000

# Supabase Credentials (Found in Project Settings -> API)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key

# JWT & CORS
JWT_SECRET=mediconnect_super_secret_jwt_key_2026_secure
CLIENT_ORIGIN=http://localhost:3000

# Optional MongoDB Fallback
MONGODB_URI=mongodb://127.0.0.1:27017/mediconnect
```

---

### Step 4: Seed Initial Data & Start Backend

```bash
cd backend
npm install

# Seed starter doctors, slots, and demo accounts into Supabase:
npm run seed:supabase

# Start development server:
npm run dev
# (or: npm start)
```
*Backend API will run on **[http://localhost:5000](http://localhost:5000)***.

---

### Step 5: Start Frontend

In a second terminal:
```bash
cd frontend
npm install
npm run dev
# (or: npm start)
```
*Frontend will launch automatically at **[http://localhost:3000](http://localhost:3000)***.

---

## 🌐 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new Patient or Doctor profile | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch active user profile from token | Bearer Token |
| `GET` | `/api/doctors` | List all doctors with their available slots | No |
| `GET` | `/api/doctors/:id` | Get specific doctor details & slots | No |
| `POST` | `/api/doctors/:id/slots` | Add new appointment time slot | No |
| `PUT` | `/api/doctors/:id` | Update doctor profile details | No |
| `DELETE` | `/api/slots/:id` | Delete open slot (blocked if booked) | No |
| `POST` | `/api/appointments` | Book appointment & lock slot atomically | No |
| `GET` | `/api/appointments` | Query appointments (`patientEmail`, `doctorId`) | No |
| `PATCH` | `/api/appointments/:id` | Update status (`ACCEPTED`, `REJECTED`, etc.) | No |
| `POST` | `/api/reports` | Upload report file (streams to Supabase Storage) | No |
| `GET` | `/api/reports` | Get reports with active 24h signed URLs | No |
| `GET` | `/api/patients/:id` | Get patient details | No |
| `PUT` | `/api/patients/:id` | Update patient profile | No |

---

## ☁️ Deployment Guide

### Deploying Backend to Vercel
1. Run from the `backend/` folder:
   ```bash
   cd backend
   npx vercel
   ```
2. Configure Environment Variables in Vercel:
   * `SUPABASE_URL`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `JWT_SECRET`

### Deploying Backend to Render / Railway
* **Root Directory**: `backend`
* **Build Command**: `npm install`
* **Start Command**: `node server.js`
* **Environment Variables**: Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `JWT_SECRET`.

### Deploying Frontend to Vercel / Netlify
* **Root Directory**: `frontend`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variable**: `VITE_API_URL=https://your-backend-url.com/api`

---

## 📝 Demo Credentials (After Seeding)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Doctor** | `sarah@mediconnect.org` | `password123` |
| **Doctor** | `marcus@mediconnect.org` | `password123` |
| **Doctor** | `elena@mediconnect.org` | `password123` |
| **Patient** | `alex@example.com` | `password123` |
| **Patient** | `robert@example.com` | `password123` |

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).
