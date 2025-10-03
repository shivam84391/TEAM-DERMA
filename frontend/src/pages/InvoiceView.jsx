import React from "react";

export default function InvoiceView({ invoice }) {
  return (
    <div className="bg-white rounded-xl shadow-lg w-full p-6 text-black">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">INVOICE</h2>
          <p><b>From:</b> {invoice.createdBy}</p>
          <p><b>Set:</b> {invoice.setNumber}</p>
        </div>
        <div className="text-right">
          <p><b>Invoice No:</b> {invoice.invoiceNo}</p>
          <p><b>Date:</b> {new Date(invoice.date).toLocaleDateString()}</p>
          <p><b>Status:</b> {invoice.status}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex justify-between mb-6 text-sm">
        <div>
          <p><b>Bill To:</b></p>
          <p>{invoice.customerName}</p>
        </div>
        <div className="text-right">
          <p><b>Email:</b> {invoice.createdBy}</p>
        </div>
      </div>

      {/* Products Table */}
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
          {invoice.products.map((p, i) => (
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

      {/* Totals */}
      <div className="text-right space-y-1">
        <p>Subtotal: ₹{invoice.subtotal}</p>
        <p>Discount: ₹{invoice.discount}</p>
        <p className="font-bold">Total: ₹{invoice.total}</p>
      </div>
    </div>
  );
}
