import express from "express";
import { register, login, logout, createInvoice, bills, getInvoiceBySetNumber } from "../controllers/usercontroller.js";
import {authMiddleware} from "../middleware/authmiddleware.js";
// import { create } from "@mui/material/styles/createTransitions.js";

const router = express.Router();

// Define user-related routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout",authMiddleware, logout);

router.post("/addinvoice",authMiddleware,createInvoice);
router.get("/bills",authMiddleware,bills);
router.get("/search-bills/:setNumber", authMiddleware, getInvoiceBySetNumber);


export default router;
