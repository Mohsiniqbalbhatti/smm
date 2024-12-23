import mongoose from "mongoose";

// Define the Counter schema for keeping track of the `serviceId` count
const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    default: "announcement",
    enum: ["announcement", "newService", "disabledService", "updatedService"],
  },
  title: {
    type: String,
    required: true,
    default: "New Notification",
  },
  status: {
    type: String,
    required: true,
    default: "active",
    enum: ["active", "inactive"],
  },
  description: {
    type: String,
    required: true,
    default: "New notification message",
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  expiryDate: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value >= Date.now(),
      message: "Expiry date must be after start date",
    },
  },
});

const Notifications = mongoose.model("Notifications", NotificationSchema);

export default Notifications;
