// UserReports.jsx
import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/**
 * Utility: convert array of objects to CSV and trigger browser download
 */
function downloadCSV(rows = [], filename = "report.csv") {
  if (!rows || rows.length === 0) {
    const blob = new Blob(["No data"], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    link.click();
    return;
  }

  const headerKeys = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set())
  );

  const escapeCell = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (/[,"\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csvRows = [];
  csvRows.push(headerKeys.join(","));
  for (const row of rows) {
    csvRows.push(headerKeys.map((k) => escapeCell(row[k])).join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function UserReport() {
  const API_URL = "http://localhost:4000/api/admin/users"; // adjust if needed
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Fetch error ${res.status}`);
      }
      const json = await res.json();
      const normalized = (Array.isArray(json) ? json : []).map((u) => ({
        id: u._id ?? u.id ?? "",
        name: u.name ?? u.email ?? "",
        contact: u.phone ?? u.contact ?? "-",
        invoices: u.invoices ?? [],
      }));
      setData(normalized);
      setFiltered(normalized);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search
  useEffect(() => {
    if (!search) {
      setFiltered(data);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      data.filter(
        (d) =>
          String(d.name).toLowerCase().includes(q) ||
          String(d.id).toLowerCase().includes(q) ||
          String(d.contact || "").toLowerCase().includes(q)
      )
    );
  }, [search, data]);

  // Computed summary
  const totalUsers = data.length;
  const totalInvoices = data.reduce((acc, u) => acc + (u.invoices?.length || 0), 0);
  const totalProducts = data.reduce(
    (acc, u) =>
      acc +
      (u.invoices || []).reduce(
        (sum, inv) => sum + (inv.products?.length || 0),
        0
      ),
    0
  );

  // 🧾 DOWNLOAD PER USER — with product-level details
  const handleDownloadUser = (user) => {
    const rows = [];

    (user.invoices || []).forEach((inv) => {
      if (Array.isArray(inv.products) && inv.products.length > 0) {
        inv.products.forEach((p) => {
          rows.push({
            User_ID: user.id,
            User_Name: user.name,
            Contact: user.contact,
            Invoice_ID: inv._id,
            Invoice_Number: inv.invoiceNumber,
            Set_Number: inv.setNumber,
            Customer_Name: inv.customerName,
            Status: inv.status,
            Created_At: inv.createdAt
              ? new Date(inv.createdAt).toLocaleString()
              : "N/A",
            Product_Name: p.name,
            Product_Serial: p.serial,
            Product_Qty: p.qty,
            Product_Rate: p.rate,
            Product_Discount: p.discount,
            Product_Amount: (p.qty || 0) * (p.rate || 0) - (p.discount || 0),
          });
        });
      } else {
        rows.push({
          User_ID: user.id,
          User_Name: user.name,
          Contact: user.contact,
          Invoice_ID: inv._id,
          Invoice_Number: inv.invoiceNumber,
          Set_Number: inv.setNumber,
          Customer_Name: inv.customerName,
          Status: inv.status,
          Created_At: inv.createdAt
            ? new Date(inv.createdAt).toLocaleString()
            : "N/A",
          Product_Name: "N/A",
          Product_Serial: "N/A",
          Product_Qty: 0,
          Product_Rate: 0,
          Product_Discount: 0,
          Product_Amount: 0,
        });
      }
    });

    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadCSV(rows, `user-${user.id}-invoices-products-${ts}.csv`);
  };

  // 🧾 DOWNLOAD ALL USERS — includes products for everyone
  const handleDownloadAll = () => {
    const rows = [];

    data.forEach((user) => {
      (user.invoices || []).forEach((inv) => {
        if (Array.isArray(inv.products) && inv.products.length > 0) {
          inv.products.forEach((p) => {
            rows.push({
              User_ID: user.id,
              User_Name: user.name,
              Contact: user.contact,
              Invoice_ID: inv._id,
              Invoice_Number: inv.invoiceNumber,
              Set_Number: inv.setNumber,
              Customer_Name: inv.customerName,
              Status: inv.status,
              Created_At: inv.createdAt
                ? new Date(inv.createdAt).toLocaleString()
                : "N/A",
              Product_Name: p.name,
              Product_Serial: p.serial,
              Product_Qty: p.qty,
              Product_Rate: p.rate,
              Product_Discount: p.discount,
              Product_Amount: (p.qty || 0) * (p.rate || 0) - (p.discount || 0),
            });
          });
        } else {
          rows.push({
            User_ID: user.id,
            User_Name: user.name,
            Contact: user.contact,
            Invoice_ID: inv._id,
            Invoice_Number: inv.invoiceNumber,
            Set_Number: inv.setNumber,
            Customer_Name: inv.customerName,
            Status: inv.status,
            Created_At: inv.createdAt
              ? new Date(inv.createdAt).toLocaleString()
              : "N/A",
            Product_Name: "N/A",
            Product_Serial: "N/A",
            Product_Qty: 0,
            Product_Rate: 0,
            Product_Discount: 0,
            Product_Amount: 0,
          });
        }
      });
    });

    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadCSV(rows, `all-users-invoices-products-${ts}.csv`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-6 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>📊</span> <span>User Reports - Sets and Invoices</span>
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Comprehensive overview of user activities, invoices, and products
          </p>
        </div>

        {/* Summary cards & Download all */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 w-40 text-center">
              <div className="text-xs text-gray-300">TOTAL USERS</div>
              <div className="text-2xl font-bold mt-1">{totalUsers}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 w-40 text-center">
              <div className="text-xs text-gray-300">TOTAL INVOICES</div>
              <div className="text-2xl font-bold mt-1">{totalInvoices}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 w-40 text-center">
              <div className="text-xs text-gray-300">TOTAL PRODUCTS</div>
              <div className="text-2xl font-bold mt-1">{totalProducts}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadAll}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center gap-2 text-sm"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Download All Reports
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 flex justify-end">
          <div className="relative w-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name / id / contact..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder-gray-400 text-white outline-none"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-white/10 text-gray-300 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email / Contact</th>
                <th className="px-4 py-3 text-center">Invoices</th>
                <th className="px-4 py-3 text-center">Products</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-red-400">
                    Error: {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No users found
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filtered.map((u, idx) => {
                  const productCount = (u.invoices || []).reduce(
                    (sum, inv) => sum + (inv.products?.length || 0),
                    0
                  );
                  return (
                    <tr
                      key={u.id || idx}
                      className="border-t border-white/10 text-gray-200"
                    >
                      <td className="px-4 py-3">{u.id}</td>
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.contact}</td>
                      <td className="px-4 py-3 text-center">
                        {u.invoices?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {productCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDownloadUser(u)}
                          className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md text-xs flex items-center gap-2"
                        >
                          <MagnifyingGlassIcon className="h-4 w-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          Tip: Click “Download All Reports” to get a CSV including all invoices
          and products.
        </div>
      </div>
    </div>
  );
}
