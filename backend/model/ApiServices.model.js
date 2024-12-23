import mongoose from "mongoose";
import Counter from "./Counter.model.js"; // Import the Counter model

// Define the ApiService schema
const ApiServiceSchema = new mongoose.Schema(
  {
    ApiName: {
      type: String,
      required: true,
    },
    ApiStatus: {
      type: String,
    },
    catStatus: {
      type: String,
    },
    serviceId: {
      type: Number,
      unique: true, // Ensure serviceId is unique
    },
    service: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    originalRate: {
      // Field for original rate
      type: Number,
      required: [true, "Original rate is required"],
    },
    rate: {
      type: String,
    },
    rateIncreased: {
      type: String,
      required: true,
    },
    min: {
      type: String,
    },
    max: {
      type: Number,
    },
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    dripfeed: {
      type: Boolean,
    },
    refill: {
      type: Boolean,
    },
    cancel: {
      type: Boolean,
    },
    average_time: {
      type: Number,
    },
    status: {
      type: String,
      default: "active",
    },
    updatedAt: {
      type: Date,
    },
  },
  { strict: false }
);

// Pre-save hook to auto-increment serviceId
ApiServiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Only increment for new services
    const counter = await Counter.findOneAndUpdate(
      { name: "serviceId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.serviceId = counter.seq + 100; // Start serviceId from 100
  }
  next();
});

export default mongoose.model("ApiService", ApiServiceSchema);
