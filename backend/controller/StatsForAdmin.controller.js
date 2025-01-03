import Users from "../model/User.model.js";
import Orders from "../model/OrderHistory.model.js";
import AdminStats from "../model/StatsForAdmin.model.js";
import Providers from "../model/ApiList.model.js";
import Transactions from "../model/TransactionLogs.model.js";
import CurrencyRate from "../model/CurrencyConvertor.model.js";
import Ticket from "../model/Tickets.model.js";

export const getStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await Users.countDocuments();

    // Get the last 5 users sorted by creation date
    const last5User = await Users.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("userName email balance createdAt status");

    // Calculate the total balance of all users
    const totalUsersBalanceResult = await Users.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" }, // Sum up the balance field
        },
      },
    ]);

    const totalUsersBalance = totalUsersBalanceResult.length
      ? totalUsersBalanceResult[0].totalBalance
      : 0;

    // Get the last 5 orders sorted by creation date
    const last5Orders = await Orders.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "orderId userName serviceName ApiName link quantity createdAt orderStatus error"
      );

    // Calculate the total Orders
    const totalOrders = await Orders.countDocuments();

    // Log order statuses to check for discrepancies
    const orderStatuses = await Orders.distinct("orderStatus");

    // Calculate various order statuses
    const ordersCompleted = await Orders.countDocuments({
      orderStatus: "Completed",
    });

    const ordersPending = await Orders.countDocuments({
      orderStatus: "Pending",
    });

    const ordersPartial = await Orders.countDocuments({
      orderStatus: "Partial",
    });

    const ordersCanceled = await Orders.countDocuments({
      orderStatus: "Canceled",
    });

    const ordersProgress = await Orders.countDocuments({
      orderStatus: "In progress",
    });

    const ordersProcessing = await Orders.countDocuments({
      orderStatus: "Processing",
    });

    const ordersRefunded = await Orders.countDocuments({
      orderStatus: "Refunded",
    });

    // Calculate total tickets
    const totalTickets = await Ticket.countDocuments();
    const ticketsPending = await Ticket.countDocuments({ status: "pending" });
    const ticketsClosed = await Ticket.countDocuments({ status: "closed" });
    const ticketsAnswered = await Ticket.countDocuments({ status: "answered" });
    // Calculate top 5 best sellers
    const top5BestSellers = await Orders.aggregate([
      { $group: { _id: "$serviceId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "orderhistories",
          localField: "_id",
          foreignField: "serviceId",
          as: "details",
        },
      },
      {
        $project: {
          serviceId: "$_id",
          count: 1,
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
    ]);

    // Calculate total providers balance
    const totalProvidersBalanceResult = await Providers.aggregate([
      { $addFields: { ApiBalance: { $toDouble: "$ApiBalance" } } },
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$ApiBalance" },
        },
      },
    ]);

    const totalProvidersBalance =
      totalProvidersBalanceResult[0]?.totalBalance || 0;

    // Calculate the total amount received from successful transactions
    const currencyRates = await CurrencyRate.find();
    const currencyRateMap = currencyRates.reduce((acc, rate) => {
      acc[rate.currency] = rate.rate;
      return acc;
    }, {});

    const transactions = await Transactions.find({
      status: { $regex: /^success$/i },
    });

    const totalAmountReceived = transactions.reduce((sum, transaction) => {
      const rate = currencyRateMap[transaction.currency] || 1;
      const convertedAmount = transaction.amount / rate;
      return sum + convertedAmount;
    }, 0);

    // Calculate profit today
    const startOfToday = new Date(Date.now()).setHours(0, 0, 0, 0);
    const endOfToday = new Date(Date.now()).setHours(23, 59, 59, 999);
    const ordersToday = await Orders.find({
      createdAt: { $gte: startOfToday, $lt: endOfToday },
    });

    const totalProfitToday = ordersToday.reduce(
      (sum, order) => sum + order.profit,
      0
    );

    // Calculate profit for the last 30 days
    const startOf30DaysAgo = new Date();
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30); // 30 days ago
    const ordersLast30Days = await Orders.find({
      createdAt: { $gte: startOf30DaysAgo, $lt: endOfToday },
    });

    const totalProfit30Days = ordersLast30Days.reduce((sum, order) => {
      // Check if order.profit is a valid number, else treat it as 0
      const profit = isNaN(order.profit) ? 0 : order.profit;
      return sum + profit;
    }, 0);

    // Create or update the `AdminStats` document in the database
    const adminStatsData = {
      totalUsers,
      totalProfitToday,
      totalProfit30Days,
      totalAmountReceived,
      totalUsersBalance,
      totalProvidersBalance,
      totalOrders,
      totalTickets,
      last5User,
      last5Orders,
      top5BestSellers,
      ticketsClosed,
      ticketsAnswered,
      ticketsPending,
      ordersRefunded,
      ordersProcessing,
      ordersCanceled,
      ordersCompleted,
      ordersPending,
      ordersPartial,
      ordersProgress,
    };

    let adminStats = await AdminStats.findOne();
    if (adminStats) {
      // Update the existing document
      adminStats = await AdminStats.findOneAndUpdate(
        {},
        { $set: adminStatsData },
        { new: true }
      );
    } else {
      // Create a new document if no document exists
      adminStats = new AdminStats(adminStatsData);
      await adminStats.save();
    }
    // Send response with stats
    res.status(200).json({
      message: "Stats updated successfully",
      stats: adminStatsData,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};
