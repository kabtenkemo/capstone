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

3. Run the app:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Features

- JWT login and registration
- Role-aware dashboard layout
- Live leaderboard, points, comments, and health views
- Local token persistence with automatic profile hydration
