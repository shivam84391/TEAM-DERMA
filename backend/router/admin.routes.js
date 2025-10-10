import express from "express";

import {authMiddleware} from "../middleware/authmiddleware.js";
import { getAllCustomers, getAllPunchRecords, getInvoiceById, getInvoices, getPunchesToday, getUserDetailsWithInvoices, updateInvoiceStatus, updatePunchStatus, updateSetStatus } from "../controllers/admincontroller.js";
// import { create } from "@mui/material/styles/createTransitions.js";

export const router = express.Router();

router.get("/users",authMiddleware,getAllCustomers);
router.get("/invoices",authMiddleware,getInvoices);
router.get("/invoice/:id",authMiddleware, getInvoiceById);
router.put("/invoices/:setNumber/:action",authMiddleware, updateSetStatus); // UPDATE status
router.get("/:id/details", getUserDetailsWithInvoices);
router.put("/invoices/:id/status", updateInvoiceStatus);
router.get("/admin/all",authMiddleware,getAllPunchRecords);
router.get("/punches-today",authMiddleware,getPunchesToday);
router.patch("/update/:punchId",authMiddleware,updatePunchStatus);

export default router;