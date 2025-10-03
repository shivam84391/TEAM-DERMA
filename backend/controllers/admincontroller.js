import Invoice from "../models/invoices_schema.js";
import User from "../models/user_models.js";

// =============================
// GET all customers with their invoices
// =============================
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).lean();

    const invoices = await Invoice.find({
      createdBy: { $in: customers.map((c) => c._id) },
    }).lean();

    const customersWithInvoices = customers.map((c) => {
      const userInvoices = invoices.filter(
        (inv) => inv.createdBy.toString() === c._id.toString()
      );

      return {
        _id: c._id,
        name: c.email,
        contact: c.contact || "",
        invoices: userInvoices,
      };
    });

    res.status(200).json(customersWithInvoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET invoices grouped by setNumber
// =============================
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("createdBy", "email");

    const grouped = invoices.reduce((acc, inv) => {
      const setNum = inv.setNumber || "NO_SET";

      if (!acc[setNum]) {
        acc[setNum] = {
          setNumber: setNum,
          invoices: [], // will hold invoice IDs
          user: inv.createdBy?.email || "Unknown",
          date: inv.createdAt.toISOString().split("T")[0],
          status: inv.status,
        };
      }

      acc[setNum].invoices.push(inv._id); // IMPORTANT: send MongoDB _id
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// =============================
// GET invoice details by ID
// =============================
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id).populate("createdBy", "email");
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const subtotal = invoice.products.reduce(
      (sum, p) => sum + p.rate * p.qty,
      0
    );
    const discount = invoice.products.reduce((sum, p) => sum + p.discount, 0);
    const total = subtotal - discount;

    res.json({
      invoiceNo: invoice.invoiceNumber,
      customerName: invoice.customerName,
      createdBy: invoice.createdBy?.email,
      products: invoice.products.map((p) => ({
        name: p.name,
        serial: p.serial,
        rate: p.rate,
        qty: p.qty,
        discount: p.discount,
        amount: p.rate * p.qty - p.discount,
      })),
      subtotal,
      discount,
      total,
      status: invoice.status,
      date: invoice.createdAt,
      setNumber: invoice.setNumber,
    });
  } catch (err) {
    console.error("Error fetching invoice by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// =============================
// UPDATE status of all invoices in a set
// =============================
export const updateSetStatus = async (req, res) => {
  try {
    const { setNumber } = req.params;
    const { action } = req.params; // coming from URL (/approve, /reject, /hold)

    let newStatus = "Pending";
    if (action === "approve") newStatus = "Approved";
    if (action === "reject") newStatus = "Rejected";
    if (action === "hold") newStatus = "On Hold";

    const result = await Invoice.updateMany(
      { setNumber },
      { $set: { status: newStatus } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Set not found" });
    }

    res.json({ message: `Set ${setNumber} updated to ${newStatus}`, result });
  } catch (err) {
    console.error("Error updating set status:", err);
    res.status(500).json({ error: "Server error" });
  }
};
