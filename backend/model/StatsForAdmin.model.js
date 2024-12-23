import mongoose from "mongoose";

const adminStatsSchema = new mongoose.Schema({
  totalUsers: {
    type: Number,
    required: true,
  },
  totalAmountRecived: {
    type: Number,
  },
  totalUsersBalance: {
    type: Number,
    required: true,
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
    required: true,
  },
  OrdersCompleted: {
    type: Number,
    required: true,
  },
  OrdersRefunded: {
    type: Number,
    required: true,
  },
  OrdersInProgress: {
    type: Number,
    required: true,
  },
  OrdersProcessing: {
    type: Number,
    required: true,
  },
  OrdersPending: {
    type: Number,
    required: true,
  },
  OrdersPartial: {
    type: Number,
    required: true,
  },
  OrdersCanceled: {
    type: Number,
    required: true,
  },
  totalTickets: {
    type: Number,
    required: true,
  },
  pendingTickets: {
    type: Number,
    required: true,
  },
  ClosedTickets: {
    type: Number,
    required: true,
  },
  AnsweredTickets: {
    type: Number,
    required: true,
  },

  last5User: {
    type: Array,
    required: true,
  },
  last5Orders: {
    type: Array,
    required: true,
  },
  top5BestSellers: {
    type: Array,
    required: true,
  },
});

// Create and export the model
const AdminStats = mongoose.model("AdminStats", adminStatsSchema);
export default AdminStats;
