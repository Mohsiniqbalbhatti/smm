import mongoose from "mongoose";

// Define the Counter schema for keeping track of the `serviceId` count
const CounterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
});

const Counter = mongoose.model("Counter", CounterSchema);

export default Counter;
