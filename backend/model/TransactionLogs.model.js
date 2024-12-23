import mongoose from "mongoose";
import CounterPayment from "./CounterForPayment.model.js";

// Define the transactionsLogs schema
const transactionsLogsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  paymentId: { type: String, unique: true }, // Unique auto-generated Payment ID
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  type: { type: String, default: "deposit" },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to auto-generate payment ID
transactionsLogsSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const counter = await CounterPayment.findOneAndUpdate(
        { name: "PaymentId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.paymentId = counter.seq + 1000; // Format: PAY-1001, PAY-1002, etc.
    }
    next();
  } catch (error) {
    next(error); // Handle errors during pre-save
  }
});

// Create and export the Transaction model
const Transaction = mongoose.model("Transaction", transactionsLogsSchema);
export default Transaction;
