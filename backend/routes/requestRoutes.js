const express = require("express");
const {
  createRequest,
  myRequests,
  listRequests,
  getRequest,
  approveRequest,
  rejectRequest,
  returnRequest,
} = require("../controllers/requestController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Student-only
router.post("/", requireAuth, requireRole("student"), createRequest);
router.get("/my", requireAuth, requireRole("student"), myRequests);

// Teacher-only listing and lifecycle actions
router.get("/", requireAuth, requireRole("teacher"), listRequests);
router.patch("/:id/approve", requireAuth, requireRole("teacher"), approveRequest);
router.patch("/:id/reject", requireAuth, requireRole("teacher"), rejectRequest);
router.patch("/:id/return", requireAuth, requireRole("teacher"), returnRequest);

// Any authenticated user; controller enforces ownership for students.
router.get("/:id", requireAuth, getRequest);

module.exports = router;
