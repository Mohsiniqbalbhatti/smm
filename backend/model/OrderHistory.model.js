import mongoose from "mongoose";
import CounterHistory from "./CounterForOrderHistory.model.js";

const OrderHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ApiName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  orderId: {
    type: Number,
    unique: true, // Ensure uniqueness
  },
  orderIdAPi: {
    type: Number, // From external API
  },
  serviceId: {
    type: Number,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    default: "Pending",
    enum: [
      "Pending",
      "Completed",
      "In progress",
      "Canceled",
      "Parital",
      "Processing",
      "Refunded",
    ],
  },
  refill: {
    type: Boolean,
  },
  cancel: {
    type: Boolean,
  },
  link: {
    type: String,
    required: true,
  },
  rate: {
    type: String,
    default: "0",
  },
  chargeAPI: {
    type: String,
    default: "",
  },
  currency: {
    type: String,
    default: "USD",
  },
  startCount: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    required: true,
  },
  remain: {
    type: Number,
    default: function () {
      return this.quantity;
    },
  },
  dripfeed: {
    type: Boolean,
  },
  intervals: {
    type: String,
  },
  runs: {
    type: String,
  },
  error: {
    type: String,
    default: "No Error",
  },
  ApiRate: {
    type: String,
  },
  pannelRate: {
    type: String,
  },
  min: {
    type: String,
  },
  max: {
    type: Number,
  },
  refillResponse: {
    type: Object,
    default: {},
  },
  CancelResponse: {
    type: Object,
    default: {},
  },
  profit: {
    type: Number,
  },
});

// Pre-update hook to calculate profit before updating the document
OrderHistorySchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const docToUpdate = await this.model.findOne(this.getQuery());

  // Track if rate or chargeAPI is being updated
  const oldRate = docToUpdate.rate;
  const oldChargeAPI = docToUpdate.chargeAPI;

  const newRate = update.rate || oldRate;
  const newChargeAPI = update.chargeAPI || oldChargeAPI;

  // If the rate or chargeAPI has changed, update the profit
  if (oldRate !== newRate || oldChargeAPI !== newChargeAPI) {
    // Directly calculate the profit as rate - chargeAPI
    const newProfit = parseFloat(newRate) - parseFloat(newChargeAPI);

    // Update the profit field
    update.profit = newProfit.toFixed(6);
  }

  next();
});

// Pre-save hook to auto-increment orderId
OrderHistorySchema.pre("save", async function (next) {
  try {
    // Handling the auto-increment of the orderId for new orders
    if (this.isNew) {
      const counter = await CounterHistory.findOneAndUpdate(
        { name: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderId = counter.seq + 1000; // Set orderId starting from 1000
    }

    // Proceed with saving
    next();
  } catch (error) {
    next(error); // Handle any errors during the pre-save hook
  }
});

export default mongoose.model("OrderHistory", OrderHistorySchema);
