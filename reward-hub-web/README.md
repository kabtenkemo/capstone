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

For Vercel, set the same variable as a production environment value in the
project settings, or copy `.env.vercel.example` to `.env.production` and replace
the placeholder API URL with your deployed backend endpoint.

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

## Features

- JWT login and registration
- Role-aware dashboard layout
- Live leaderboard, points, comments, and health views
- Local token persistence with automatic profile hydration
