const asyncHandler = require("../middleware/asyncHandler");
const { Equipment, EquipmentRequest } = require("../models");

const POPULATE = [
  { path: "student", select: "name email role studentId" },
  {
    path: "equipment",
    select: "name equipmentId category totalQuantity availableQuantity status lab",
    populate: { path: "lab", select: "name code" },
  },
];

/**
 * Recompute the derived status after an atomic $inc, which bypasses the
 * model's pre-validate hook.
 */
async function syncEquipmentStatus(equipmentId) {
  const item = await Equipment.findById(equipmentId);
  if (!item) return null;
  const next = Equipment.computeStatus(item.availableQuantity, item.totalQuantity);
  if (item.status !== next) {
    item.status = next;
    await item.save();
  }
  return item;
}

// POST /api/requests  (student only)
const createRequest = asyncHandler(async (req, res) => {
  const { equipment, quantity, purpose } = req.body || {};

  const qty = Number(quantity);
  const errors = [];
  if (!equipment) errors.push("Equipment is required");
  if (!Number.isInteger(qty) || qty < 1)
    errors.push("Quantity must be a whole number of at least 1");
  if (!purpose || String(purpose).trim().length < 3)
    errors.push("Purpose must be at least 3 characters");

  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(", "));
  }

  const item = await Equipment.findById(equipment);
  if (!item) {
    res.status(404);
    throw new Error("Equipment not found");
  }

  if (qty > item.availableQuantity) {
    res.status(400);
    throw new Error(
      `Only ${item.availableQuantity} unit(s) of ${item.name} are available`,
    );
  }

  const created = await EquipmentRequest.create({
    // Identity always comes from the verified token, never from the body.
    student: req.user._id,
    equipment: item._id,
    quantity: qty,
    purpose: String(purpose).trim(),
    status: "Pending",
    requestDate: new Date(),
  });

  const populated = await EquipmentRequest.findById(created._id).populate(POPULATE);
  res.status(201).json({ success: true, data: populated });
});

// GET /api/requests/my  (student only)
const myRequests = asyncHandler(async (req, res) => {
  const filter = { student: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const items = await EquipmentRequest.find(filter)
    .populate(POPULATE)
    .sort({ createdAt: -1 });

  res.json({ success: true, count: items.length, data: items });
});

// GET /api/requests  (teacher only)
const listRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.equipment) filter.equipment = req.query.equipment;
  if (req.query.student) filter.student = req.query.student;

  const items = await EquipmentRequest.find(filter)
    .populate(POPULATE)
    .sort({ createdAt: -1 });

  res.json({ success: true, count: items.length, data: items });
});

// GET /api/requests/:id
const getRequest = asyncHandler(async (req, res) => {
  const item = await EquipmentRequest.findById(req.params.id).populate(POPULATE);
  if (!item) {
    res.status(404);
    throw new Error("Request not found");
  }

  const ownerId = item.student?._id ? String(item.student._id) : String(item.student);
  if (req.user.role !== "teacher" && ownerId !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only view your own requests");
  }

  res.json({ success: true, data: item });
});

// PATCH /api/requests/:id/approve  (teacher only)
const approveRequest = asyncHandler(async (req, res) => {
  // Claim the request atomically so it can only be approved once.
  const claimed = await EquipmentRequest.findOneAndUpdate(
    { _id: req.params.id, status: "Pending" },
    { $set: { status: "Approved", approvedDate: new Date() } },
    { new: true },
  );

  if (!claimed) {
    const exists = await EquipmentRequest.findById(req.params.id);
    if (!exists) {
      res.status(404);
      throw new Error("Request not found");
    }
    res.status(409);
    throw new Error(`Only pending requests can be approved (current: ${exists.status})`);
  }

  // Decrement stock only when enough units are still available.
  const updated = await Equipment.findOneAndUpdate(
    { _id: claimed.equipment, availableQuantity: { $gte: claimed.quantity } },
    { $inc: { availableQuantity: -claimed.quantity } },
    { new: true },
  );

  if (!updated) {
    // Roll the request back to Pending so nothing is lost.
    await EquipmentRequest.updateOne(
      { _id: claimed._id },
      { $set: { status: "Pending", approvedDate: null } },
    );
    res.status(409);
    throw new Error("Not enough available quantity to approve this request");
  }

  await syncEquipmentStatus(updated._id);

  const populated = await EquipmentRequest.findById(claimed._id).populate(POPULATE);
  res.json({ success: true, data: populated });
});

// PATCH /api/requests/:id/reject  (teacher only)
const rejectRequest = asyncHandler(async (req, res) => {
  const updated = await EquipmentRequest.findOneAndUpdate(
  { _id: req.params.id, status: "Pending" },
  {
    $set: {
      status: "Rejected",
      approvedDate: null,
      rejectedDate: new Date(),
      returnedDate: null,
    },
  },
  { new: true },
).populate(POPULATE);

  if (!updated) {
    const exists = await EquipmentRequest.findById(req.params.id);
    if (!exists) {
      res.status(404);
      throw new Error("Request not found");
    }
    res.status(409);
    throw new Error(`Only pending requests can be rejected (current: ${exists.status})`);
  }

  // Equipment quantities are untouched on rejection.
  res.json({ success: true, data: updated });
});

// PATCH /api/requests/:id/return  (teacher only)
const returnRequest = asyncHandler(async (req, res) => {
  const claimed = await EquipmentRequest.findOneAndUpdate(
    { _id: req.params.id, status: "Approved" },
    { $set: { status: "Returned", returnedDate: new Date() } },
    { new: true },
  );

  if (!claimed) {
    const exists = await EquipmentRequest.findById(req.params.id);
    if (!exists) {
      res.status(404);
      throw new Error("Request not found");
    }
    res.status(409);
    throw new Error(`Only approved requests can be returned (current: ${exists.status})`);
  }

  const item = await Equipment.findById(claimed.equipment);
  if (item) {
    // Never let stock climb above the total owned by the lab.
    const restored = await Equipment.findOneAndUpdate(
      {
        _id: item._id,
        $expr: {
          $lte: [
            { $add: ["$availableQuantity", claimed.quantity] },
            "$totalQuantity",
          ],
        },
      },
      { $inc: { availableQuantity: claimed.quantity } },
      { new: true },
    );

    if (!restored) {
      // Clamp instead of overshooting the total.
      await Equipment.updateOne(
        { _id: item._id },
        [{ $set: { availableQuantity: "$totalQuantity" } }],
      );
    }
    await syncEquipmentStatus(item._id);
  }

  const populated = await EquipmentRequest.findById(claimed._id).populate(POPULATE);
  res.json({ success: true, data: populated });
});

module.exports = {
  createRequest,
  myRequests,
  listRequests,
  getRequest,
  approveRequest,
  rejectRequest,
  returnRequest,
};
