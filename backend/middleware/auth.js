const jwt = require("jsonwebtoken");
const { User } = require("../models");
const asyncHandler = require("./asyncHandler");

/**
 * Sign a JWT carrying the user id and role.
 */
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Server auth is not configured");
  return jwt.sign({ sub: String(user._id), role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

/**
 * Requires a valid Bearer token. Loads the user fresh from MongoDB so the
 * role is always taken from the database, never from the client.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    res.status(401);
    throw new Error("Authentication required");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || "");
  } catch (err) {
    res.status(401);
    throw new Error("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    res.status(401);
    throw new Error("Account no longer exists");
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to one or more roles. Must run after requireAuth.
 * Usage: router.post("/", requireAuth, requireRole("teacher"), handler)
 */
function requireRole(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Authentication required"));
    }
    if (!allowed.includes(req.user.role)) {
      res.status(403);
      return next(new Error("You do not have permission to perform this action"));
    }
    next();
  };
}

module.exports = { signToken, requireAuth, requireRole };
