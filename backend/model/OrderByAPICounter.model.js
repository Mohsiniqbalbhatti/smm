import mongoose from "mongoose";

// Define the Counter schema for keeping track of the `serviceId` count
const CounterOrderByAPI = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
});

const CounterOrderAPI = mongoose.model("CounterOrderAPI", CounterOrderByAPI);

export default CounterOrderAPI;
