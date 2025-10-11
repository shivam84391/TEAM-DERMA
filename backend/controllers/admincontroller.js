import Invoice from "../models/invoices_schema.js";
import User from "../models/user_models.js";
import Punch from "../models/punch_models.js";

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
        contact: c.phone || "",
        invoices: userInvoices,
      };
    });

    res.status(200).json(customersWithInvoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false }).select(
      "-password"
    ); // exclude password
    res.status(200).json(pendingUsers);
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH approve/reject user
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params; // user id
    const { approve } = req.body; // true = approve, false = reject

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (approve) {
      user.isApproved = true;
      await user.save();
      return res.status(200).json({ message: "User approved successfully" });
    } else {
      await User.findByIdAndDelete(id); // reject = delete user
      return res.status(200).json({ message: "User rejected and deleted" });
    }
  } catch (err) {
    console.error("Error approving/rejecting user:", err);
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
      _id: invoice._id,
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
export const getUserDetailsWithInvoices = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user details
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all invoices for this user
    const invoices = await Invoice.find({ createdBy: userId }).sort({ createdAt: -1 });

    // Calculate summary stats
    const totalInvoices = invoices.length;
    const approvedCount = invoices.filter((i) => i.status === "Approved").length;
    const pendingCount = invoices.filter((i) => i.status === "Pending").length;
    const rejectedCount = invoices.filter((i) => i.status === "Rejected").length;
    const totalAmount = invoices.reduce((sum, inv) => {
      const subtotal = inv.products.reduce(
        (acc, p) => acc + (p.rate * p.qty - p.discount),
        0
      );
      return sum + subtotal;
    }, 0);

    return res.status(200).json({
      user,
      stats: {
        totalInvoices,
        approvedCount,
        pendingCount,
        rejectedCount,
        totalAmount,
      },
      invoices,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; // frontend sends edited invoice details
    console.log("Updating invoice:", id, updatedData);

    // Find the existing invoice
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Update editable fields
    invoice.invoiceNumber = updatedData.invoiceNo || invoice.invoiceNumber;
    invoice.customerName = updatedData.customerName || invoice.customerName;
    invoice.setNumber = updatedData.setNumber || invoice.setNumber;
    invoice.status = updatedData.status || invoice.status;
    invoice.date = updatedData.date ? new Date(updatedData.date) : invoice.date;

    // Update product details if provided
    if (Array.isArray(updatedData.products)) {
      invoice.products = updatedData.products.map((p) => ({
        productId: p.productId || "",
        name: p.name,
        serial: p.serial,
        rate: Number(p.rate),
        qty: Number(p.qty),
        discount: Number(p.discount),
        type: p.type || "product",
      }));
    }

    await invoice.save();

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params; // invoice ID
    const { status } = req.body; // new status: "Approved", "Rejected", etc.

    const validStatuses = ["Approved", "Rejected", "Pending", "On Hold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = status;
    await invoice.save();

    res.status(200).json({ message: `Invoice updated to ${status}`, invoice });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getAllPunchRecords = async (req, res) => {
  try {
    const punches = await Punch.find()
      .populate("userId", "fullName email")
      .sort({ punchInTime: -1 });

    res.status(200).json(punches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error: error.message });
  }
};

// ✅ Approve or Reject Punch Record
export const updatePunchStatus = async (req, res) => {
  try {
    const { punchId } = req.params;
    const { approved } = req.body; // true or false

    const punch = await Punch.findById(punchId);
    if (!punch) return res.status(404).json({ message: "Punch record not found!" });

    punch.adminApproved = approved;
    await punch.save();

    res.status(200).json({
      message: approved ? "Punch record approved" : "Punch record rejected",
      punch,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating punch record", error: error.message });
  }
};
export const getPunchesToday = async (req, res) => {
  try {
    // Get today's start and end time
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch all users
    const users = await User.find();

    // Fetch all punches for today
    const punches = await Punch.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("userId", "name email");

    // Map punches by userId
    const punchMap = {};
    punches.forEach((p) => {
      const totalTime =
        p.punchInTime && p.punchOutTime
          ? Math.floor((new Date(p.punchOutTime) - new Date(p.punchInTime)) / 1000)
          : null;

      punchMap[p.userId._id.toString()] = {
        user: p.userId,
        punchInTime: p.punchInTime,
        punchOutTime: p.punchOutTime,
        totalTime,
      };
    });

    // Combine all users (even those without punch data)
    const result = users.map((u) => {
  const punch = punchMap[u._id.toString()];
  return (
    punch || {
      user: { _id: u._id, name: u.name, email: u.email }, // add _id here
      punchInTime: null,
      punchOutTime: null,
      totalTime: null,
    }
  );
});


    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching punches:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getUserPunchesLast30Days = async (req, res) => {
  try {
    const { userId } = req.params;

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch punches of this user in last 30 days
    const punches = await Punch.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: -1 }) // latest first
      .lean();

    // Optional: Calculate totalTime (if not stored in DB)
    const withDuration = punches.map((p) => {
      let totalTime = null;
      if (p.punchInTime && p.punchOutTime) {
        totalTime = Math.floor(
          (new Date(p.punchOutTime) - new Date(p.punchInTime)) / 1000
        );
      }
      return { ...p, totalTime };
    });

    res.json(withDuration);
  } catch (err) {
    console.error("Error fetching punches:", err);
    res.status(500).json({ message: "Server error while fetching user punches" });
  }
};