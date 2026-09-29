# 🏥 MediConnect — Doctor-Patient Appointment Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.5-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**MediConnect** is a modern, full-stack healthcare web application designed to streamline the scheduling and management of appointments between doctors and patients. Built with a responsive **React (Vite)** frontend and an **Express / MongoDB** backend, it provides role-specific dashboards, real-time slot management, medical document uploads, and secure authentication.

---

## 🌟 Key Features

### 🧑‍⚕️ Patient Portal
* **Doctor Discovery**: Search doctors by name and filter by medical specialization (Cardiologist, Neurologist, Dermatologist, Pediatrician, etc.).
* **Slot Booking**: View live available doctor slots and book consultations with custom visit reasons.
* **Double-Booking Prevention**: Automatically locks booked time slots to prevent scheduling conflicts.
* **Appointment Tracking**: Real-time status tracking across `PENDING`, `ACCEPTED`, `REJECTED`, and `COMPLETED`.
* **Medical Reports**: Upload and manage health records, lab reports, and prescriptions (PDF, JPG, PNG).
* **Patient Profile**: Update personal contact information, age, gender, and address.

### 🩺 Doctor Workstation
* **Schedule Management**: Create custom time slots and dates. Open slots can be deleted; booked slots are protected.
* **Appointment Decisioning**: Review incoming requests and **ACCEPT** or **REJECT** appointments in real time. (Rejecting an appointment automatically releases the slot).
* **Patient History**: Access appointment notes and attached medical reports.
* **Doctor Profile**: Edit credentials, experience years, consultation fees, and specializations.

### 🔐 Security & Architecture
* **Role-Based Access Control (RBAC)**: Distinct workflows and views for Patients and Doctors.
* **JWT Authentication**: Secure token-based session handling with bcrypt password hashing.
* **Serverless Ready**: Fully configured with `vercel.json` for serverless deployment on Vercel or cloud web services like Render/Railway.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Vanilla CSS (Modern Dark Mode / Glassmorphic UI) |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose ODM, Multer (File Handling), JWT, bcryptjs |
| **Database** | MongoDB (Local / MongoDB Atlas Cloud) |
| **Deployment** | Vercel (Configured with `@vercel/node`), Render, Railway |

---

## 📂 Project Structure

```text
doctor-patient-appointment-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & serverless caching
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & route protection
│   │   └── upload.js             # Multer storage engine & file validation
│   ├── models/
│   │   ├── Appointment.js        # Appointment data schema
│   │   ├── AvailableSlot.js      # Doctor availability schema
│   │   ├── Doctor.js             # Doctor profile schema
│   │   ├── MedicalReport.js      # Patient medical documents schema
│   │   ├── Patient.js            # Patient profile schema
│   │   └── User.js               # User auth & role credentials
│   ├── routes/
│   │   ├── appointment.routes.js # Appointment booking & workflow routes
│   │   ├── auth.routes.js        # Registration, login & profile verification
│   │   ├── doctor.routes.js      # Doctor directory & slot creation
│   │   ├── patient.routes.js     # Patient profile operations
│   │   ├── profile.routes.js     # Unified profile update routes
│   │   ├── report.routes.js      # Medical document upload & fetch
│   │   └── slot.routes.js        # Slot deletion & management
│   ├── seed.js                   # Starter database seeder (doctors & demo users)
│   ├── server.js                 # Express server & route registration
│   ├── vercel.json               # Serverless deployment configuration
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js            # Axios client with JWT interceptor & API methods
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top navigation header
│   │   │   └── Sidebar.jsx       # Portal navigation sidebar
│   │   ├── pages/
│   │   │   ├── Auth.jsx          # Dual login & registration portal
│   │   │   ├── Doctor.jsx        # Doctor workstation & schedule dashboard
│   │   │   ├── Landing.jsx       # Public landing page & features showcase
│   │   │   └── Patient.jsx       # Patient booking & medical record portal
│   │   ├── App.jsx               # Root router & application state
│   │   ├── index.css             # Design tokens, themes & layout styles
│   │   └── main.jsx              # React DOM entrypoint
│   ├── index.html
│   ├── preview.html              # Standalone interactive demonstration
│   ├── vite.config.js            # Vite configuration (port 3000)
│   └── package.json
│
└── .gitignore                    # Root gitignore (prevents uploading node_modules & .env)
```

---

## 🚦 Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.
* [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/ktiwariabhishek2233-stack/doctor-patient-appointment-system.git
cd doctor-patient-appointment-system
```

---

### Step 2: Set Up Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `backend/` folder (use `.env.example` as reference):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/mediconnect
   MONGODB_URI=mongodb://127.0.0.1:27017/mediconnect
   JWT_SECRET=your_jwt_secret_key_here
   CLIENT_ORIGIN=http://localhost:3000
   ```

4. *(Optional)* Seed initial sample doctors and appointments:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *Backend will run on [http://localhost:5000](http://localhost:5000)*

---

### Step 3: Set Up Frontend

1. Open a new terminal tab and navigate to `frontend`:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *Frontend will launch automatically at [http://localhost:3000](http://localhost:3000)*

---

## 🌐 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new Patient or Doctor | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Get authenticated user profile | Bearer Token |
| `GET` | `/api/doctors` | List all doctors with their slots | No |
| `GET` | `/api/doctors/:id` | Get detailed doctor profile | No |
| `POST` | `/api/doctors/:id/slots` | Add new appointment slot | No |
| `DELETE` | `/api/slots/:id` | Delete an available slot | No |
| `POST` | `/api/appointments` | Book appointment & lock slot | No |
| `GET` | `/api/appointments` | Get appointments (filter by email/doctor) | No |
| `PATCH` | `/api/appointments/:id` | Update status (`ACCEPTED`, `REJECTED`) | No |
| `POST` | `/api/reports` | Upload medical report file | No |
| `GET` | `/api/reports` | Get patient medical reports | No |
| `GET` | `/api/patients/:id` | Get patient details | No |
| `PUT` | `/api/patients/:id` | Update patient profile | No |

---

## ☁️ Deployment Guide

### Deploying Backend to Vercel
1. Set up your cloud MongoDB database on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Deploy directly from the `backend/` directory:
   ```bash
   cd backend
   npx vercel
   ```
3. Set environment variables on Vercel:
   * `MONGODB_URI`: Your MongoDB Atlas connection URI
   * `JWT_SECRET`: Your secure JWT secret

### Deploying Backend to Render / Railway
* **Root Directory**: `backend`
* **Build Command**: `npm install`
* **Start Command**: `node server.js`
* **Environment Variables**: Add `MONGODB_URI` and `JWT_SECRET`

### Deploying Frontend to Vercel / Netlify
* **Root Directory**: `frontend`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variable**: `VITE_API_URL=https://your-deployed-backend.com/api`

---

## 📝 Demo Credentials (After Seeding)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Doctor** | `sarah.connor@hospital.com` | `password123` |
| **Doctor** | `rajesh.patel@hospital.com` | `password123` |
| **Patient** | `alex.morgan@example.com` | `password123` |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
