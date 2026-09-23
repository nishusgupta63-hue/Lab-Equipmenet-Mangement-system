const mongoose = require("mongoose");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must be at most 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // Never returned by default; hashing is added in the authentication step.
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["student", "teacher"],
        message: "Role must be either student or teacher",
      },
      default: "student",
    },
    // Optional; unique when present (sparse index below).
    studentId: {
      type: String,
      trim: true,
    },
    teacherId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

// Sparse unique indexes: only enforced for documents that have the field.
userSchema.index({ studentId: 1 }, { unique: true, sparse: true });
userSchema.index({ teacherId: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });

// A student should carry a studentId, a teacher a teacherId (when supplied
// by the client). This keeps role-specific identifiers from crossing over.
userSchema.pre("validate", function (next) {
  if (this.role === "student" && this.teacherId) {
    return next(new Error("A student cannot have a teacherId"));
  }
  if (this.role === "teacher" && this.studentId) {
    return next(new Error("A teacher cannot have a studentId"));
  }
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
