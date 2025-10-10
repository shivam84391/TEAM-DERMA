import express from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import {
    approveUser,
  getAllCustomers,
  getAllPunchRecords,
  getInvoiceById,
  getInvoices,
  getPendingUsers,
  getPunchesToday,
  getUserDetailsWithInvoices,
  updateInvoiceById,
  updateInvoiceStatus,
  updatePunchStatus,
  updateSetStatus,
} from "../controllers/admincontroller.js";

const router = express.Router();

// ✅ Customer & Invoice Routes
router.get("/users", authMiddleware, getAllCustomers);
router.get("/invoices", authMiddleware, getInvoices);
router.get("/invoice/:id", authMiddleware, getInvoiceById);          // ✅ Get by ID
router.put("/invoice/:id", updateInvoiceById);       // ✅ Update by ID
router.put("/invoices/:setNumber/:action", authMiddleware, updateSetStatus); // ✅ Update set
router.put("/invoices/:id/status", authMiddleware, updateInvoiceStatus);
router.get("/pending-users",authMiddleware, getPendingUsers);
router.patch("/approve-user/:id",authMiddleware, approveUser);

// ✅ User & Punch Routes
router.get("/:id/details", authMiddleware, getUserDetailsWithInvoices);
router.get("/admin/all", authMiddleware, getAllPunchRecords);
router.get("/punches-today", authMiddleware, getPunchesToday);
router.patch("/update/:punchId", authMiddleware, updatePunchStatus);

export default router;
