<div align="center">

# 🌿 PlantDoc — Frontend

**React 19 · TypeScript · Vite · Nginx**

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](#)

</div>

---

## Overview

The PlantDoc frontend is a dark-themed, TypeScript React SPA that provides the full user-facing experience — from authentication through image capture to rendering the AI-generated treatment advisory. In production it is compiled by Vite and served by Nginx, which also acts as a reverse proxy routing all API calls to the backend container privately.

---

## Pages

| Route | Component | Description |
|---|---|---|
| `/login` | `Auth.tsx` | Register / Login with toggle, JWT stored in localStorage |
| `/` | `Dashboard.tsx` | Main diagnosis page — image upload, camera, GPS, results |
| `/history` | `History.tsx` | Paginated list of past diagnoses with advisory modal |
| `/profile` | `Profile.tsx` | Account details |

All routes under `/` are protected. On every page load, `ProtectedRoute` calls `GET /api/me` to validate the JWT server-side. If the token is expired or missing, the user is redirected to `/login`.

---

## Features

### Dashboard
- **Drag-and-drop upload** — click anywhere on the zone or drag a file in
- **Live camera capture** — accesses back-facing camera via `getUserMedia`, captures to JPEG
- **GPS location** — `navigator.geolocation` with full error handling:
  - Permission denied → actionable error message with browser settings guidance
  - Position unavailable → fallback message
  - Timeout (10s) → clear timeout message
  - Loading state with spinner while acquiring
- **Manual coordinates** — latitude/longitude inputs for when GPS is unavailable
- **Run Diagnosis** — sends image + coordinates to `/api/diagnose`, shows animated loading state with estimated wait time
- **AI Advisory rendering** — markdown-formatted advisory with emoji section headers rendered cleanly

### Auth
- JWT stored in `localStorage` after login
- 401 response interceptor in Axios — automatically clears token and redirects to `/login`
- Server-side validation on every protected route visit

---

## Tech Stack

| Package | Purpose |
|---|---|
| `react` ^19 | UI framework |
| `react-router-dom` ^7 | Client-side routing |
| `axios` ^1.15 | HTTP client with request/response interceptors |
| `vite` ^8 | Build tool and dev server |
| `typescript` ~6 | Type safety |

No UI framework dependency (no Tailwind, MUI, etc.) — all styles are hand-crafted in `index.css` using CSS custom properties for the design system.

---

## Design System

Defined in `src/index.css`:

```css
:root {
    --bg:         #0f1117;   /* page background */
    --surface:    #1a1d27;   /* card / sidebar */
    --surface-2:  #222633;   /* input background */
    --border:     #2a2e3b;
    --text:       #e4e6ed;
    --text-dim:   #8b8fa3;
    --green:      #34d399;   /* primary accent */
    --amber:      #fbbf24;   /* disease detected badge */
    --red:        #f87171;   /* error states */
    --blue:       #60a5fa;   /* info states */
}
```

Typography: **Inter** (Google Fonts), weights 300–700.

---

## Project Structure

```
Frontend/Disease-Predition/
├── src/
│   ├── pages/
│   │   ├── Auth.tsx         # Login / Register
│   │   ├── Dashboard.tsx    # Core diagnosis UI (450 LOC)
│   │   ├── History.tsx      # Prediction history + advisory modal
│   │   └── Profile.tsx      # User profile display
│   ├── components/
│   │   └── Layout.tsx       # Sidebar navigation + user card + <Outlet/>
│   ├── api.ts               # Axios instance, interceptors, all API functions
│   ├── App.tsx              # Router + ProtectedRoute (server-side validation)
│   ├── index.css            # Full design system — no external CSS framework
│   └── main.tsx             # React 19 createRoot entry
├── public/
├── nginx.conf               # Production Nginx config (proxy + gzip + cache)
├── .env.local               # Local dev env (VITE_API_URL not set = use proxy)
├── dockerfile               # Multi-stage: Vite build → nginx:alpine
├── .dockerignore
├── vite.config.ts           # Dev server :3000, proxy /api → localhost:5000
├── tsconfig.app.json
└── package.json
```

---

## Local Development

```bash
cd Frontend/Disease-Predition
npm install
npm run dev
# → http://localhost:3000
```

The Vite dev server proxies all `/api/*` requests to `localhost:5000` (the backend). No CORS issues, no `VITE_API_URL` needed locally.

```ts
// vite.config.ts
server: {
    port: 3000,
    proxy: {
        '/api': 'http://localhost:5000'
    }
}
```

---

## Production Build

### How it works

```
npm run build
  → tsc type-check + vite bundle
  → /dist (minified JS, CSS, assets)

Nginx serves /dist as static files
Nginx proxies /api/* → http://backend:5000/api/ (internal Docker network)
```

`VITE_API_URL` is intentionally **not set** at build time. All API calls use relative paths (`/api/...`), and Nginx handles the routing — meaning no CORS headers are needed and the backend port is never exposed publicly.

### Docker

```bash
# Build only the frontend image
docker build -t plantdoc-frontend:latest .

# Run standalone (backend must be accessible as 'backend')
docker run -p 80:80 plantdoc-frontend:latest

# Via compose (recommended)
docker compose --env-file ../../.env.production up frontend -d
```

**Estimated image size: ~25 MB** (`nginx:1.27-alpine` + minified static files)

### Nginx configuration highlights (`nginx.conf`)

```nginx
# API proxy — backend never exposed publicly
location /api/ {
    proxy_pass         http://backend:5000/api/;
    proxy_read_timeout 120s;   # Agent calls take 15–30s
}

# Static assets — immutable long-term cache
location ~* \.(js|css|png|jpg|svg|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# SPA fallback
location / {
    try_files $uri /index.html;
}
```

---

## Environment Variables

| Variable | Local | Production |
|---|---|---|
| `VITE_API_URL` | **not set** (proxy used) | **not set** (nginx proxy used) |

No build-time env vars are required. The app works entirely via the Nginx reverse proxy in production.

---

*Part of the [PlantDoc](../../README.md) platform · Built by [@Sathvik33](https://github.com/Sathvik33)*
