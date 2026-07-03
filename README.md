# MedWasla

**MedWasla** is a full-stack healthcare platform that connects patients with verified medical specialists across Egypt. Patients can discover doctors and nurses, join live clinic queues, manage appointments, and leave reviews. Specialists manage profiles, availability, and patient flow. Administrators verify and approve specialist registrations.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Database Seeding](#database-seeding)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Testing](#testing)
- [CI/CD](#cicd)
- [License](#license)

---

## Features

### Patients
- Register and verify account via OTP email
- Browse doctors and nurses by specialization and location
- View specialist profiles, ratings, and availability
- Join and track position in real-time clinic queues
- Manage profile and appointments (view, reschedule, cancel)
- Submit and update reviews for specialists

### Medical Specialists (Doctors & Nurses)
- Role-specific onboarding with license and certification upload
- Profile management: bio, clinic address, fees, and availability slots
- Dashboard with overview, schedule, requests, and profile tabs
- Queue management: advance to next patient and update status
- Admin verification workflow (pending → approved / rejected)

### Administrators
- Review pending specialist applications
- Approve or reject specialists and their certifications
- View all registered specialists

### Platform
- JWT-based authentication with role-based access control
- Email notifications (OTP, password reset)
- Cloudinary integration for profile and certificate images
- Responsive React UI with Tailwind CSS
- In-app chatbot support

---

## Tech Stack

| Layer      | Technologies |
|------------|--------------|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4, Lucide Icons, React Toastify |
| **Backend**  | Node.js, Express 5, TypeScript, Mongoose 9 |
| **Database** | MongoDB |
| **Auth**     | JWT, bcrypt |
| **Storage**  | Cloudinary |
| **Email**    | Nodemailer |
| **Testing**  | Vitest, Supertest, MongoDB Memory Server |
| **CI**       | GitHub Actions |

---

## Project Structure

```
med-wasla/
├── .github/
│   └── workflows/
│       └── backend-ci.yml          # Lint, typecheck, test, and build pipeline
│
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express app, CORS, routeErrorHandler
│   │   ├── server.ts               # Server entry point and DB connection
│   │   │
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB connection
│   │   │   ├── cloudinary.ts       # Cloudinary SDK configuration
│   │   │   └── seed.ts             # Database seed script (doctors, nurses, patients)
│   │   │
│   │   ├── features/               # Feature-based modules (routes → controller → service)
│   │   │   ├── auth/               # Registration, OTP, login, logout
│   │   │   ├── patient-profile/    # Patient profile CRUD
│   │   │   ├── medicalSpecialist/  # Specialist profiles, availability, fees, certificates
│   │   │   ├── queue/              # Live clinic queue (join, leave, next patient)
│   │   │   ├── reviews/            # Patient reviews for specialists
│   │   │   └── admin/              # Specialist approval workflow
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT protection and role restriction
│   │   │   ├── upload.middleware.ts# Multer file upload handling
│   │   │   └── errorHandler.middleware.ts
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.ts       # Base user (patient | specialist | admin)
│   │   │   ├── patient.model.ts    # Patient-specific fields
│   │   │   ├── medicalSpecialist.model.ts
│   │   │   ├── appointment.model.ts
│   │   │   ├── queue.model.ts
│   │   │   ├── review.model.ts
│   │   │   ├── otp.model.ts
│   │   │   └── reminder.model.ts
│   │   │
│   │   ├── interfaces/
│   │   │   └── auth.interface.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── AppError.ts
│   │   │   ├── generateOtp.ts
│   │   │   └── sendEmail.ts
│   │   │
│   │   └── tests/
│   │       ├── setup.ts
│   │       ├── auth.test.ts
│   │       ├── queue.test.ts
│   │       ├── reviews.test.ts
│   │       └── admin.test.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── eslint.config.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx                 # Route definitions
│   │   ├── main.tsx                # React entry point
│   │   ├── index.css               # Global styles (Tailwind)
│   │   │
│   │   ├── app/
│   │   │   ├── Layouts/
│   │   │   │   └── MainLayout.tsx  # Shared layout with navbar and footer
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── auth/           # SignIn, SignUp, VerifyOtp, Role, ForgotPassword
│   │   │   │   ├── patient/        # PatientProfile, PatientAppointments
│   │   │   │   ├── Doctor side/    # Specialist dashboard and tabs
│   │   │   │   ├── public/         # DoctorsPage, NursesPage, DoctorProfile, NurseProfile
│   │   │   │   ├── admin/          # AdminDashboard
│   │   │   │   ├── Services/       # Services listing page
│   │   │   │   ├── about/          # About page
│   │   │   │   ├── contact/        # Contact page
│   │   │   │   └── Home.tsx        # Landing page
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── auth/           # AuthLayout, RoleSelectCard
│   │   │   │   ├── booking/        # BookingModal, BookingSteps
│   │   │   │   ├── common/         # Navbar, Footer, Chatbot, AppToast
│   │   │   │   └── patient-appointments/  # Modals for cancel, reschedule, review
│   │   │   │
│   │   │   ├── context/
│   │   │   │   ├── AuthProvider.tsx
│   │   │   │   └── ChatBotProvider.tsx
│   │   │   │
│   │   │   └── figma/
│   │   │       └── ImageWithFallback.tsx
│   │   │
│   │   ├── services/
│   │   │   └── api.ts              # API client and token helpers
│   │   │
│   │   ├── constants/
│   │   │   └── medicalSpecializations.ts
│   │   │
│   │   └── utils/
│   │       ├── displayName.ts
│   │       ├── imageToDataUrl.ts
│   │       ├── specialistMapper.ts
│   │       └── toast.ts
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── eslint.config.js
│
├── LICENSE
└── README.md
```

---

## Prerequisites

Before running the project locally, ensure you have:

- **Node.js** 20 or later
- **npm** 9 or later
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A **Cloudinary** account (for image uploads)
- An **SMTP email** account (for OTP and notifications)

---

## Environment Variables

### Backend (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
# Server
PORT_NUMBER=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_CONNECTION_STRING=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medwasla

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> **Note:** Never commit `.env` files. They are excluded via `.gitignore`.

### Frontend

The API base URL is configured in `frontend/src/services/api.ts`:

```ts
export const API_BASE = "http://localhost:5000";
```

Update this value when deploying to production.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/med-wasla.git
cd med-wasla
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment

Copy the backend environment template above into `backend/.env` and fill in your credentials.

### 5. Start the backend

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:5000`.

### 6. Start the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Database Seeding

Populate the database with sample doctors, nurses, and patients:

```bash
cd backend

# Development (uses tsx, no build required)
npm run seed:dev

# Production-style (builds first, then runs compiled seed)
npm run seed
```

The seed script creates specialists across 12 medical specializations and 6 nurse categories, with sample availability slots and Egyptian governorate data.

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication — `/api/auth`

| Method | Endpoint        | Access   | Description              |
|--------|-----------------|----------|--------------------------|
| POST   | `/register`     | Public   | Register a new user      |
| POST   | `/verify-otp`   | Public   | Verify email with OTP    |
| POST   | `/resend-otp`   | Public   | Resend verification OTP  |
| POST   | `/login`        | Public   | Login and receive JWT    |
| POST   | `/logout`       | Public   | Logout                   |
| GET    | `/me`           | Private  | Get current user profile |

### Patient Profile — `/api/patient`

| Method | Endpoint              | Access  | Description           |
|--------|-----------------------|---------|-----------------------|
| GET    | `/profile/:userId`    | Public  | Get patient profile   |
| PATCH  | `/profile/:userId`    | Public  | Update patient profile|

### Specialists — `/api/specialists`

| Method | Endpoint                      | Access      | Description                    |
|--------|-------------------------------|-------------|--------------------------------|
| GET    | `/`                           | Public      | List all specialists           |
| GET    | `/specialization/:name`       | Public      | Filter by specialization       |
| GET    | `/:id`                        | Public      | Get specialist by ID           |
| GET    | `/me`                         | Specialist  | Get own specialist profile     |
| PUT    | `/profile`                    | Specialist  | Update profile                 |
| PUT    | `/availability`               | Specialist  | Update availability slots      |
| PUT    | `/fees`                       | Specialist  | Update consultation fees       |
| POST   | `/me/certificates`            | Specialist  | Upload a certificate           |

### Queue — `/api/queue`

| Method | Endpoint           | Access      | Description                  |
|--------|--------------------|-------------|------------------------------|
| POST   | `/join`            | Patient     | Join a specialist's queue    |
| GET    | `/my-position`     | Patient     | Get current queue position   |
| DELETE | `/leave`           | Patient     | Leave the queue              |
| GET    | `/:specialistId`   | Public      | View specialist queue        |
| PATCH  | `/next`            | Specialist  | Advance to next patient      |
| PATCH  | `/status`          | Specialist  | Update queue status          |

### Reviews — `/api/reviews`

| Method | Endpoint              | Access           | Description              |
|--------|-----------------------|------------------|--------------------------|
| POST   | `/`                   | Patient          | Create a review          |
| GET    | `/specialist/:id`     | Public           | Get specialist reviews   |
| PUT    | `/:id`                | Patient          | Update a review          |
| DELETE | `/:id`                | Patient / Admin  | Delete a review          |

### Admin — `/api/admin`

| Method | Endpoint                        | Access | Description                    |
|--------|---------------------------------|--------|--------------------------------|
| GET    | `/specialists/pending`          | Admin  | List pending specialists       |
| GET    | `/specialists`                  | Admin  | List all specialists           |
| PATCH  | `/specialists/:id/approve`      | Admin  | Approve a specialist           |
| PATCH  | `/specialists/:id/reject`       | Admin  | Reject a specialist            |

---

## User Roles

| Role          | Description |
|---------------|-------------|
| **patient**   | Can browse specialists, join queues, manage appointments, and write reviews |
| **specialist**| Doctors and nurses who manage profiles, availability, and patient queues |
| **admin**     | Verifies specialist registrations and moderates the platform |

Authentication uses Bearer tokens. Include the JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Testing

### Backend

```bash
cd backend

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Lint
npm run lint

# Type check
npm run typecheck
```

Backend tests use Vitest with an in-memory MongoDB instance and cover authentication, queue operations, reviews, and admin workflows.

### Frontend

```bash
cd frontend

npm test      # Run Vitest tests
npm run lint  # ESLint
npm run build # TypeScript compile + Vite production build
```

---

## CI/CD

GitHub Actions runs on every push and pull request that touches `backend/`:

- **Workflow:** `.github/workflows/backend-ci.yml`
- **Steps:** Type check → ESLint → Tests → Build
- **Node version:** 20
- **Trigger paths:** `backend/**`

---

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Aya Abdellatif
