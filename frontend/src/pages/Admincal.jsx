import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Admincal() {
  const [search, setSearch] = useState("");
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all invoice sets
  const fetchInvoiceSets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/admin/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // ✅ Sort by date (latest first)
      const sorted = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setSets(sorted);
    } catch (err) {
      console.error("Error fetching invoice sets:", err);
    }
  };

  useEffect(() => {
    fetchInvoiceSets();
  }, []);

  // Fetch invoice details
  const fetchInvoiceDetails = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/admin/invoice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedInvoice(data);
    } catch (err) {
      console.error("Error fetching invoice details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update set status
  const updateSetStatus = async (setNumber, action) => {
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:4000/api/admin/invoices/${setNumber}`;
      if (action === "approve") url += "/approve";
      if (action === "reject") url += "/reject";
      if (action === "hold") url += "/hold";

      await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchInvoiceSets();
    } catch (err) {
      console.error("Error updating set status:", err);
    }
  };

  // ✅ Search based on set number
  const filtered = sets.filter((s) =>
    s.setNumber?.toString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Back to Dashboard Button */}
      <button
        className="mb-4 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold"
        onClick={() => navigate("/admin/dashboard")}
      >
        ← Back to Dashboard
      </button>

      {/* Heading + Search */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <span>📑</span> <span>Invoice Sets</span>
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by set number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 
                       placeholder-gray-400 text-white focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* === APPROVAL CRITERIA BOX === */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 mb-6 text-sm leading-relaxed">
        <h2 className="font-semibold text-lg mb-2 text-purple-300">
          Approval Criteria
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li>
            ✅ <strong>Approved Set:</strong> All invoices meet quality and
            format standards (minimum 20 valid invoices) →{" "}
            <strong>₹100 per approved set</strong>.
          </li>
          <li>
            🟡 <strong>On Hold Set:</strong> 2 or 3 invalid invoices, fake/dummy
            data, duplicate, or minor format issue →{" "}
            <strong>₹2 per valid invoice</strong> in the set.
          </li>
          <li>
            ❌ <strong>Rejected Set:</strong> 4 or more invalid invoices,
            fake/dummy data, duplicate, or major format issue →{" "}
            <strong>₹0 (No payment)</strong>.
          </li>
        </ul>
      </div>

      {/* === TABLE === */}
      <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-white/10 text-gray-300 text-left">
              <th className="px-4 py-3">Set Number</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Invoices</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => (
              <tr
                key={idx}
                className="border-t border-white/10 text-gray-200 hover:bg-white/10 transition"
              >
                <td className="px-4 py-3">{s.setNumber}</td>
                <td className="px-4 py-3">{s.user}</td>
                <td className="px-4 py-3">{s.date}</td>
                <td className="px-4 py-3">{s.status}</td>
                <td className="px-4 py-3">{s.invoices.length}</td>

                {/* Actions */}
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1 rounded-md text-xs bg-blue-500 hover:bg-blue-700"
                    onClick={() => {
                      setSelectedSet(s);
                      setSelectedInvoice(null);
                    }}
                  >
                    View
                  </button>

                  <button
                    className="px-3 py-1 rounded-md text-xs bg-green-600 hover:bg-green-800"
                    onClick={() => updateSetStatus(s.setNumber, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 rounded-md text-xs bg-yellow-600 hover:bg-yellow-800"
                    onClick={() => updateSetStatus(s.setNumber, "hold")}
                  >
                    Hold
                  </button>
                  <button
                    className="px-3 py-1 rounded-md text-xs bg-red-600 hover:bg-red-800"
                    onClick={() => updateSetStatus(s.setNumber, "reject")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === MODAL FOR SET DETAILS === */}
      {selectedSet && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-3/4 max-h-[90vh] overflow-y-auto p-6 text-black relative">
            <button
              onClick={() => {
                setSelectedSet(null);
                setSelectedInvoice(null);
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              Invoices in Set {selectedSet.setNumber}
            </h2>

            {!selectedInvoice && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedSet.invoices.map((invId, i) => (
                  <button
                    key={i}
                    className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm"
                    onClick={() => fetchInvoiceDetails(invId)}
                  >
                    Invoice #{invId}
                  </button>
                ))}
              </div>
            )}

            {selectedInvoice && (
              <>
                {loading ? (
                  <p className="text-center text-gray-500">Loading...</p>
                ) : (
                  <>
                    <div className="flex justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">INVOICE</h2>
                        <p>
                          <b>From:</b> {selectedInvoice.createdBy}
                        </p>
                        <p>
                          <b>Set:</b> {selectedInvoice.setNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>
                          <b>Invoice No:</b> {selectedInvoice.invoiceNo}
                        </p>
                        <p>
                          <b>Date:</b>{" "}
                          {new Date(selectedInvoice.date).toLocaleDateString()}
                        </p>
                        <p>
                          <b>Status:</b> {selectedInvoice.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between mb-6 text-sm">
                      <div>
                        <p>
                          <b>Bill To:</b>
                        </p>
                        <p>{selectedInvoice.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p>
                          <b>Email:</b> {selectedInvoice.createdBy}
                        </p>
                      </div>
                    </div>

                    <table className="min-w-full text-sm border border-gray-300 rounded-lg mb-6">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2">Product</th>
                          <th className="px-3 py-2">Serial</th>
                          <th className="px-3 py-2">Rate</th>
                          <th className="px-3 py-2">Qty</th>
                          <th className="px-3 py-2">Discount</th>
                          <th className="px-3 py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.products.map((p, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{p.name}</td>
                            <td className="px-3 py-2">{p.serial}</td>
                            <td className="px-3 py-2">₹{p.rate}</td>
                            <td className="px-3 py-2">{p.qty}</td>
                            <td className="px-3 py-2">₹{p.discount}</td>
                            <td className="px-3 py-2">₹{p.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="text-right space-y-1">
                      <p>Subtotal: ₹{selectedInvoice.subtotal}</p>
                      <p>Discount: ₹{selectedInvoice.discount}</p>
                      <p className="font-bold">
                        Total: ₹{selectedInvoice.total}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="mt-4 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                      Back to List
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
