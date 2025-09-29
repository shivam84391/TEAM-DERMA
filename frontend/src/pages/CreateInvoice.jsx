import React from "react";
import { motion } from "framer-motion";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

export default function CreateInvoice() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        <h1 className="text-2xl font-bold mb-6">Create Invoice</h1>

        {/* Product Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Product ID" className="input-field" />
            <input type="text" placeholder="Product Name" className="input-field" />
            <input type="text" placeholder="Serial Number" className="input-field" />
            <input type="number" placeholder="Rate" className="input-field" />
            <input type="number" placeholder="Quantity" defaultValue={1} className="input-field" />
            <input type="number" placeholder="Discount Amount" defaultValue={0} className="input-field" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-purple-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-800 transition"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add Product</span>
          </motion.button>
        </motion.div>

        {/* Customer Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Invoice Number *" className="input-field" />
            <input type="text" placeholder="Set Number *" className="input-field" />
            <input type="text" placeholder="Category *" className="input-field" />
            <input type="text" placeholder="Customer Name *" className="input-field" />
            <input type="email" placeholder="Email *" className="input-field" />
            <input type="text" placeholder="Area *" className="input-field" />
            <input type="text" placeholder="City *" className="input-field" />
            <input type="text" placeholder="State *" className="input-field" />
            <input type="text" placeholder="Pin Code *" className="input-field" />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-green-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-700 transition flex items-center space-x-2"
          >
            <span>✅ Submit Invoice</span>
          </motion.button>
        </motion.div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white px-6 py-2 rounded-md shadow hover:bg-gray-800 transition"
            >
              Back to Dashboard
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/* ✅ Tailwind Utility for Inputs (You can put this in index.css or global.css)
   Or simply use the className inline like above */
