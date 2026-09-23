const express = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const labRoutes = require("./labRoutes");
const equipmentRoutes = require("./equipmentRoutes");
const requestRoutes = require("./requestRoutes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/labs", labRoutes);
router.use("/equipment", equipmentRoutes);
router.use("/requests", requestRoutes);

module.exports = router;
