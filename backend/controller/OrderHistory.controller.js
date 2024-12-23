import OrderHistoryModel from "../model/OrderHistory.model.js";
import UserModel from "../model/User.model.js";

// Fetch order history for a specific user
export const getOrderHistoryByUser = async (req, res) => {
  try {
    const { userName } = req.params; // Assuming you're passing the userName in the route params

    // Find the user by userName
    const user = await UserModel.findOne({ userName: userName });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch order history for the found user
    const orderHistory = await OrderHistoryModel.find({ user: user._id }).sort({
      createdAt: -1,
    }); // Sort by creation date (most recent orders first)

    if (!orderHistory.length) {
      return res
        .status(404)
        .json({ success: false, message: "No order history found" });
    }

    // Return the order history
    res.status(200).json({ success: true, orderHistory });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    // Fetch all order history
    const orderHistory = await OrderHistoryModel.find().sort({
      createdAt: -1,
    }); // Sort by creation date (most recent orders first)

    if (!orderHistory.length) {
      return res
        .status(404)
        .json({ success: false, message: "No order history found" });
    }

    res.json(orderHistory);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const editOrder = async (req, res) => {
  try {
    const { _id, quantity, rate, remain, orderStatus } = req.body;

    // Fetch the order by ID
    const order = await OrderHistoryModel.findById(_id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Handle rate change for refund
    if (rate !== order.rate) {
      console.log("Rate changed. Old rate:", order.rate, "New rate:", rate);
      if (rate < order.rate) {
        const newBalance = parseFloat(order.rate) - parseFloat(rate);
        console.log("Amount to refund due to rate change:", newBalance);

        const userName = order.userName;
        const user = await UserModel.findOne({ userName });
        if (user) {
          const userBalance = user.balance + newBalance;
          await UserModel.findOneAndUpdate(
            { userName: userName },
            { balance: parseFloat(userBalance) },
            { new: true }
          );
          console.log("Updated user balance after rate refund:", userBalance);
        } else {
          console.log("User not found with username:", userName);
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }
      }
    }

    // Handle order cancellation
    if (orderStatus === "Canceled") {
      console.log("Order is being canceled.");
      const userName = order.userName;
      const user = await UserModel.findOne({ userName });
      if (user) {
        const updatedUser = await UserModel.findOneAndUpdate(
          { userName },
          { $inc: { balance: parseFloat(rate) } }, // Refund the full rate
          { new: true } // Get the updated user document
        );
        console.log(
          "Amount refunded due to cancellation:",
          rate,
          "Updated user balance:",
          updatedUser.balance
        );
      } else {
        console.log("User not found for refund during cancellation:", userName);
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Update order details for cancellation
      order.quantity = 0;
      order.rate = "0";
      order.orderStatus = orderStatus;
      order.error = "No Error";
      order.remain = 0;

      await order.save();
      console.log("Order canceled successfully and amount refunded");
      res.json({ message: "Order Canceled and amount refunded" });
      return;
    }

    // Update the order if not canceled
    order.quantity = quantity;
    order.rate = rate;
    order.orderStatus = orderStatus;
    order.remain = remain;
    await order.save();

    console.log("Order updated successfully");
    res.json({ message: "Edited Order history Successfully" });
  } catch (error) {
    console.error("Error editing order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
