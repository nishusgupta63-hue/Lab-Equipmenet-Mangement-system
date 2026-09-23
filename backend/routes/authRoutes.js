const express = require("express");
const {
  register,
  registerTeacher,
  login,
  me,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/register-teacher", registerTeacher);
router.post("/login", login);
router.get("/me", requireAuth, me);

module.exports = router;
