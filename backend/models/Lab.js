const mongoose = require("mongoose");

const labSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lab name is required"],
      unique: true,
      trim: true,
      maxlength: [120, "Lab name must be at most 120 characters"],
    },
    code: {
      type: String,
      required: [true, "Lab code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, "Lab code must be at most 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description must be at most 500 characters"],
    },
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Location must be at most 200 characters"],
},
  },
  { timestamps: true, collection: "labs" },
);

module.exports = mongoose.models.Lab || mongoose.model("Lab", labSchema);
