const mongoose = require("mongoose");

const EQUIPMENT_STATUSES = ["Available", "Low Stock", "Out of Stock"];

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Equipment name is required"],
      trim: true,
      maxlength: [120, "Name must be at most 120 characters"],
    },
    equipmentId: {
      type: String,
      required: [true, "Equipment id is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [40, "Equipment id must be at most 40 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [60, "Category must be at most 60 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description must be at most 500 characters"],
    },
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: [true, "Lab reference is required"],
    },
    totalQuantity: {
      type: Number,
      required: [true, "Total quantity is required"],
      min: [0, "Total quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Total quantity must be a whole number",
      },
    },
    availableQuantity: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: [0, "Available quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Available quantity must be a whole number",
      },
    },
    status: {
      type: String,
      enum: {
        values: EQUIPMENT_STATUSES,
        message: `Status must be one of: ${EQUIPMENT_STATUSES.join(", ")}`,
      },
      default: "Available",
    },
  },
  { timestamps: true, collection: "equipments" },
);

equipmentSchema.index({ lab: 1 });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ name: "text", description: "text" });

// Derive status from the quantities so it can never drift out of sync.
function computeStatus(available, total) {
  if (available <= 0) return "Out of Stock";
  if (total > 0 && available <= Math.ceil(total * 0.2)) return "Low Stock";
  return "Available";
}

equipmentSchema.pre("validate", function (next) {
  if (
    typeof this.availableQuantity === "number" &&
    typeof this.totalQuantity === "number" &&
    this.availableQuantity > this.totalQuantity
  ) {
    return next(
      new Error("Available quantity cannot exceed total quantity"),
    );
  }
  if (
    typeof this.availableQuantity === "number" &&
    typeof this.totalQuantity === "number"
  ) {
    this.status = computeStatus(this.availableQuantity, this.totalQuantity);
  }
  next();
});

equipmentSchema.statics.EQUIPMENT_STATUSES = EQUIPMENT_STATUSES;
equipmentSchema.statics.computeStatus = computeStatus;

module.exports =
  mongoose.models.Equipment || mongoose.model("Equipment", equipmentSchema);
