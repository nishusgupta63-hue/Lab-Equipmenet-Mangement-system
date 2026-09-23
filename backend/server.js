require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    // The API still boots so /api/health can report the database state,
    // but every database-backed route will fail until MONGO_URI is valid.
    console.error("MongoDB connection failed:", err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`LabBuddy backend listening on http://localhost:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
  });
}

start();
