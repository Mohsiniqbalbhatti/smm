import Users from "../model/User.model.js";
import Orders from "../model/OrderHistory.model.js";
import Tickets from "../model/Tickets.model.js";
import AdminStats from "../model/StatsForAdmin.model.js";
import Providers from "../model/ApiList.model.js";
import Transactions from "../model/TransactionLogs.model.js";
import CurrencyRate from "../model/CurrencyConvertor.model.js";

export const getStats = async (req, res) => {
  try {
    // Fetch and calculate all stats
    const totalUsers = await Users.countDocuments();
    const last5User = await Users.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("userName email balance createdAt status");

    const totalUsersBalanceResult = await Users.aggregate([
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
    ]);

    const totalUsersBalance = totalUsersBalanceResult.length
      ? totalUsersBalanceResult[0].totalBalance
      : 0;

    const totalOrders = await Orders.countDocuments();
    const last5Orders = await Orders.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "orderId userName serviceName ApiName link quantity createdAt orderStatus error"
      );

    const orderStatuses = [
      "Completed",
      "Pending",
      "Partial",
      "Canceled",
      "In progress",
      "Processing",
      "Refunded",
    ];

    const orderCounts = {};
    for (const status of orderStatuses) {
      orderCounts[status] = await Orders.countDocuments({
        orderStatus: status,
      });
    }

    const totalTickets = await Tickets.countDocuments();
    const ticketStatuses = ["pending", "closed", "answered"];
    const ticketCounts = {};
    for (const status of ticketStatuses) {
      ticketCounts[status] = await Tickets.countDocuments({ status });
    }

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

    const totalProvidersBalanceResult = await Providers.aggregate([
      { $addFields: { ApiBalance: { $toDouble: "$ApiBalance" } } },
      { $group: { _id: null, totalBalance: { $sum: "$ApiBalance" } } },
    ]);

    const totalProvidersBalance =
      totalProvidersBalanceResult[0]?.totalBalance || 0;

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
      return sum + transaction.amount / rate;
    }, 0);

    const startOfToday = new Date(Date.now()).setHours(0, 0, 0, 0);
    const endOfToday = new Date(Date.now()).setHours(23, 59, 59, 999);
    const ordersToday = await Orders.find({
      createdAt: { $gte: startOfToday, $lt: endOfToday },
    });

    const totalProfitToday = ordersToday.reduce(
      (sum, order) => sum + (order.profit || 0),
      0
    );

    const startOf30DaysAgo = new Date();
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);

    const ordersLast30Days = await Orders.find({
      createdAt: { $gte: startOf30DaysAgo, $lt: endOfToday },
    });

    const totalProfit30Days = ordersLast30Days.reduce(
      (sum, order) => sum + (order.profit || 0),
      0
    );

    // Prepare the stats object
    const stats = {
      totalUsers,
      totalUsersBalance,
      totalOrders,
      orderCounts,
      totalTickets,
      ticketCounts,
      totalProvidersBalance,
      totalAmountReceived,
      totalProfitToday,
      totalProfit30Days,
      last5User,
      last5Orders,
      top5BestSellers,
    };

    // Save to or update the database
    const adminStats = await AdminStats.findOneAndUpdate(
      {},
      { $set: stats },
      { upsert: true, new: true }
    );

    // Send response
    res.status(200).json({
      message: "Stats fetched successfully",
      stats: adminStats,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ message: "Error fetching stats", error });
  }
};
