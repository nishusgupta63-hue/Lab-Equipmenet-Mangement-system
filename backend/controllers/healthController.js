const asyncHandler = require("../middleware/asyncHandler");
const { dbState } = require("../config/db");

// GET /api/health
const getHealth = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "labbuddy-backend",
    environment: process.env.NODE_ENV || "development",
    database: dbState(),
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

module.exports = { getHealth };
