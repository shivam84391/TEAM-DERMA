import express from "express";
import { 
  register, 
  login, 
  logout, 
  createInvoice, 
  bills, 
  getInvoiceBySetNumber 
} from "../controllers/usercontroller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// user register/login/logout
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

// user invoices
router.post("/addinvoice", authMiddleware, createInvoice);
router.get("/bills", authMiddleware, bills);
router.get("/search-bills/:setNumber", authMiddleware, getInvoiceBySetNumber);

export default router;
