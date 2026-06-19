<div align="center">

# AI Powered Student Study Planner

### A full-stack AI-driven academic management platform built with React.js & Spring Boot

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.6-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red.svg)](https://jwt.io/)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI%20GPT-412991.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Security Implementation](#security-implementation)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Overview

**AI Powered Student Study Planner** is a comprehensive, production-ready full-stack web application designed to help students maximize academic performance through intelligent study management.

The platform combines traditional study tools — tasks, goals, notes, timetables, and progress tracking — with AI-powered assistance to create a personalized learning experience. A full-featured admin panel enables platform management, analytics, user administration, and content moderation.

**This project demonstrates:**
- Full-stack REST API design with 120+ endpoints across 19 Spring Boot controllers
- JWT-based authentication with refresh token rotation and brute-force protection
- Role-Based Access Control (RBAC) with admin user impersonation
- Real-time AI integration via OpenAI GPT for chat assistance and syllabus analysis
- Complex relational database modeling across 19 MySQL tables
- Clean React 19 SPA with 24 pages, custom hooks, and context-based state management

---

## Key Features

### User Features — 16 Modules

<details>
<summary><strong>Authentication & Security</strong></summary>

- JWT login with access token (15 min) + refresh token (7 days, rotation on every use)
- BCrypt password hashing (strength 10)
- Brute-force protection: 5 failed attempts triggers 15-minute account lockout
- OTP-based password reset via Gmail SMTP (6-digit SecureRandom, 10 min expiry)
- Single-session enforcement: new login revokes all previous tokens
- Disabled account enforcement: admin-disabled users cannot log in

</details>

<details>
<summary><strong>Dashboard</strong></summary>

- At-a-glance stats: tasks today, overdue tasks, study hours this week, active goals
- Current and longest study streaks
- Weekly activity heatmap (contribution-style grid)
- Monthly task completion progress bar
- Today's timetable schedule rendered as cards

</details>

<details>
<summary><strong>Subjects Management</strong></summary>

- Full CRUD for academic subjects
- Upload syllabus PDF — Tesseract OCR extracts text, OpenAI analyzes the content
- View and delete uploaded syllabuses

</details>

<details>
<summary><strong>Task Management</strong></summary>

- Create, edit, delete tasks with title, description, due date, and priority
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Status lifecycle: PENDING → IN_PROGRESS → COMPLETED
- Filter by status, priority, subject, and due date
- Overdue task detection and highlighting
- Bulk delete all tasks

</details>

<details>
<summary><strong>Notes</strong></summary>

- Rich notes with title, content, and optional subject linkage
- Search notes by keyword
- Paginated note list

</details>

<details>
<summary><strong>Goals</strong></summary>

- Set academic goals with deadlines, priority levels, and descriptions
- Progress tracking: IN_PROGRESS, ACHIEVED, ABANDONED states
- Monthly completion statistics visible in profile

</details>

<details>
<summary><strong>Study Planner</strong></summary>

- AI-generated personalized study plans based on user preferences
- Plans saved to DB and retrievable on demand

</details>

<details>
<summary><strong>Timetable</strong></summary>

- Weekly timetable with day-of-week, start time, end time, and subject
- Visual grid view on dashboard showing today's sessions

</details>

<details>
<summary><strong>Progress Tracking</strong></summary>

- Log daily study sessions with hours spent per subject
- Visual analytics charts for progress history
- Streak auto-calculated from progress logs

</details>

<details>
<summary><strong>Pomodoro Timer</strong></summary>

- Configurable work and break durations
- Session history tracking in DB
- Focus session statistics and analytics

</details>

<details>
<summary><strong>Analytics</strong></summary>

- Personal performance score
- Task completion rate trends (weekly/monthly)
- Study hours breakdown by week
- Goal achievement statistics

</details>

<details>
<summary><strong>AI Assistant</strong></summary>

- Conversational AI powered by OpenAI GPT
- Study-context-aware responses
- Persistent chat history (paginated, clearable)
- Per-user rate limiting: 20 messages per minute via Bucket4j

</details>

<details>
<summary><strong>Notifications</strong></summary>

- Platform notifications with read/unread state
- Unread count badge in navigation
- Mark individual or all notifications as read
- Delete notifications

</details>

<details>
<summary><strong>Profile Management</strong></summary>

- Profile picture upload with magic-byte validation (JPEG/PNG only, 5MB limit)
- Bio, phone, and personal info editing
- Hero stats: tasks today, active goals, goals this month, study hours this week
- Account deletion with typed confirmation gate ("DELETE")

</details>

<details>
<summary><strong>Settings</strong></summary>

- Dark / light mode toggle (CSS variable-based theming)
- Password change with current password verification
- Account preferences

</details>

---

### Admin Features — 9 Modules

<details>
<summary><strong>Admin Dashboard</strong></summary>

- Platform-wide stats: total users, active users, disabled users, new registrations
- Notification delivery metrics (sent vs. read)

</details>

<details>
<summary><strong>User Management</strong></summary>

- Paginated user list with live search by name or email
- Create users, edit name/email, delete permanently
- Role management: toggle USER ↔ ADMIN
- Disable / enable user accounts
- Force password reset for any user

</details>

<details>
<summary><strong>User Impersonation</strong></summary>

- Admin can browse the entire platform as any user
- Session token stored in DB; admin tokens stashed in localStorage
- Auto-return to admin session on impersonation timeout
- Every impersonation event recorded in audit log

</details>

<details>
<summary><strong>Notification Broadcasting</strong></summary>

- Create platform notifications with title, message, and type
- Send to all users (global) or specific user IDs
- Delivery status tracking: delivered count and read count per notification

</details>

<details>
<summary><strong>Platform Analytics</strong></summary>

- 6 analytics modules: Users, Tasks, Subjects, Pomodoro, Notifications, Overview Dashboard
- All backed by real DB aggregation queries, no mock data

</details>

<details>
<summary><strong>Reports</strong></summary>

- Activity report generation with configurable date range
- CSV export with downloadable format

</details>

<details>
<summary><strong>Content Management</strong></summary>

- View all platform subjects, tasks, notes, and goals across all users
- Delete any content with admin override
- Content statistics dashboard

</details>

<details>
<summary><strong>System Settings</strong></summary>

- Key-value platform configuration stored in `system_settings` table
- Editable from admin panel with audit logging

</details>

<details>
<summary><strong>Audit Logs</strong></summary>

Every admin action is recorded:
`USER_CREATED` · `USER_DELETED` · `ROLE_CHANGED` · `PASSWORD_RESET` · `USER_DISABLED` · `USER_ENABLED` · `SETTINGS_UPDATED` · `ADMIN_IMPERSONATE` · `ADMIN_IMPERSONATE_EXIT`

</details>

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React.js | 19 | UI component framework |
| React Router | 7 | Client-side routing |
| Axios | latest | HTTP client with JWT interceptors |
| Recharts | latest | Analytics data visualization |
| React Toastify | latest | Toast notification system |
| React Icons | latest | Icon library |
| CSS Custom Properties | — | Dark/light theme system |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Core language (LTS) |
| Spring Boot | 3.3.6 | Application framework |
| Spring Security | 6 | Authentication & authorization |
| Spring Data JPA | latest | ORM abstraction layer |
| Hibernate | 6 | JPA implementation |
| JJWT | 0.12.6 | JWT generation & validation |
| Bucket4j | latest | In-memory rate limiting |
| Lombok | latest | Boilerplate reduction |
| SpringDoc OpenAPI | latest | Swagger UI & API docs |
| Maven | 3.8+ | Build & dependency management |

### Database

| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.0 | Primary relational database — 19 tables |

### AI & External Services

| Service | Purpose |
|---|---|
| OpenAI GPT API | AI chat assistant + syllabus content analysis |
| Tesseract OCR | PDF text extraction from uploaded syllabuses |
| Gmail SMTP | OTP email delivery for password reset |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│   React 19 SPA  ·  port 5173                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│   │Dashboard │ │  Tasks   │ │  Goals   │ │  AI Assistant    │   │
│   └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│         Axios HTTP Client · JWT Interceptor · Refresh Queue      │
└──────────────────────────┬───────────────────────────────────────┘
                           │  REST API  (JSON over HTTP)
┌──────────────────────────▼───────────────────────────────────────┐
│                      SECURITY LAYER                              │
│   Spring Security Filter Chain  ·  port 8080                    │
│   ┌───────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│   │   JwtFilter   │  │ RateLimitFilter  │  │   CORS Config    │  │
│   └───────────────┘  └─────────────────┘  └──────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                      CONTROLLER LAYER                            │
│  19 REST Controllers  ·  120+ Endpoints  ·  @PreAuthorize RBAC  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                       SERVICE LAYER                              │
│  AuthService · TaskService · GoalService · DashboardService      │
│  AdminService · AIService · AnalyticsService · NotifService      │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                     REPOSITORY LAYER                             │
│         Spring Data JPA Repositories  ·  JPQL Queries           │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                       DATABASE LAYER                             │
│                 MySQL 8.0  ·  19 Tables                          │
└──────────────────────────────────────────────────────────────────┘
                  │                         │
     ┌────────────▼──────────┐    ┌─────────▼──────────┐
     │     OpenAI GPT API    │    │    Gmail SMTP       │
     │  (AI Chat + Syllabus) │    │  (OTP Delivery)     │
     └───────────────────────┘    └────────────────────┘
```

### Request Lifecycle

```
Client Request
  → CORS validation
  → JWT extraction & signature verification
  → Rate limit check (Bucket4j)
  → Role authorization (@PreAuthorize)
  → Controller (input validation via @Valid)
  → Service (business logic)
  → Repository (JPA / JPQL)
  → MySQL
  → DTO mapping
  → JSON Response
```

---

## Screenshots

> Screenshots will be added after UI walkthrough recording.

| Page | Description |
|---|---|
| **Landing Page** | Product introduction with feature highlights |
| **Login / Register** | JWT-secured authentication forms |
| **Dashboard** | Stats, heatmap, streaks, and today's schedule |
| **Task Management** | Filterable task board with priority and status |
| **Subjects + Syllabus** | Subject cards with AI-powered syllabus upload |
| **AI Assistant** | GPT-powered study chatbot with history |
| **Admin Dashboard** | Platform-wide user and activity analytics |
| **User Management** | Admin table with search, role, disable, and delete |

---

## Project Structure

```
AI-Powered-Student-Study-Planner/
│
├── backend-repo/                          # Spring Boot Application
│   ├── src/
│   │   └── main/
│   │       ├── java/com/studyplanner/
│   │       │   ├── StudyPlannerApplication.java
│   │       │   ├── controller/            # 19 REST Controllers
│   │       │   ├── service/
│   │       │   │   └── impl/              # Business logic implementations
│   │       │   ├── repository/            # Spring Data JPA repositories
│   │       │   ├── entity/               # 19 JPA entities (DB tables)
│   │       │   ├── dto/
│   │       │   │   ├── request/           # API request body contracts
│   │       │   │   └── response/          # API response body contracts
│   │       │   ├── security/              # JwtFilter, JwtUtil, UserDetailsService
│   │       │   ├── config/                # SecurityConfig, CORS, DataInitializer
│   │       │   ├── enums/                 # Role, TaskStatus, Priority, GoalStatus
│   │       │   └── exception/             # GlobalExceptionHandler
│   │       └── resources/
│   │           ├── application.properties # Configuration (all secrets via env vars)
│   │           └── logback-spring.xml     # Logging configuration
│   ├── .env.example                       # Environment variable template
│   └── pom.xml                            # Maven dependencies
│
└── smart-study-planner/                   # React Frontend Application
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx                        # Root component + routes
    │   ├── pages/
    │   │   ├── auth/                      # Login, Register, ForgotPassword, ResetPassword
    │   │   ├── landing/                   # Public landing page
    │   │   ├── dashboard/                 # Main dashboard + widgets
    │   │   ├── tasks/                     # Task CRUD and filters
    │   │   ├── subjects/                  # Subject management + syllabus upload
    │   │   ├── goals/                     # Goal tracking
    │   │   ├── notes/                     # Notes management
    │   │   ├── planner/                   # AI study planner
    │   │   ├── timetable/                 # Weekly schedule
    │   │   ├── progress/                  # Study progress logs
    │   │   ├── pomodoro/                  # Focus timer
    │   │   ├── analytics/                 # Personal analytics charts
    │   │   ├── ai/                        # AI chat assistant
    │   │   ├── profile/                   # User profile + stats
    │   │   ├── notifications/             # Platform notifications
    │   │   ├── settings/                  # App settings
    │   │   └── admin/                     # Admin panel (9 modules)
    │   │       ├── AdminDashboard.jsx
    │   │       ├── UserManagement.jsx
    │   │       ├── Analytics.jsx
    │   │       ├── NotificationManagement.jsx
    │   │       ├── ContentManagement.jsx
    │   │       ├── Reports.jsx
    │   │       └── SystemSettings.jsx
    │   ├── services/                      # Axios API service layer
    │   │   ├── api.js                     # Base Axios instance + interceptors
    │   │   ├── adminService.js
    │   │   ├── taskService.js
    │   │   └── ...
    │   ├── context/                       # React Context providers
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── components/                    # Reusable UI components
    │   ├── hooks/                         # Custom React hooks
    │   ├── utils/                         # Helper utilities (storage.js, etc.)
    │   └── styles/                        # Global CSS variables and themes
    ├── .env.example                       # Environment variable template
    └── package.json
```

### Backend Package Responsibilities

| Package | Responsibility |
|---|---|
| `controller` | HTTP endpoint definitions, request parsing, `@Valid` input validation |
| `service/impl` | Business logic, orchestration between repositories, error enforcement |
| `repository` | Database access via Spring Data JPA; custom JPQL queries with `@Query` |
| `entity` | JPA-mapped DB tables; relationship mappings (`@ManyToOne`, `@OneToMany`) |
| `dto/request` | Inbound API contracts — decouples request shape from entity structure |
| `dto/response` | Outbound API contracts — controls what data is exposed to clients |
| `security` | `JwtFilter` (per-request token auth), `JwtUtil` (sign/verify), `UserDetailsService` |
| `config` | `SecurityConfig` (filter chain, CORS, public paths), `DataInitializer` (admin seed) |
| `enums` | Type-safe constants: `Role`, `TaskStatus`, `Priority`, `GoalStatus` |
| `exception` | `GlobalExceptionHandler` — maps all exceptions to consistent HTTP responses |

---

## Security Implementation

### JWT Authentication Flow

```
POST /api/v1/auth/login
  → Validate email + password (BCrypt)
  → Check brute-force lock (5 attempts → 15 min lockout)
  → Check account status (isActive, isDisabled)
  → Revoke all previous tokens (single-session)
  → Issue access token (15 min) + refresh token (7 days)
  → Store refresh token hash in DB

Every Authenticated Request:
  → JwtFilter: extract Bearer token from Authorization header
  → Verify HMAC-SHA256 signature + check expiry
  → Load user from DB via email claim
  → Set SecurityContext → controller proceeds

Token Refresh (POST /api/v1/auth/refresh-token):
  → Validate refresh token from DB
  → Revoke old refresh token
  → Issue new access + refresh token pair (rotation)
```

### Security Features

| Feature | Implementation Detail |
|---|---|
| Password hashing | BCryptPasswordEncoder (cost factor 10) |
| JWT signing | HMAC-SHA256, 256-bit secret via env var |
| Brute-force protection | 5 failed attempts → 15-minute lockout, auto-unlock after window |
| Refresh token rotation | Previous token revoked on every use — no replay possible |
| Account disable enforcement | Admin-set `isDisabled` flag blocks login and new token issuance |
| Rate limiting | Bucket4j in-memory: login 5/min · register 5/hr · AI chat 20/min per user |
| Role-based access | `@PreAuthorize("hasRole('ADMIN')")` on every admin endpoint |
| Cross-user isolation | JWT email claim used for ownership — never trusts request body user ID |
| Profile image validation | Magic-byte check: JPEG `0xFF 0xD8 0xFF` · PNG `0x89 0x50 0x4E 0x47` |
| CORS | Controlled via `CORS_ALLOWED_ORIGINS` environment variable |

---

## Database Design

### Entity Relationships

```
User (1) ──────────────────────────────────────────────── (*) Entities
  │
  ├── Task              — user_id FK (ON DELETE CASCADE)
  ├── Subject           — user_id FK (ON DELETE CASCADE)
  ├── Note              — user_id FK (ON DELETE CASCADE)
  ├── Goal              — user_id FK (ON DELETE CASCADE)
  ├── ProgressLog       — user_id FK (ON DELETE CASCADE)
  ├── PomodoroSession   — user_id FK (ON DELETE CASCADE)
  ├── Timetable         — user_id FK (ON DELETE CASCADE)
  ├── StudyPlan         — user_id FK (ON DELETE CASCADE)
  ├── StudyStreak       — user_id FK (ON DELETE CASCADE)
  ├── RefreshToken      — user_id FK (ON DELETE CASCADE)
  ├── PasswordResetOtp  — user_id FK (ON DELETE CASCADE)
  ├── UserNotification  — user_id FK (manual delete before user removal)
  ├── ActivityLog       — user_id FK (manual delete before user removal)
  ├── AiUsageLog        — user_id FK (manual delete before user removal)
  ├── AdminSession      — impersonated_user FK (manual delete)
  └── Notification      — created_by FK (nullified before user removal)
```

### Core Entities

| Table | Key Columns | Notes |
|---|---|---|
| `users` | id, name, email, password_hash, role, is_active, is_disabled, failed_login_attempts, lock_time | Central entity — all others reference this |
| `tasks` | id, title, description, status, priority, due_date, subject_id, user_id | PENDING / IN_PROGRESS / COMPLETED |
| `subjects` | id, name, description, color, icon, user_id | Parent for tasks, notes, goals |
| `goals` | id, title, deadline, priority, status, user_id | IN_PROGRESS / ACHIEVED / ABANDONED |
| `notes` | id, title, content, subject_id, user_id | Plain text or rich content |
| `timetables` | id, day_of_week, start_time, end_time, subject_id, user_id | Weekly schedule slots |
| `study_plans` | id, plan_content, user_id, created_at | AI-generated plan text |
| `pomodoro_sessions` | id, work_minutes, break_minutes, completed_cycles, user_id | Focus session record |
| `notifications` | id, title, message, type, is_global, created_by | Platform-wide or targeted |
| `user_notifications` | id, notification_id, user_id, is_delivered, is_read | Per-user delivery state |
| `admin_actions` | id, action_type, details, status, admin_id, created_at | Admin audit trail |
| `refresh_tokens` | id, token (512), expiry, is_revoked, user_id | Refresh token store |
| `password_reset_otps` | id, otp, expiry, is_used, user_id | OTP for password reset |
| `study_streaks` | id, current_streak, longest_streak, last_activity_date, user_id | Gamification data |

---

## API Documentation

The full API is documented via **Swagger UI**.

After starting the backend, open:
```
http://localhost:8080/swagger-ui.html
```

### API Modules

| Module | Base Path | Auth |
|---|---|---|
| Authentication | `/api/v1/auth/**` | Public |
| Dashboard | `/api/v1/dashboard/**` | User JWT |
| Tasks | `/api/v1/tasks/**` | User JWT |
| Subjects | `/api/v1/subjects/**` | User JWT |
| Goals | `/api/v1/goals/**` | User JWT |
| Notes | `/api/v1/notes/**` | User JWT |
| Study Planner | `/api/v1/planner/**` | User JWT |
| Timetable | `/api/v1/timetable/**` | User JWT |
| Progress | `/api/v1/progress/**` | User JWT |
| Pomodoro | `/api/v1/pomodoro/**` | User JWT |
| AI Chat | `/api/v1/ai/**` | User JWT |
| Profile | `/api/v1/profile/**` | User JWT |
| Notifications | `/api/v1/notifications/**` | User JWT |
| Study Streak | `/api/v1/streak/**` | User JWT |
| Admin — All | `/api/v1/admin/**` | Admin JWT only |

### Authentication Header

```
Authorization: Bearer <access_token>
```

### Token Refresh

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{ "refreshToken": "<refresh_token>" }
```

---

## Setup & Installation

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Java JDK | 21+ | [Adoptium](https://adoptium.net/) recommended |
| Maven | 3.8+ | Or use included `./mvnw` wrapper |
| MySQL | 8.0+ | Create a database before starting |
| Node.js | 18+ | LTS version recommended |
| npm | 9+ | Comes with Node.js |
| Tesseract OCR | 5.x | Required for syllabus PDF analysis |

### 1. Clone the Repository

```bash
git clone https://github.com/Saifuddin-khan/AI-Powered-Student-Study-Planner.git
cd AI-Powered-Student-Study-Planner
```

### 2. Database Setup

```sql
-- Run in your MySQL client
CREATE DATABASE student_study_planner;
```

> All tables are auto-created by Hibernate on first startup (`ddl-auto=update`).

### 3. Backend Setup

```bash
cd backend-repo

# Copy environment template
cp .env.example .env

# Edit .env with your MySQL password, JWT secret, OpenAI key, etc.
notepad .env   # Windows
nano .env      # Linux/Mac

# Start the backend
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`.

**First launch:** The `DataInitializer` automatically creates the admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env` file.

### 4. Frontend Setup

```bash
cd smart-study-planner

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm start
```

The frontend starts on `http://localhost:5173`.

### Verify the Setup

| Check | URL |
|---|---|
| Backend health | `http://localhost:8080/actuator/health` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| Frontend app | `http://localhost:5173` |

---

## Environment Variables

### Backend — `backend-repo/.env`

| Variable | Required | Description |
|---|---|---|
| `DB_URL` | Yes | MySQL connection string |
| `DB_USERNAME` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `JWT_SECRET` | Yes | 256-bit secret for JWT signing |
| `MAIL_USERNAME` | No | Gmail address for OTP emails |
| `MAIL_PASSWORD` | No | Gmail App Password |
| `MAIL_ENABLED` | No | `true` to send emails; `false` logs OTP to console |
| `OPENAI_API_KEY` | No | OpenAI API key (AI features disabled if empty) |
| `ADMIN_EMAIL` | Yes | Admin account email (seeded on first launch) |
| `ADMIN_PASSWORD` | Yes | Admin account password |
| `ADMIN_NAME` | No | Admin display name (default: Admin) |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated frontend URLs |
| `APP_BASE_URL` | No | Backend base URL (default: `http://localhost:8080`) |
| `PORT` | No | Server port (default: `8080`) |
| `TESSERACT_DATAPATH` | No | Path to Tesseract tessdata folder |

### Frontend — `smart-study-planner/.env`

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | Yes | Backend API URL (e.g., `http://localhost:8080/api/v1`) |
| `REACT_APP_APP_NAME` | No | App display name |
| `PORT` | No | Dev server port (default: `5173`) |

---

## Future Improvements

- **Calendar Integration** — Sync tasks and goals with Google Calendar / Outlook
- **Mobile Application** — React Native companion app for iOS and Android
- **Collaborative Study** — Shared study rooms, group goals, and peer progress
- **Spaced Repetition** — AI-powered flashcard system with Leitner scheduling
- **PDF Report Export** — Real PDF generation with charts and progress summaries
- **Push Notifications** — Browser push notifications for approaching deadlines
- **Multi-language Support** — i18n for global student audiences
- **LMS Integration** — Connect with Moodle, Canvas, or Google Classroom
- **Offline Mode** — Service worker for offline task and note management
- **Redis Rate Limiting** — Replace in-memory Bucket4j with Redis for multi-instance deployment

---

## Author

**Saif** — Full Stack Java & React Developer

- GitHub: [Saifuddin-khan](https://github.com/Saifuddin-khan)
- Email: saifuddinkhan1407@gmail.com

---

<div align="center">

**If you found this project useful, please consider giving it a star.**

Built with Java · Spring Boot · React · MySQL · OpenAI

</div>
