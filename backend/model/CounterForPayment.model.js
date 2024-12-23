import mongoose from "mongoose";

// Define the Counter schema for keeping track of the `serviceId` count
const CounterPaymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
});

const CounterPayment = mongoose.model("CounterPayment", CounterPaymentSchema);

export default CounterPayment;
