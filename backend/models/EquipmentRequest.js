const mongoose = require("mongoose");

const REQUEST_STATUSES = ["Pending", "Approved", "Rejected", "Returned"];

const equipmentRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: [true, "Equipment reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
      minlength: [3, "Purpose must be at least 3 characters"],
      maxlength: [300, "Purpose must be at most 300 characters"],
    },
    status: {
      type: String,
      enum: {
        values: REQUEST_STATUSES,
        message: `Status must be one of: ${REQUEST_STATUSES.join(", ")}`,
      },
      default: "Pending",
    },
    requestDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    approvedDate: { type: Date, default: null },
rejectedDate: { type: Date, default: null },
returnedDate: { type: Date, default: null },
  },
  { timestamps: true, collection: "equipmentrequests" },
);

equipmentRequestSchema.index({ student: 1, createdAt: -1 });
equipmentRequestSchema.index({ equipment: 1 });
equipmentRequestSchema.index({ status: 1, createdAt: -1 });

// Keep the lifecycle dates consistent with the status.
equipmentRequestSchema.pre("save", function (next) {
  if (this.status === "Approved" && !this.approvedDate) {
    this.approvedDate = new Date();
  }
  if (this.status === "Returned") {
    if (!this.approvedDate) {
      return next(new Error("A request must be approved before it can be returned"));
    }
    if (!this.returnedDate) this.returnedDate = new Date();
  }
  if (this.status === "Rejected") {
    this.approvedDate = null;
    this.returnedDate = null;
  }
  next();
});

equipmentRequestSchema.statics.REQUEST_STATUSES = REQUEST_STATUSES;

module.exports =
  mongoose.models.EquipmentRequest ||
  mongoose.model("EquipmentRequest", equipmentRequestSchema);
