const asyncHandler = require("../middleware/asyncHandler");
const { Lab, Equipment } = require("../models");

// GET /api/labs
const listLabs = asyncHandler(async (req, res) => {
  const labs = await Lab.find().sort({ name: 1 });
  res.json({ success: true, count: labs.length, data: labs });
});

// GET /api/labs/:id
const getLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  res.json({ success: true, data: lab });
});

// POST /api/labs  (teacher only)
const createLab = asyncHandler(async (req, res) => {
  const { name, code, description, location } = req.body || {};
  if (!name || !code) {
    res.status(400);
    throw new Error("Lab name and code are required");
  }
  const lab = await Lab.create({
    name: String(name).trim(),
    code: String(code).trim(),
    description: description ? String(description).trim() : "",
    location: location ? String(location).trim() : "",
  });
  res.status(201).json({ success: true, data: lab });
});

// PUT /api/labs/:id  (teacher only)
const updateLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  const { name, code, description, location } = req.body || {};
  if (name !== undefined) lab.name = String(name).trim();
  if (code !== undefined) lab.code = String(code).trim();
  if (description !== undefined) lab.description = String(description).trim();
  if (location !== undefined) lab.location = String(location).trim();
  await lab.save();
  res.json({ success: true, data: lab });
});

// DELETE /api/labs/:id  (teacher only)
const deleteLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) {
    res.status(404);
    throw new Error("Lab not found");
  }
  const inUse = await Equipment.countDocuments({ lab: lab._id });
  if (inUse > 0) {
    res.status(409);
    throw new Error("Cannot delete a lab that still has equipment assigned");
  }
  await lab.deleteOne();
  res.json({ success: true, message: "Lab deleted" });
});

module.exports = { listLabs, getLab, createLab, updateLab, deleteLab };
