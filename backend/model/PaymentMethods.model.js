import mongoose from "mongoose";

const PaymentMethodsSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  newUser: {
    type: Boolean,
    default: true,
  },
  params: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  userParams: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  routeName: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
  },
});

export default mongoose.model("PaymentMethods", PaymentMethodsSchema);
