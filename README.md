# TaskFlow — Full-Stack Project Management System

## Project Overview
This repository contains a full-stack Project Management System built as a two-day technical assessment. The platform enables users to manage their daily workflows by tracking projects and their associated tasks through an intuitive dashboard. It provides seamless cross-platform synchronization between a robust Web interface and a dedicated Mobile application, all powered by a single unified RESTful API.

## Key Features
- **User Authentication**: Secure JWT-based registration and login system with encrypted password storage.
- **Projects Management**: Create, view, edit, and delete projects. Assign start/end dates and status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).
- **Tasks Management**: Manage granular tasks under specific projects. Track priority (`LOW`, `MEDIUM`, `HIGH`) and deadlines.
- **Dashboard Analytics**: Real-time aggregated statistics displaying total projects, active projects, total tasks, and completion metrics.
- **Advanced Search & Filter**: Rapidly query projects and tasks by text search, status, and priority.
- **Cross-Platform Synchronization**: Instant data parity between the React Web app and React Native Mobile app.
- **Strict Data Isolation**: Multi-tenant architecture ensuring users can strictly only access and modify their own projects and tasks.

---

## Architecture & Technology Stack
The application is built in a modern **Monorepo** structure (`apps/api`, `apps/web`, `apps/mobile`) utilizing the following technologies:

### Backend (REST API)
- **Runtime**: Node.js
- **Framework**: Express.js (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Security**: bcrypt (password hashing), jsonwebtoken (auth), Helmet, express-rate-limit

### Web Client
- **Framework**: React 18 (TypeScript)
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State/API**: Axios, React Hooks
- **Styling**: Vanilla CSS with modern aesthetics

### Mobile Client
- **Framework**: React Native (TypeScript)
- **Toolchain**: Expo
- **Routing**: React Navigation (Bottom Tabs & Native Stack)
- **Token Storage**: `expo-secure-store`
- **Build**: EAS (Expo Application Services)

---

## Database ER Diagram (Prisma Schema)

```mermaid
erDiagram
    User {
        UUID id PK
        String full_name
        String email
        String password_hash
        DateTime created_at
        DateTime updated_at
    }
    Project {
        UUID id PK
        UUID user_id FK
        String name
        String description
        String status
        Date start_date
        Date end_date
        DateTime created_at
        DateTime updated_at
    }
    Task {
        UUID id PK
        UUID project_id FK
        String name
        String description
        String priority
        String status
        Date due_date
        DateTime created_at
        DateTime updated_at
    }
    
    User ||--o{ Project : "owns (ON DELETE CASCADE)"
    Project ||--o{ Task : "contains (ON DELETE CASCADE)"
```

---

## Production Deployment Information

The platform is fully deployed to production and can be accessed without running the local codebase.

- **Production Web URL**: [https://web-gilt-psi-84.vercel.app](https://web-gilt-psi-84.vercel.app)
- **Production API URL**: [https://pms-api-production-bad8.up.railway.app](https://pms-api-production-bad8.up.railway.app)
- **Android APK**: [Download Production APK](https://expo.dev/artifacts/eas/XAyrrvTTToFxC-WHW57-5oDg4a_QmufQx1fjTzTgUd4.apk) (Natively targets the Production API).

---

## Local Setup & Development

### 1. Prerequisites
- Node.js (>= 20)
- PostgreSQL running locally (e.g., on `localhost:5432`)
- Expo Go app on your phone (or Android Studio Emulator)

### 2. Environment Variables
Create `.env` files in their respective app directories based on the provided `.env.example` files.

**`apps/api/.env`:**
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/pms?schema=public"
JWT_SECRET="your_secure_random_jwt_secret"
JWT_EXPIRES_IN="24h"
CORS_ORIGIN="http://localhost:5173"
```

**`apps/web/.env`:**
```env
VITE_API_URL="http://localhost:3000/api"
```

### 3. PostgreSQL & Prisma Setup
Navigate to the API folder and run migrations to generate tables:
```bash
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Running the Applications (Simultaneously)

**Terminal 1 (Backend API):**
```bash
cd apps/api
npm run dev
# API running at http://localhost:3000
```

**Terminal 2 (Web Client):**
```bash
cd apps/web
npm install
npm run dev
# Web running at http://localhost:5173
```

**Terminal 3 (Mobile App):**
```bash
cd apps/mobile
npm install
npm start
# Press 'a' to open on Android Emulator, or scan QR code with Expo Go.
# Note: For physical device testing, ensure EXPO_PUBLIC_API_URL points to your machine's local IP (e.g., http://192.168.1.X:3000/api) instead of localhost.
```

### 5. Android APK Installation
If you prefer testing the compiled app rather than Expo Go:
1. Download the `XAyrrvTTToFxC-WHW57-5oDg4a_QmufQx1fjTzTgUd4.apk` file to your Android device.
2. Ensure "Install Unknown Apps" is permitted in your Android settings.
3. Tap the APK to install.
4. The APK natively points to the Railway production API, meaning you can interact with the live Vercel web client simultaneously.

---

## API Summary & Security Features

### Endpoints Overview
Detailed OpenAPI/Swagger definitions are located at `apps/api/openapi.yaml`.
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Dashboard**: `GET /api/dashboard`
- **Projects**: `GET /api/projects`, `POST /api/projects`, `GET /api/projects/:id`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`
- **Tasks**: `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/:id`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`

### Authentication & Data Isolation
- All protected routes mandate a valid Bearer JWT.
- Tokens are stored locally on the web (`localStorage`) and securely in native keystores on mobile (`expo-secure-store`).
- **Data Isolation**: The `userId` is extracted strictly from the validated JWT token middleware. It is never trusted if passed by the client. Projects are directly linked to the `userId`, and Tasks are validated against their parent Project's ownership to prevent lateral data leakage (Insecure Direct Object References).

---

## Testing & Verification Status

The system was rigorously tested end-to-end (E2E) on the production architecture. 

| Feature / Verification Scope | Status |
| :--- | :--- |
| Web Registration / Login | **PASS** |
| Web Project/Task CRUD Operations | **PASS** |
| Web Dashboard Live Metrics | **PASS** |
| Web Search / Filters | **PASS** |
| Logout & Auth Middleware Enforcement | **PASS** |
| Mobile Device E2E (Synchronization, Network behavior) | **NOT EXECUTED — USER DEVICE REQUIRED** |

*Note: As this validation was performed by an automated remote agent, tests strictly requiring a physical Android device (such as pull-to-refresh hardware interaction and physical network toggling) are marked as pending manual user validation.*
