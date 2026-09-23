const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// --- CORS ---
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow tools like curl/Postman (no origin) and configured origins
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

// --- Body parsers ---
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Request logging ---
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// --- Routes ---
app.get("/", (req, res) => {
  res.json({ success: true, message: "LabBuddy Connect API", docs: "/api/health" });
});
app.use("/api", routes);

// --- Errors ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
