const express = require("express");
const {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require("../controllers/equipmentController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Students and teachers can browse equipment.
router.get("/", requireAuth, listEquipment);
router.get("/:id", requireAuth, getEquipment);

// Teacher-only mutations.
router.post("/", requireAuth, requireRole("teacher"), createEquipment);
router.put("/:id", requireAuth, requireRole("teacher"), updateEquipment);
router.patch("/:id", requireAuth, requireRole("teacher"), updateEquipment);
router.delete("/:id", requireAuth, requireRole("teacher"), deleteEquipment);

module.exports = router;
