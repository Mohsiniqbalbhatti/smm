import mongoose from "mongoose";

// Define the Counter schema for keeping track of the `serviceId` count
const CounterTicketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    required: true,
  },
});

const CounterTicket = mongoose.model("CounterTicket", CounterTicketSchema);

export default CounterTicket;
