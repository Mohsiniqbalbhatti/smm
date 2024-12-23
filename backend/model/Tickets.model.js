import mongoose from "mongoose";
import CounterTicket from "./TicketsCounter.model.js"; // Assuming you have a model for this

const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["new", "pending", "closed", "answered"],
    default: "pending",
  },
  subject: { type: String, required: true }, // e.g., 'order', 'payment', 'service', 'other'
  subCategory: { type: String }, // e.g., 'refill', 'cancellation', 'speedup', etc.
  referenceId: { type: String }, // Stores orderId or paymentId based on subject
  userMessages: [
    {
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  adminMessages: [
    {
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to generate the ticketId automatically
TicketSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Check and update the counter
      const counter = await CounterTicket.findOneAndUpdate(
        { name: "ticketId" }, // Assuming you're using a document to track counters
        { $inc: { seq: 1 } }, // Incrementing the sequence
        { new: true, upsert: true } // Create the document if it doesn't exist
      );

      if (counter) {
        this.ticketId = counter.seq + 100; // Use the incremented value and add 100
        next(); // Proceed to save
      } else {
        next(new Error("Failed to generate ticketId")); // Handle case if no counter found
      }
    } catch (error) {
      next(error); // Handle other errors
    }
  } else {
    next(); // If not a new document, continue without modifying ticketId
  }
});

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;
