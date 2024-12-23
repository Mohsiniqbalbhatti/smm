import mongoose from "mongoose";
import CounterOrderAPI from "./OrderByAPICounter.model.js";

const OrderByAPIKeySchema = new mongoose.Schema({
  // User-related information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userApiKey: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },

  // API-related information
  apiName: {
    type: String,
    required: true,
  },
  externalApiServiceId: {
    type: Number,
    required: true,
  },
  externalApiRate: {
    type: Number,
  },
  orderIdAPI: {
    type: Number,
  },
  chargeByApi: {
    type: Number,
    default: "",
  },

  // Service-related information
  pannelServiceId: {
    type: Number,
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
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
  link: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  refill: {
    type: Boolean,
    default: false,
  },
  cancel: {
    type: Boolean,
    default: false,
  },
  dripfeed: {
    type: Boolean,
    default: false,
  },
  intervals: {
    type: String,
    default: null,
  },
  runs: {
    type: String,
    default: null,
  },

  // Order details that will be sent to user on request
  order: {
    type: Number,
  },
  startCount: {
    type: Number,
    default: 0,
  },
  remain: {
    type: Number,
    default: function () {
      return this.quantity;
    },
  },
  chargeByUs: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  orderStatus: {
    type: String,
    default: "Pending",
  },

  // errors  and responses
  error: {
    type: String,
    default: null,
  },
  refillResponse: {
    type: Object,
    default: {},
  },
  cancelResponse: {
    type: Object,
    default: {},
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-increment order number
OrderByAPIKeySchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const counter = await CounterOrderAPI.findOneAndUpdate(
        { name: "order" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.order = counter.seq + 1234321; // Assign unique incremented order number
    }
    next();
  } catch (error) {
    next(error); // Pass errors to the next middleware
  }
});

// Indexes for performance
OrderByAPIKeySchema.index({ user: 1 });
OrderByAPIKeySchema.index({ userApiKey: 1 });
OrderByAPIKeySchema.index({ orderIdAPI: 1 });

export default mongoose.model("OrderByAPIKey", OrderByAPIKeySchema);
