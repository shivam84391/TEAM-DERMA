import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
export default function CreateInvoice() {
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    productId: "",
    productName: "",
    serialNumber: "",
    rate: "",
    quantity: "",
    discount: "",
  });

  const [customer, setCustomer] = useState({
    invoiceNumber: "",
    setNumber: "",
    category: "",
    name: "",
    email: "",
    area: "",
    city: "",
    state: "",
    pinCode: "",
  });

  // 🚫 Disable copy/paste/cut/drag/drop/right-click globally for all inputs
  useEffect(() => {
    const inputs = document.querySelectorAll("input");

    const preventAction = (e) => e.preventDefault();

    inputs.forEach((input) => {
      input.addEventListener("paste", preventAction);
      input.addEventListener("copy", preventAction);
      input.addEventListener("cut", preventAction);
      input.addEventListener("drop", preventAction);
      input.addEventListener("contextmenu", preventAction);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("paste", preventAction);
        input.removeEventListener("copy", preventAction);
        input.removeEventListener("cut", preventAction);
        input.removeEventListener("drop", preventAction);
        input.removeEventListener("contextmenu", preventAction);
      });
    };
  }, []);

  // Handle product input changes
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  // Add product to list
  const handleAddProduct = () => {
    const { productId, productName, rate, quantity } = productForm;
    if (!productId || !productName || !rate || !quantity) {
      alert("Please fill Product ID, Name, Rate, and Quantity.");
      return;
    }

    setProducts([...products, { ...productForm }]);
    setProductForm({
      productId: "",
      productName: "",
      serialNumber: "",
      rate: "",
      quantity: "",
      discount: "",
    });
  };

  // Handle customer input changes
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };

  const handleshowProduct = () => {
    alert(`Product List \n\n` + JSON.stringify(products, null, 2));
  };

  // Submit invoice
  const handleSubmitInvoice = async () => {
    const requiredCustomerFields = ["invoiceNumber", "setNumber", "category", "name"];
    for (let key of requiredCustomerFields) {
      if (!customer[key]) {
        alert(`Please fill ${key}`);
        return;
      }
    }

    if (products.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    const invoiceJSON = {
      customerDetails: customer,
      products: products.map((p) => ({
        ...p,
        rate: Number(p.rate),
        quantity: Number(p.quantity),
        discount: Number(p.discount) || 0,
      })),
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Please login first.");
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/users/addinvoice`,
        invoiceJSON,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(`Invoice submitted in Set ${res.data.invoice.setNumber}`);
      console.log("Saved Invoice:", res.data.invoice);

      setCustomer({
        invoiceNumber: "",
        setNumber: "",
        category: "",
        name: "",
        email: "",
        area: "",
        city: "",
        state: "",
        pinCode: "",
      });
      setProducts([]);
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Failed to submit invoice. Please try again.");
    }
  };

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
            <input type="text" placeholder="Product ID" name="productId" value={productForm.productId} onChange={handleProductChange} className="input-field" />
            <input type="text" placeholder="Product Name" name="productName" value={productForm.productName} onChange={handleProductChange} className="input-field" />
            <input type="text" placeholder="Serial Number" name="serialNumber" value={productForm.serialNumber} onChange={handleProductChange} className="input-field" />
            <input type="number" placeholder="Rate" name="rate" value={productForm.rate} onChange={handleProductChange} className="input-field" />
            <input type="number" placeholder="Quantity" name="quantity" value={productForm.quantity} onChange={handleProductChange} className="input-field" />
            <input type="number" placeholder="Discount" name="discount" value={productForm.discount} onChange={handleProductChange} className="input-field" />
          </div>

          <div className="flex gap-4 mb-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 bg-purple-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-800 transition"
              onClick={handleAddProduct}
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Add Product</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition"
              onClick={handleshowProduct}
            >
              <span>Show Products</span>
            </motion.button>
          </div>

          {products.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Serial</th>
                    <th className="px-4 py-2 border">Rate</th>
                    <th className="px-4 py-2 border">Qty</th>
                    <th className="px-4 py-2 border">Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">{p.productId}</td>
                      <td className="px-4 py-2 border">{p.productName}</td>
                      <td className="px-4 py-2 border">{p.serialNumber}</td>
                      <td className="px-4 py-2 border">{p.rate}</td>
                      <td className="px-4 py-2 border">{p.quantity}</td>
                      <td className="px-4 py-2 border">{p.discount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <input type="text" placeholder="Invoice Number *" name="invoiceNumber" value={customer.invoiceNumber} onChange={handleCustomerChange} className="input-field" />
            <input type="text" placeholder="Set Number *" name="setNumber" value={customer.setNumber} onChange={handleCustomerChange} className="input-field" />
            <input type="text" placeholder="Category *" name="category" value={customer.category} onChange={handleCustomerChange} className="input-field" />
            <input type="text" placeholder="Customer Name *" name="name" value={customer.name} onChange={handleCustomerChange} className="input-field" />
            <input type="email" placeholder="Email *" name="email" value={customer.email} onChange={handleCustomerChange} className="input-field" />
            <input type="text" placeholder="Area *" name="area" value={customer.area} onChange={handleCustomerChange} className="input-field" />
            <input type="text" placeholder="City *" name="city" value={customer.city} onChange={handleCustomerChange} className="input-field" />
            <input type="text" placeholder="State *" name="state" value={customer.state} onChange={handleCustomerChange} className="input-field" />
            <input type="text" placeholder="Pin Code *" name="pinCode" value={customer.pinCode} onChange={handleCustomerChange} className="input-field" />
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-green-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-700 transition flex items-center space-x-2"
            onClick={handleSubmitInvoice}
          >
            <span>✅ Submit Invoice</span>
          </motion.button>
        </motion.div>

        <div className="flex justify-center">
          <Link to="/dashboard">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-black text-white px-6 py-2 rounded-md shadow hover:bg-gray-800 transition">
              Back to Dashboard
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
