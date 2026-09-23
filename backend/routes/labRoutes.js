const express = require("express");
const {
  listLabs,
  getLab,
  createLab,
  updateLab,
  deleteLab,
} = require("../controllers/labController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listLabs);
router.get("/:id", requireAuth, getLab);
router.post("/", requireAuth, requireRole("teacher"), createLab);
router.put("/:id", requireAuth, requireRole("teacher"), updateLab);
router.patch("/:id", requireAuth, requireRole("teacher"), updateLab);
router.delete("/:id", requireAuth, requireRole("teacher"), deleteLab);

module.exports = router;
