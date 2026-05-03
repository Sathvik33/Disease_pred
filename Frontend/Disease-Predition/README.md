<div align="center">

# 🌿 PlantDoc — Frontend

**React 19 · TypeScript · Vite 8 · Custom CSS Design System · Nginx**

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](#)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](#)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#-live-demo)
- [Pages & Routes](#-pages--routes)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Design System](#-design-system)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Production Build](#-production-build)
- [Docker Deployment](#-docker-deployment)
- [Vercel Deployment](#-vercel-deployment)
- [Environment Variables](#-environment-variables)

---

## Overview

The PlantDoc frontend is a **dark-themed, responsive TypeScript React SPA** that provides the full user-facing experience — from authentication through image capture to rendering the AI-generated treatment advisory.

In production, it is compiled by Vite into optimized static assets and served by **Nginx**, which also acts as a **reverse proxy** routing all API calls internally to the backend container — meaning **no CORS headers are needed** and the backend port is never publicly exposed.

### Key Design Decisions

- **Zero CSS frameworks**: All styles are hand-crafted using CSS custom properties — no Tailwind, no MUI, no Bootstrap
- **No build-time env vars**: API calls use relative paths (`/api/...`), routed by Nginx proxy in production
- **Server-side JWT validation**: Every protected page load calls `GET /api/me` — no trust in localStorage alone
- **Progressive error handling**: GPS errors, camera errors, API errors — all with user-friendly messages

---

## 🌐 Live Demo

**[https://disease-pred-eight.vercel.app](https://disease-pred-eight.vercel.app)**

> [!NOTE]
> The Vercel deployment uses `VITE_API_URL` to connect directly to the backend API. The Docker/Nginx deployment uses internal reverse proxying instead.

---

## 📄 Pages & Routes

| Route | Component | Auth Required | Description |
|---|---|---|---|
| `/login` | `Auth.tsx` | ❌ | Register / Login with mode toggle |
| `/` | `Dashboard.tsx` | ✅ | Main diagnosis — upload, camera, GPS, results |
| `/history` | `History.tsx` | ✅ | Past diagnoses list with advisory detail modal |
| `/profile` | `Profile.tsx` | ✅ | Account details + sign out |

### Route Protection

All routes under `/` are wrapped in `ProtectedRoute`, which:

1. Checks `localStorage` for a token
2. Calls `GET /api/me` to validate the token server-side
3. Shows a loading spinner during validation
4. Redirects to `/login` if the token is missing, expired, or invalid

This is **not just client-side gating** — the JWT is verified against the backend on every page load.

---

## ✨ Features

### Dashboard — Diagnosis Interface

| Feature | Implementation |
|---|---|
| **Drag-and-drop upload** | `onDrop` + `onDragOver` handlers on the upload zone |
| **File picker** | Hidden `<input type="file" accept="image/*">` triggered by click |
| **Live camera capture** | `navigator.mediaDevices.getUserMedia` with back-facing preference |
| **Camera snapshot** | `<canvas>` drawImage from video → `toBlob` → JPEG at 0.9 quality |
| **GPS geolocation** | `navigator.geolocation.getCurrentPosition` with 10s timeout |
| **GPS error handling** | Granular messages for PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT |
| **Manual coordinates** | Latitude/longitude input fields with placeholders |
| **Loading state** | Spinner + "AI agent is analyzing..." + estimated wait time (15-30s) |
| **Non-plant rejection** | Detects `is_plant: false` and shows user-friendly error |
| **Result display** | Disease name, confidence percentage, severity badge |
| **Advisory rendering** | Markdown → HTML conversion (headings, bold, lists) |
| **Tab switching** | Upload Image / Live Camera tabs with camera stop on switch |

### Authentication

| Feature | Implementation |
|---|---|
| **JWT storage** | `localStorage.setItem('token', ...)` after login/register |
| **Auto-redirect** | Axios 401 interceptor clears token + redirects to `/login` |
| **Mode toggle** | Login ↔ Register switch within the same component |
| **Error display** | API error messages shown in a styled error banner |

### History

| Feature | Implementation |
|---|---|
| **Diagnosis list** | Scrollable list with disease name, date, and confidence |
| **Detail modal** | Click any item → full advisory text in a backdrop-blurred modal |
| **Date formatting** | `en-IN` locale with day, month, year, hour, minute |
| **Empty state** | SVG icon + message when no diagnoses exist |

### Profile

| Feature | Implementation |
|---|---|
| **User details** | Name, email, UUID, member-since date |
| **Avatar** | First letter of name in a green circle |
| **Sign out** | Clears localStorage + redirects to `/login` |

---

## 🛠 Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2 | UI framework (React 19 with concurrent features) |
| `react-dom` | ^19.2 | DOM rendering |
| `react-router-dom` | ^7.14 | Client-side routing with nested layouts |
| `axios` | ^1.15 | HTTP client with request/response interceptors |
| `vite` | ^8.0 | Build tool and development server |
| `typescript` | ~6.0 | Type safety |
| `@vitejs/plugin-react` | ^6.0 | React Fast Refresh for Vite |

> [!TIP]
> **No UI framework dependency** — no Tailwind, no MUI, no Chakra. All styles are hand-crafted in `index.css` using CSS custom properties. This gives full control over the design with zero dependency bloat.

---

## 🎨 Design System

The entire visual identity is defined in `src/index.css` using CSS custom properties:

### Color Palette

```css
:root {
    /* ─── Backgrounds ───────────────────── */
    --bg:         #0f1117;    /* Page background (near-black) */
    --surface:    #1a1d27;    /* Cards, sidebar */
    --surface-2:  #222633;    /* Input backgrounds, hover states */
    --border:     #2a2e3b;    /* Borders, dividers */

    /* ─── Text ──────────────────────────── */
    --text:       #e4e6ed;    /* Primary text (off-white) */
    --text-dim:   #8b8fa3;    /* Secondary text, labels */

    /* ─── Accent Colors ─────────────────── */
    --green:      #34d399;    /* Primary accent (emerald) */
    --green-dim:  rgba(52, 211, 153, 0.12);
    --amber:      #fbbf24;    /* Disease detected badge */
    --amber-dim:  rgba(251, 191, 36, 0.12);
    --red:        #f87171;    /* Error states, sign out */
    --red-dim:    rgba(248, 113, 113, 0.12);
    --blue:       #60a5fa;    /* Info states */
    --blue-dim:   rgba(96, 165, 250, 0.12);

    /* ─── Layout Tokens ─────────────────── */
    --radius:     12px;
    --radius-sm:  8px;
    --radius-lg:  16px;
    --shadow:     0 4px 24px rgba(0, 0, 0, 0.25);
    --transition: 200ms ease;
}
```

### Typography

- **Font**: Inter (Google Fonts) — weights 300, 400, 500, 600, 700
- **Fallback**: `-apple-system, sans-serif`
- **Base size**: `15px`
- **Anti-aliasing**: `-webkit-font-smoothing: antialiased`

### Component Library

The CSS includes styled components for:

| Component | Class | Description |
|---|---|---|
| Sidebar | `.sidebar`, `.sidebar-brand`, `.sidebar-nav` | Fixed left navigation with brand + links |
| Navigation | `.nav-link`, `.nav-link.active` | Green-highlighted active state |
| Cards | `.card`, `.card-title` | Surface-colored containers with borders |
| Buttons | `.btn-primary`, `.btn-secondary`, `.btn-ghost` | Green, surface, and transparent variants |
| Badges | `.badge-green`, `.badge-amber`, `.badge-red`, `.badge-blue` | Status indicators |
| Forms | `.input-field`, `.input-group` | Styled inputs with focus glow |
| Tabs | `.tab`, `.tab.active` | Bottom-border active indicator |
| Upload | `.upload-zone`, `.preview-img` | Dashed border drop zone |
| Spinner | `.spinner` | CSS-only loading animation |
| Modal | `.detail-modal`, `.detail-content` | Backdrop-blurred overlay |
| Auth | `.auth-page`, `.auth-card`, `.auth-form` | Centered card layout |

### Responsive Design

```css
@media (max-width: 768px) {
    .sidebar { display: none; }
    .main { margin-left: 0; padding: 20px 16px; }
    .input-row { grid-template-columns: 1fr; }
}
```

On mobile, the sidebar is hidden and the main content takes full width.

---

## 📂 Project Structure

```
Frontend/Disease-Predition/
├── src/
│   ├── pages/
│   │   ├── Auth.tsx              # Login / Register with mode toggle
│   │   ├── Dashboard.tsx         # Core diagnosis UI (~290 LOC)
│   │   │                         #   ├── Image upload (drag/drop + file picker)
│   │   │                         #   ├── Live camera capture (getUserMedia)
│   │   │                         #   ├── GPS geolocation
│   │   │                         #   ├── Diagnosis submission
│   │   │                         #   ├── Result display (disease + confidence)
│   │   │                         #   └── Advisory rendering (markdown → HTML)
│   │   ├── History.tsx           # Prediction history + advisory modal
│   │   └── Profile.tsx           # User account details + sign out
│   ├── components/
│   │   └── Layout.tsx            # Sidebar navigation + user card + <Outlet/>
│   ├── api.ts                    # Axios instance, interceptors, all API functions
│   │                             #   ├── Request interceptor: attach JWT + ngrok header
│   │                             #   ├── Response interceptor: 401 → clear + redirect
│   │                             #   └── Exports: register, login, getMe, predict, diagnose, getHistory
│   ├── App.tsx                   # BrowserRouter + ProtectedRoute (server-side validation)
│   ├── index.css                 # Full design system — 725 lines, zero frameworks
│   └── main.tsx                  # React 19 createRoot entry point
├── public/                       # Static assets (favicon, etc.)
├── nginx.conf                    # Production Nginx config
│                                 #   ├── API proxy → http://backend:5000/api/
│                                 #   ├── gzip compression
│                                 #   ├── Security headers (X-Frame, XSS, etc.)
│                                 #   ├── Static asset caching (1 year, immutable)
│                                 #   └── SPA fallback (try_files → index.html)
├── .env.local                    # Local dev env vars
├── dockerfile                    # Multi-stage: Vite build → nginx:alpine
├── .dockerignore                 # Excludes node_modules, .env, etc.
├── vite.config.ts                # Dev server :3000 + proxy /api → :5000
├── vercel.json                   # SPA rewrite rules for Vercel
├── eslint.config.js              # ESLint config with React hooks rules
├── index.html                    # HTML entry with meta tags
├── tsconfig.json                 # TypeScript project references
├── tsconfig.app.json             # App-specific TS config
├── tsconfig.node.json            # Node-specific TS config (vite.config)
├── package.json
└── README.md                     # ← You are here
```

---

## 💻 Local Development

### Prerequisites

- **Node.js 20+** with npm
- **Backend running** on `localhost:5000`
- **DL-service running** on `localhost:8000`

### Setup

```bash
cd Frontend/Disease-Predition
npm install
npm run dev
# → http://localhost:3000
```

### How the Dev Proxy Works

The Vite dev server proxies all `/api/*` requests to `localhost:5000`:

```typescript
// vite.config.ts
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api': 'http://localhost:5000'
        }
    }
})
```

- **No CORS issues** — the browser sees all requests going to `localhost:3000`
- **No `VITE_API_URL` needed** — API calls use relative paths (`/api/...`)
- **Same behavior as production** — Nginx does the same proxying

### Available Scripts

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## 🏗 Production Build

### Build Process

```bash
npm run build
# → tsc -b (type check)
# → vite build (bundle + minify)
# → Output: /dist (static HTML, JS, CSS, assets)
```

### How Production Routing Works

```
Browser → https://your-domain.com
    │
    ├── /api/*  → Nginx proxies to http://backend:5000/api/
    │              (internal Docker network, never publicly exposed)
    │
    ├── /assets/*  → Served from /dist with 1-year cache
    │                (Cache-Control: public, immutable)
    │
    └── /*  → SPA fallback → /index.html
              (React Router handles client-side routing)
```

`VITE_API_URL` is intentionally **not set** at build time. All API calls use relative paths, and Nginx handles the routing internally.

---

## 🐳 Docker Deployment

### Build & Run

```bash
# Via compose (recommended — from repo root)
docker compose build frontend
docker compose up frontend -d

# Standalone
cd Frontend/Disease-Predition
docker build -t plantdoc-frontend:latest .
docker run -p 80:80 plantdoc-frontend:latest
```

### Multi-Stage Build

| Stage | Base | Purpose |
|---|---|---|
| `builder` | `node:20-alpine` | `npm ci` + `npm run build` → `/dist` |
| `runner` | `nginx:1.27-alpine` | Serve static files + reverse proxy |

**Estimated image size: ~25 MB**

### Nginx Configuration Highlights

```nginx
# API reverse proxy — backend never exposed publicly
location /api/ {
    proxy_pass         http://backend:5000/api/;
    proxy_read_timeout 120s;    # Agent calls can take 15-30 seconds
}

# Static assets — long-term immutable cache
location ~* \.(js|css|png|jpg|svg|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Security headers
add_header X-Frame-Options        "SAMEORIGIN"    always;
add_header X-Content-Type-Options "nosniff"       always;
add_header X-XSS-Protection       "1; mode=block" always;
add_header Referrer-Policy        "strict-origin-when-cross-origin" always;

# SPA fallback
location / {
    try_files $uri /index.html;
}
```

### Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1
```

---

## ▲ Vercel Deployment

The frontend is currently deployed on **Vercel** for edge CDN delivery:

### Configuration

**`vercel.json`:**
```json
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
    ]
}
```

This ensures all routes are handled by React Router (SPA fallback).

### Build Settings on Vercel

| Setting | Value |
|---|---|
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Root Directory** | `Frontend/Disease-Predition` |

### Environment Variables on Vercel

| Variable | Value |
|---|---|
| `VITE_API_URL` | `http://<backend-ip>:5000` |

> [!IMPORTANT]
> When deploying on Vercel (without Nginx proxy), `VITE_API_URL` must be set so the Axios client knows where to send API requests. This is only needed for Vercel — the Docker/Nginx deployment handles routing internally.

---

## 🔧 Environment Variables

| Variable | Local Dev | Docker/Nginx | Vercel |
|---|---|---|---|
| `VITE_API_URL` | **Not set** (proxy) | **Not set** (nginx proxy) | `http://<backend-ip>:5000` |

No other build-time environment variables are required.

---

<div align="center">

*Part of the [PlantDoc](../../README.md) platform · Built by [@Sathvik33](https://github.com/Sathvik33)*

</div>
