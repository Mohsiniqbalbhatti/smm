import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  whatsapp: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  balance: {
    type: Number,
    default: 0,
  },
  spent: {
    type: Number,
    default: 0,
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[A-Za-z0-9]{32}$/.test(v);
      },
      message: "API Key should be a 32-character alphanumeric string.",
    },
  },
  referral_id: {
    type: String,
    unique: true,
    default: function () {
      return this.userName; // Assigns userName as default
    },
  },
  affiliate_bal_transferred: {
    type: Number,
    default: 0,
  },
  affiliate_bal_available: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderHistory" }],
  status: {
    type: String,
    default: "active",
  },
});

UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("User", UserSchema);
