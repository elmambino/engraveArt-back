import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  text: { type: String, required: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["new", "processing", "completed", "cancelled"],
    default: "new",
  },
});

export default mongoose.model("Order", OrderSchema);
