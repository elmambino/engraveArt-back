import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  name: { type: String, required: true },
  text: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Review", ReviewSchema);
