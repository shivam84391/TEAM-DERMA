import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from "../models/user_models.js";
import Invoice from '../models/invoices_schema.js';
// Adjust path as needed

// Register Controller
export const register = async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists with this email and role.' });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
};

export const login = async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('User not found with email:', email, 'and role:', role);
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
        { email: user.email, role: user.role, _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    console.log(token);
    res.cookie('token', token, {
        httpOnly: true,

    });

    res.json({ message: 'Login successful.', token, email: user.email, role: user.role });
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully.' });
};

export const createInvoice = async (req, res) => {
  try {
    const { customerDetails, products } = req.body;
    console.log(req.user.email);
    // map products to schema fields
    const mappedProducts = products.map((p) => ({
      productId: p.productId,
      name: p.productName, 
      serial: p.serialNumber, 
      rate: p.rate,
      qty: p.quantity,
      discount: p.discount,
    }));

    const newInvoice = new Invoice({
      invoiceNumber: customerDetails.invoiceNumber,
      setNumber: customerDetails.setNumber,
      customerName: customerDetails.name,
      products: mappedProducts,
        createdBy: req.user._id, // from auth middleware
    });

    const savedInvoice = await newInvoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: savedInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Failed to create invoice", error: error.message });
  }
};

export const bills = async (req, res) => {
    try {
        console.log("here");
        const userId = req.user._id;
        // const data = await Invoice.find({ createdBy: userId });
        const data = await Invoice.find({ createdBy: userId }); // sab invoices dikhenge

        console.log(data);
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No invoices found" });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const getInvoiceBySetNumber = async (req, res) => {
    try {
        const { setNumber } = req.params;
        if (!setNumber) {
            return res.status(400).json({ message: "Set number is required." });
        }

        const invoice = await Invoice.findOne({ setNumber, createdBy: req.user._id });
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found for this set number." });
        }
        console.log("ye hai",invoice);

        return res.status(200).json(invoice);
    } catch (error) {
        console.error("Error fetching invoice by set number:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

