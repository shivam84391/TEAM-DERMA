import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    products: [
        {
            productId: { type:String, required: true },
            name: { type: String, required: true },
            serial: { type: String },
            rate: { type: Number, required: true },
            qty: { type: Number, default: 1, min: 1 },
            discount: { type: Number, default: 0, min: 0 },
            // type field is not required, so you can add it like this:
            type: { type: String }
        },
    ],
    setNumber: { type: String },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Invoice', invoiceSchema);
