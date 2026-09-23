const bcrypt = require("bcryptjs");
const asyncHandler = require("../middleware/asyncHandler");
const { signToken } = require("../middleware/auth");
const { User } = require("../models");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId || null,
    teacherId: user.teacherId || null,
    createdAt: user.createdAt,
  };
}

function validateBasics({ name, email, password }) {
  const errors = [];
  if (!name || String(name).trim().length < 2) errors.push("Name is required");
  if (!email || !EMAIL_REGEX.test(String(email).trim()))
    errors.push("A valid email is required");
  if (!password || String(password).length < 6)
    errors.push("Password must be at least 6 characters");
  return errors;
}

async function assertEmailFree(email, res) {
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }
}

// POST /api/auth/register  (always creates a student)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, studentId } = req.body || {};

  const errors = validateBasics({ name, email, password });
  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const normalisedEmail = String(email).trim().toLowerCase();
  await assertEmailFree(normalisedEmail, res);

  const user = await User.create({
    name: String(name).trim(),
    email: normalisedEmail,
    password: await bcrypt.hash(String(password), 10),
    // Role is never taken from the request body.
    role: "student",
    ...(studentId ? { studentId: String(studentId).trim() } : {}),
  });

  res.status(201).json({
    success: true,
    token: signToken(user),
    user: safeUser(user),
  });
});

// POST /api/auth/register-teacher  (requires the teacher registration code)
const registerTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, teacherId, teacherRegistrationCode } =
    req.body || {};

  const expectedCode = process.env.TEACHER_REGISTRATION_CODE;
  if (!expectedCode) {
    res.status(500);
    throw new Error("Teacher registration is not configured on the server");
  }

  const errors = validateBasics({ name, email, password });
  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  if (
    !teacherRegistrationCode ||
    String(teacherRegistrationCode).trim() !== String(expectedCode)
  ) {
    res.status(403);
    throw new Error("Invalid teacher registration code");
  }

  const normalisedEmail = String(email).trim().toLowerCase();
  await assertEmailFree(normalisedEmail, res);

  const user = await User.create({
    name: String(name).trim(),
    email: normalisedEmail,
    password: await bcrypt.hash(String(password), 10),
    role: "teacher",
    ...(teacherId ? { teacherId: String(teacherId).trim() } : {}),
  });

  res.status(201).json({
    success: true,
    token: signToken(user),
    user: safeUser(user),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({
    email: String(email).trim().toLowerCase(),
  }).select("+password");

  if (!user || !(await bcrypt.compare(String(password), user.password || ""))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({ success: true, token: signToken(user), user: safeUser(user) });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: safeUser(req.user) });
});

module.exports = { register, registerTeacher, login, me, safeUser };
