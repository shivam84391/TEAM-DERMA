import express from "express";
import { register, login, logout, createInvoice, bills, getInvoiceBySetNumber, getMyPunch } from "../controllers/usercontroller.js";
import {authMiddleware} from "../middleware/authmiddleware.js";
import { endBreak, punchIn, punchOut, startBreak } from "../controllers/punchcontoller.js";
// import { create } from "@mui/material/styles/createTransitions.js";

const router = express.Router();

// Define user-related routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout",authMiddleware,logout);

router.post("/addinvoice",authMiddleware,createInvoice);
router.get("/bills",authMiddleware,bills);
router.get("/search-bills/:setNumber", authMiddleware, getInvoiceBySetNumber);
router.post("/punch-in", authMiddleware,punchIn);
router.post("/punch-out",authMiddleware,punchOut);
router.post("/break/start", authMiddleware, startBreak);
router.post("/break/end",authMiddleware, endBreak);
router.get("/my-punch", authMiddleware,getMyPunch);


export default router;
