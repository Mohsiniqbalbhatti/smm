import mongoose from "mongoose";

const adminStatsSchema = new mongoose.Schema({
  totalUsers: {
    type: Number,
  },
  totalAmountRecived: {
    type: Number,
  },
  totalUsersBalance: {
    type: Number,
  },
  totalProvidersBalance: {
    type: Number,
    default: 0,
  },
  totalProfit30Days: {
    type: Number,
    default: 0,
  },
  totalProfitToday: {
    type: Number,
  },
  totalOrders: {
    type: Number,
  },
  OrdersCompleted: {
    type: Number,
  },
  OrdersRefunded: {
    type: Number,
  },
  OrdersInProgress: {
    type: Number,
  },
  OrdersProcessing: {
    type: Number,
  },
  OrdersPending: {
    type: Number,
  },
  OrdersPartial: {
    type: Number,
  },
  OrdersCanceled: {
    type: Number,
  },
  totalTickets: {
    type: Number,
  },
  pendingTickets: {
    type: Number,
  },
  ClosedTickets: {
    type: Number,
  },
  AnsweredTickets: {
    type: Number,
  },
  last5User: {
    type: Array,
  },
  last5Orders: {
    type: Array,
  },
  top5BestSellers: {
    type: Array,
  },
});

// Create and export the model
const AdminStats = mongoose.model("AdminStats", adminStatsSchema);
export default AdminStats;
