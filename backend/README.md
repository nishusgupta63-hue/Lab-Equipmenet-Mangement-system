# LabBuddy Connect — Backend (Node + Express + MongoDB + Mongoose)

Runs completely independently from the React/Vite frontend.

## Setup

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI
npm run dev               # or: npm start
```

## Environment variables

See `.env.example`. `MONGO_URI` is required — use a local MongoDB
(`mongodb://127.0.0.1:27017/labbuddy`) or a MongoDB Atlas connection string.
Never commit real credentials.

## Endpoints

| Method | Path          | Description                          |
| ------ | ------------- | ------------------------------------ |
| GET    | `/`           | API banner                           |
| GET    | `/api/health` | Health check + database state        |

## Structure

```
backend/
  server.js            entry point, boots DB + HTTP server
  app.js               express app, middleware, route mounting
  config/db.js         mongoose connection helper
  routes/              route definitions (index.js mounts all)
  controllers/         request handlers
  middleware/          error handling, async wrapper
  models/              mongoose schemas (next step)
```
