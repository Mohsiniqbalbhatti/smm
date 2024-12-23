import mongoose from "mongoose";

// Define the Counter schema for keeping track of the `serviceId` count
const CounterHistorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
});

const CounterHistory = mongoose.model("CounterHistory", CounterHistorySchema);

export default CounterHistory;
