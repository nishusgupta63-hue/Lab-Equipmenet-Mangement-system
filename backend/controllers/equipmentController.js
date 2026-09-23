const asyncHandler = require("../middleware/asyncHandler");
const { Equipment, Lab, EquipmentRequest } = require("../models");

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

// GET /api/equipment?lab=&category=&status=&search=
const listEquipment = asyncHandler(async (req, res) => {
  const { lab, category, status, search } = req.query;
  const filter = {};

  if (lab) filter.lab = lab;
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
  if (status) filter.status = status;
  if (search) {
    const rx = new RegExp(escapeRegex(String(search)), "i");
    filter.$or = [{ name: rx }, { description: rx }];
  }

  const items = await Equipment.find(filter)
    .populate("lab", "name code")
    .sort({ name: 1 });

  res.json({ success: true, count: items.length, data: items });
});

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/equipment/:id
const getEquipment = asyncHandler(async (req, res) => {
  const item = await Equipment.findById(req.params.id).populate("lab", "name code");
  if (!item) {
    res.status(404);
    throw new Error("Equipment not found");
  }
  res.json({ success: true, data: item });
});

// POST /api/equipment  (teacher only)
const createEquipment = asyncHandler(async (req, res) => {
  const { name, equipmentId, category, description, lab, totalQuantity } =
    req.body || {};

  const total = Number(totalQuantity);
  const available =
    req.body && req.body.availableQuantity !== undefined
      ? Number(req.body.availableQuantity)
      : total;

  const errors = [];
  if (!name) errors.push("Equipment name is required");
  if (!equipmentId) errors.push("Equipment id is required");
  if (!category) errors.push("Category is required");
  if (!lab) errors.push("Lab is required");
  if (!isPositiveInteger(total)) errors.push("Total quantity must be a whole number >= 0");
  if (!isPositiveInteger(available))
    errors.push("Available quantity must be a whole number >= 0");
  if (isPositiveInteger(total) && isPositiveInteger(available) && available > total)
    errors.push("Available quantity cannot exceed total quantity");

  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const labDoc = await Lab.findById(lab);
  if (!labDoc) {
    res.status(404);
    throw new Error("Lab not found");
  }

  const item = await Equipment.create({
    name: String(name).trim(),
    equipmentId: String(equipmentId).trim(),
    category: String(category).trim(),
    description: description ? String(description).trim() : "",
    lab: labDoc._id,
    totalQuantity: total,
    availableQuantity: available,
  });

  res.status(201).json({ success: true, data: item });
});

// PUT /api/equipment/:id  (teacher only)
const updateEquipment = asyncHandler(async (req, res) => {
  const item = await Equipment.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Equipment not found");
  }

  const body = req.body || {};
  if (body.name !== undefined) item.name = String(body.name).trim();
  if (body.equipmentId !== undefined)
    item.equipmentId = String(body.equipmentId).trim();
  if (body.category !== undefined) item.category = String(body.category).trim();
  if (body.description !== undefined)
    item.description = String(body.description).trim();

  if (body.lab !== undefined) {
    const labDoc = await Lab.findById(body.lab);
    if (!labDoc) {
      res.status(404);
      throw new Error("Lab not found");
    }
    item.lab = labDoc._id;
  }

  const onLoan = item.totalQuantity - item.availableQuantity;

  if (body.totalQuantity !== undefined) {
    const total = Number(body.totalQuantity);
    if (!isPositiveInteger(total)) {
      res.status(400);
      throw new Error("Total quantity must be a whole number >= 0");
    }
    if (total < onLoan) {
      res.status(409);
      throw new Error(
        `Total quantity cannot be lower than the ${onLoan} unit(s) currently issued`,
      );
    }
    item.totalQuantity = total;
    // Quantities on loan are owned by the request workflow, not the client.
    item.availableQuantity = total - onLoan;
  }

  if (body.availableQuantity !== undefined) {
    const available = Number(body.availableQuantity);
    if (!isPositiveInteger(available)) {
      res.status(400);
      throw new Error("Available quantity must be a whole number >= 0");
    }
    if (available > item.totalQuantity) {
      res.status(400);
      throw new Error("Available quantity cannot exceed total quantity");
    }
    item.availableQuantity = available;
  }

  await item.save();
  res.json({ success: true, data: item });
});

// DELETE /api/equipment/:id  (teacher only)
const deleteEquipment = asyncHandler(async (req, res) => {
  const item = await Equipment.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Equipment not found");
  }

  const active = await EquipmentRequest.countDocuments({
    equipment: item._id,
    status: { $in: ["Pending", "Approved"] },
  });
  if (active > 0) {
    res.status(409);
    throw new Error("Cannot delete equipment with pending or approved requests");
  }

  await item.deleteOne();
  res.json({ success: true, message: "Equipment deleted" });
});

module.exports = {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
