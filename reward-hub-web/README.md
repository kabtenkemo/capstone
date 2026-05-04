# Reward Hub Web

React + Vite frontend for the Reward Hub API.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure the API URL in `.env`:

```bash
VITE_API_BASE_URL=https://localhost:7199/api
```

For Vercel, set `VITE_API_BASE_URL=/api` in production. The Vercel rewrite will
forward `/api/*` requests to the backend.

3. Run the app:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Vercel

- Build command: `npm run build`
- Publish directory: `dist`
- Required environment variable: `VITE_API_BASE_URL`
- Vercel rewrite: `/api/*` -> `http://reward-hub.runasp.net/api/*`

## Features

- JWT login and registration
- Role-aware dashboard layout
- Live leaderboard, points, comments, and health views
- Local token persistence with automatic profile hydration
