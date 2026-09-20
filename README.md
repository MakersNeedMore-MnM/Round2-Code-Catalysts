# 🚨 RescueGrid AI

> **AI-Powered Disaster Response & Emergency Management Platform**

RescueGrid AI is a full-stack, production-ready platform that enables real-time incident reporting, AI-driven intelligence extraction, dynamic priority scoring, live disaster mapping, and automated resource coordination — built for emergency responders and citizens alike.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Real-Time Events](#-real-time-events)
- [Database Schema](#-database-schema)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## 🌐 Overview

RescueGrid AI bridges the gap between citizens in distress and emergency response teams. Citizens can submit incident reports from any device, while command center operators get a full operational dashboard with live maps, resource tracking, AI-generated insights, and real-time alerts — all powered by intelligent backend services.

---

## ✨ Features

### 👤 Citizen Portal
- **Incident Reporting** — Submit reports with location, photos, severity, and description
- **Report Tracking** — Track the live status of submitted reports
- **Notifications** — Real-time push notifications for report updates
- **Profile Management** — Update personal info and preferences
- **Help & Safety Tips** — Contextual safety guides during emergencies

### 🖥️ Command Center (Admin)
- **Live Dashboard** — Real-time statistics: active incidents, resources deployed, alerts
- **Incident Management** — View, triage, escalate, and resolve incidents
- **Interactive Map** — Leaflet-based disaster map with incident pins and resource overlays
- **Resource Management** — Track ambulances, fire trucks, personnel, and equipment
- **Alerts System** — Create and broadcast emergency alerts by zone
- **Analytics** — Charts and trends using Recharts (incidents over time, type breakdown, response times)
- **Assignment Engine** — Assign responders and vehicles to incidents

### 🤖 AI Intelligence Layer
- **Auto-Triage** — AI scores incident priority (1–10) based on description, type, and location
- **Entity Extraction** — Pulls structured data (casualties, hazards, affected area) from free-text reports
- **Recommendations** — Suggests resources, actions, and response strategies per incident
- **Pluggable Providers** — Swap between mock rule-based AI (development) and OpenAI GPT (production)

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| React Router DOM v6 | Client-side routing |
| Leaflet + React-Leaflet | Interactive maps |
| Recharts | Data visualization |
| Socket.IO Client | Real-time WebSocket updates |
| Axios | HTTP client |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime & language |
| Express 4 | REST API framework |
| Prisma 5 ORM | Database access & migrations |
| PostgreSQL 15 | Relational database |
| Socket.IO 4 | Real-time bidirectional events |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| Multer | File / image uploads |
| Express Validator | Request validation |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker Compose | Local PostgreSQL database |
| dotenv | Environment configuration |

---

## 📁 Project Structure

```
rescuegrid-ai/
├── .env.example              # Environment variable template
├── .gitignore
├── docker-compose.yml        # PostgreSQL service
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts          # Express + Socket.IO server entry point
│       ├── ai/
│       │   ├── index.ts              # AI provider export
│       │   ├── aiProvider.ts         # Provider interface & factory
│       │   └── developmentProvider.ts # Rule-based mock AI engine
│       ├── middleware/
│       │   └── auth.ts               # JWT authentication middleware
│       ├── routes/
│       │   ├── auth.ts               # /api/auth
│       │   ├── reports.ts            # /api/reports
│       │   ├── incidents.ts          # /api/incidents
│       │   ├── resources.ts          # /api/resources
│       │   ├── alerts.ts             # /api/alerts
│       │   ├── assignments.ts        # /api/assignments
│       │   ├── dashboard.ts          # /api/dashboard
│       │   ├── ai.ts                 # /api/ai
│       │   └── notifications.ts      # /api/notifications
│       ├── sockets/
│       │   └── socketManager.ts      # Socket.IO event management
│       └── lib/
│           └── (shared utilities)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx              # React entry point
│       ├── App.tsx               # Router & layout setup
│       ├── index.css             # Global styles
│       ├── components/
│       │   ├── Layout.tsx            # Root layout wrapper
│       │   ├── Sidebar.tsx           # Admin navigation sidebar
│       │   ├── AdminLayout.tsx       # Admin portal layout
│       │   ├── CitizenLayout.tsx     # Citizen portal layout
│       │   ├── DisasterMap.tsx       # Leaflet map component
│       │   ├── IncidentDetail.tsx    # Incident detail panel
│       │   └── shared.tsx            # Reusable UI components
│       ├── pages/
│       │   ├── LoginPage.tsx         # Citizen login
│       │   ├── RegisterPage.tsx      # Citizen registration
│       │   ├── AdminLoginPage.tsx    # Admin login
│       │   ├── CitizenDashboardPage.tsx  # Citizen home
│       │   ├── ReportPage.tsx        # Submit incident report
│       │   ├── MyReportsPage.tsx     # View own reports
│       │   ├── ReportDetailPage.tsx  # Single report detail
│       │   ├── NotificationsPage.tsx # Alerts & updates
│       │   ├── ProfilePage.tsx       # User profile
│       │   ├── HelpSafetyPage.tsx    # Safety tips
│       │   ├── DashboardPage.tsx     # Admin command center
│       │   ├── IncidentsPage.tsx     # Admin incident list
│       │   ├── IncidentDetailPage.tsx # Admin incident detail + AI
│       │   ├── MapPage.tsx           # Live disaster map
│       │   ├── ResourcesPage.tsx     # Resource management
│       │   ├── AlertsPage.tsx        # Alert management
│       │   ├── AnalyticsPage.tsx     # Analytics & charts
│       │   └── SettingsPage.tsx      # System settings
│       ├── hooks/                # Custom React hooks
│       ├── services/             # API service layer (Axios)
│       ├── types/                # TypeScript type definitions
│       └── utils/                # Helper utilities
│
└── prisma/                   # Prisma schema & migrations
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CITIZEN BROWSER                      │
│              React + Vite (localhost:5173)               │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP/REST + WebSocket
┌────────────────────────▼────────────────────────────────┐
│              EXPRESS API SERVER (localhost:3001)          │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ │
│  │  /auth   │ │/reports  │ │/incidents │ │/resources │ │
│  └──────────┘ └──────────┘ └───────────┘ └───────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ │
│  │ /alerts  │ │   /ai    │ │/dashboard │ │  /notifs  │ │
│  └──────────┘ └──────────┘ └───────────┘ └───────────┘ │
│                                                          │
│  ┌─────────────────────┐   ┌──────────────────────────┐ │
│  │    AI Provider      │   │   Socket.IO Manager      │ │
│  │  (mock / OpenAI)    │   │  (real-time broadcasts)  │ │
│  └─────────────────────┘   └──────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │           Prisma ORM  →  PostgreSQL 15              ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- npm v9+

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/rescuegrid-ai.git
cd rescuegrid-ai
```

---

### 2. Start the Database

```bash
docker-compose up -d
```

This spins up a PostgreSQL 15 container at `localhost:5432`.

---

### 3. Configure Environment

```bash
cp .env.example backend/.env
```

Edit `backend/.env` with your values (see [Environment Variables](#-environment-variables)).

---

### 4. Install Backend Dependencies & Run Migrations

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed         # Optional: seed demo data
```

---

### 5. Start the Backend

```bash
npm run dev
```

Backend runs at **http://localhost:3001**

---

### 6. Install Frontend Dependencies & Start

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

### 7. Open in Browser

| Portal | URL |
|---|---|
| Citizen Portal | http://localhost:5173 |
| Admin Login | http://localhost:5173/admin/login |
| API Health Check | http://localhost:3001/api/health |

---

## 🔒 Environment Variables

All environment variables live in `backend/.env`. Use `.env.example` as the template:

```env
# Database
DATABASE_URL="postgresql://rescuegrid:rescuegrid_secret@localhost:5432/rescuegrid"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AI Provider
# Set to 'development' for rule-based mock AI
# Set to 'openai' to use real GPT models
AI_PROVIDER=development
OPENAI_API_KEY=

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=./uploads
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register citizen account | ❌ |
| POST | `/auth/login` | Citizen login → JWT | ❌ |
| POST | `/auth/admin/login` | Admin login → JWT | ❌ |
| GET | `/auth/me` | Get current user profile | ✅ |
| PUT | `/auth/me` | Update user profile | ✅ |

### Reports — `/api/reports`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/reports` | Submit new incident report | ✅ Citizen |
| GET | `/reports` | List all reports (admin) | ✅ Admin |
| GET | `/reports/my` | Get own reports | ✅ Citizen |
| GET | `/reports/:id` | Get single report | ✅ |
| PATCH | `/reports/:id/status` | Update report status | ✅ Admin |

### Incidents — `/api/incidents`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/incidents` | List all active incidents | ✅ Admin |
| GET | `/incidents/:id` | Get incident with AI analysis | ✅ Admin |
| PUT | `/incidents/:id` | Update incident | ✅ Admin |
| POST | `/incidents/:id/resolve` | Mark incident resolved | ✅ Admin |

### Resources — `/api/resources`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/resources` | List all resources | ✅ Admin |
| POST | `/resources` | Add new resource | ✅ Admin |
| PUT | `/resources/:id` | Update resource status | ✅ Admin |

### Alerts — `/api/alerts`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/alerts` | List all alerts | ✅ |
| POST | `/alerts` | Create & broadcast alert | ✅ Admin |
| DELETE | `/alerts/:id` | Remove alert | ✅ Admin |

### Assignments — `/api/assignments`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/assignments` | Assign resource to incident | ✅ Admin |
| GET | `/assignments/:incidentId` | Get assignments for incident | ✅ Admin |
| DELETE | `/assignments/:id` | Remove assignment | ✅ Admin |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/dashboard/stats` | Summary statistics | ✅ Admin |
| GET | `/dashboard/analytics` | Time-series analytics data | ✅ Admin |

### AI — `/api/ai`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/ai/analyze` | Analyze incident text → AI insights | ✅ Admin |
| POST | `/ai/recommend` | Get resource recommendations | ✅ Admin |

### Notifications — `/api/notifications`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/notifications` | Get user notifications | ✅ |
| PATCH | `/notifications/:id/read` | Mark notification read | ✅ |
| PATCH | `/notifications/read-all` | Mark all as read | ✅ |

---

## 🖥 Frontend Pages

### Citizen Role

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Citizen authentication |
| Register | `/register` | Create citizen account |
| Dashboard | `/citizen` | Home overview & quick actions |
| Report Incident | `/citizen/report` | Multi-step report submission form |
| My Reports | `/citizen/reports` | Track submitted reports |
| Report Detail | `/citizen/reports/:id` | Full report view with status |
| Notifications | `/citizen/notifications` | Real-time updates |
| Profile | `/citizen/profile` | Account settings |
| Help & Safety | `/citizen/help` | Emergency guides & tips |

### Admin Role

| Page | Route | Description |
|---|---|---|
| Admin Login | `/admin/login` | Admin authentication |
| Command Center | `/admin` | Live dashboard with KPIs |
| Incidents | `/admin/incidents` | Full incident management |
| Incident Detail | `/admin/incidents/:id` | Detail + AI analysis panel |
| Map | `/admin/map` | Leaflet disaster map |
| Resources | `/admin/resources` | Resource fleet management |
| Alerts | `/admin/alerts` | Broadcast emergency alerts |
| Analytics | `/admin/analytics` | Charts & response metrics |
| Settings | `/admin/settings` | Platform configuration |

---

## ⚡ Real-Time Events

RescueGrid uses **Socket.IO** to push live updates to connected clients.

| Event | Direction | Payload | Description |
|---|---|---|---|
| `incident:new` | Server → Client | `{ incident }` | New incident created |
| `incident:updated` | Server → Client | `{ incident }` | Incident status changed |
| `alert:broadcast` | Server → Client | `{ alert }` | New emergency alert |
| `report:status` | Server → Client | `{ reportId, status }` | Citizen report status update |
| `resource:updated` | Server → Client | `{ resource }` | Resource availability changed |

---

## 🗄 Database Schema

The Prisma schema covers the following models:

| Model | Description |
|---|---|
| `User` | Citizens and admins with role-based access |
| `Report` | Raw citizen incident submissions |
| `Incident` | Triaged emergency incidents (from reports) |
| `Resource` | Emergency assets (vehicles, personnel, equipment) |
| `Assignment` | Links between resources and incidents |
| `Alert` | Broadcast emergency alerts |
| `Notification` | Per-user notification records |
| `AiAnalysis` | Stored AI triage results per incident |

---

## 📜 Scripts

### Backend (`cd backend`)

```bash
npm run dev              # Start with hot-reload (nodemon + tsx)
npm run build            # Compile TypeScript → dist/
npm run start            # Run compiled production build

npx prisma migrate dev   # Run DB migrations
npx prisma db seed       # Seed demo data
npx prisma studio        # Visual database browser
npx prisma generate      # Regenerate Prisma client
```

### Frontend (`cd frontend`)

```bash
npm run dev              # Start Vite dev server (port 5173)
npm run build            # Build for production → dist/
npm run preview          # Preview production build locally
```

### Docker

```bash
docker-compose up -d     # Start PostgreSQL in background
docker-compose down      # Stop and remove containers
docker-compose down -v   # Stop and delete all data volumes
```

---

## 🤖 AI Provider

RescueGrid supports two AI modes controlled by the `AI_PROVIDER` environment variable:

### `development` (default)
A built-in, **rule-based mock AI engine** (`developmentProvider.ts`) that:
- Parses incident descriptions with keyword matching
- Assigns priority scores 1–10 based on severity keywords
- Extracts entities (casualties, hazards, location clues)
- Returns structured resource recommendations
- Requires **no API key** — works fully offline

### `openai`
Routes requests to the **OpenAI Chat Completions API** using structured prompts for:
- Advanced NLP-based triage
- Context-aware recommendations
- Nuanced severity classification

Set `AI_PROVIDER=openai` and provide your `OPENAI_API_KEY` to enable.

---

## 🔐 Authentication Flow

1. User registers or logs in → receives a **JWT token**
2. Token stored in `localStorage`
3. All protected API calls include `Authorization: Bearer <token>`
4. Backend `auth` middleware validates the JWT and attaches `req.user`
5. Role-based guards (`CITIZEN` / `ADMIN`) applied per route

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <strong>Built with ❤️ for first responders and communities in crisis.</strong>
</div>
