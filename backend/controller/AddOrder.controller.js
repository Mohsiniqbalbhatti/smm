import ApiListModel from "../model/ApiList.model.js";
import axios from "axios";
import OrderHistoryModel from "../model/OrderHistory.model.js";
import UserModel from "../model/User.model.js";
import cron from "node-cron";
import ApiServicesModel from "../model/ApiServices.model.js";

// Function to add a new order
export const addOrder = async (req, res) => {
  try {
    const {
      orderId,
      ApiName,
      service,
      quantity,
      linkOrUrl,
      rate,
      serviceName,
      serviceId,
      userName,
      dripfeed,
      runs,
      intervals,
    } = req.body;

    if (ApiName) {
      // Find the API details by ApiName
      const apiDetails = await ApiListModel.findOne({ ApiName });

      if (apiDetails) {
        // Dynamically construct the new order details
        const newOrderDetails = {
          key: apiDetails.ApiKey,
          action: "add",
          service,
          quantity,
          [apiDetails.linkParam || "link"]: linkOrUrl,
        };

        // Check if dripfeed is true and add runs and intervals
        if (dripfeed) {
          newOrderDetails.runs = runs || null; // Set runs to null if not provided
          newOrderDetails.intervals = intervals || null; // Set intervals to null if not provided
        }

        // Call newOrder function to handle the API request
        const response = await newOrder(apiDetails, newOrderDetails);
        console.log("response of new order: " + JSON.stringify(response));

        // Check if the order was created successfully
        if (response && !response.error) {
          // Add order history to the database and get the new history document
          const newOrderHistory = await addOrderHistory(
            userName,
            response,
            serviceId,
            service,
            quantity,
            rate,
            linkOrUrl,
            serviceName,
            apiDetails,
            null, // Indicating no order ID
            null, // No error for successful orders
            dripfeed, // Pass dripfeed
            runs, // Pass runs
            intervals, // Pass intervals
            orderId
          );

          const user = await UserModel.findOne({ userName });

          if (!user) {
            return res
              .status(404)
              .json({ success: false, message: "User not found" });
          }

          // Update the user's balance
          const updatedBalance = user.balance - parseFloat(rate);
          const UpdatedSpent = user.spent + parseFloat(rate);
          await UserModel.findOneAndUpdate(
            { userName },
            { $set: { balance: updatedBalance, spent: UpdatedSpent } },
            { new: true }
          );

          // Return success response
          return res.status(200).json({
            success: true,
            orderHistory: newOrderHistory,
          });
        } else if (response && response.error) {
          // Order failed due to low balance, but still add to order history
          const pendingOrderHistory = await addOrderHistory(
            userName,
            response,
            serviceId,
            service,
            quantity,
            rate,
            linkOrUrl,
            serviceName,
            apiDetails,
            null, // Indicating no order ID
            response.error, // Pass the error message
            dripfeed, // Pass dripfeed
            runs, // Pass runs
            intervals,
            orderId // Pass intervals
          );
          const user = await UserModel.findOne({ userName });

          if (!user) {
            return res
              .status(404)
              .json({ success: false, message: "User not found" });
          }

          // Update the user's balance
          const updatedBalance = user.balance - rate;
          const UpdatedSpent = user.spent + rate;
          await UserModel.findOneAndUpdate(
            { userName },
            { $set: { balance: updatedBalance, spent: UpdatedSpent } }, // Update both fields in a single object
            { new: true }
          );

          // TODO: Send message to admin about the pending order

          return res.status(200).json({
            success: true,
            orderHistory: pendingOrderHistory,
          });
        } else {
          return res
            .status(500)
            .json({ success: false, message: "Order creation failed" });
        }
      } else {
        return res
          .status(404)
          .json({ success: false, message: "API not found" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "ApiName is required" });
    }
  } catch (error) {
    console.error("Error in addOrder:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

// Function to make the POST request to the API for  new order
const newOrder = async (apiDetails, newOrderDetails) => {
  try {
    const response = await axios.post(
      `${apiDetails.ApiEndPoint}`, // Correct API URL
      newOrderDetails, // Data to be sent in the request body
      {
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error in newOrder:", error);
    throw error; // Re-throw error to handle in the calling function
  }
};

// Function to add order history to the database
const addOrderHistory = async (
  userName,
  response,
  serviceId,
  service,
  quantity,
  rate,
  linkOrUrl,
  serviceName,
  apiDetails,
  orderIdAPi = null, // Default value for orderIdAPi
  error,
  dripfeed,
  runs,
  intervals,
  orderId // Default value for orderId
) => {
  try {
    // Find user by userName
    const user = await UserModel.findOne({ userName });

    if (!user) {
      throw new Error("User not found");
    }

    const apiService = await ApiServicesModel.findOne({ service });

    if (!apiService) {
      throw new Error("Service not found");
    }

    // Fetch order details from external API, if applicable
    const orderDetails = orderIdAPi
      ? await fetchOrderDetails(response, apiDetails)
      : {};

    // Check if an orderId is provided
    if (orderId) {
      // Update the existing order history
      const existingOrder = await OrderHistoryModel.findOne({ orderId }); // Use orderId directly here
      if (existingOrder) {
        // Update the existing order history with new details
        existingOrder.orderIdAPi = orderIdAPi || response.order; // Use the response order if available
        existingOrder.quantity = quantity;
        existingOrder.rate = rate;
        existingOrder.chargeAPI = orderDetails.charge || 0; // Fallback to 0 if not applicable
        existingOrder.startCount = orderDetails.start_count || 0;
        existingOrder.orderStatus = orderDetails.status || "Pending"; // Update status
        existingOrder.remain = orderDetails.remains || quantity; // Update remaining quantity
        existingOrder.error = error; // Error message if applicable

        await existingOrder.save(); // Save the updated order history
        return existingOrder; // Return the updated order history
      } else {
        throw new Error("Existing order not found");
      }
    } else {
      // If no orderId, create a new order history
      const newOrderHistory = new OrderHistoryModel({
        ApiName: apiDetails.ApiName,
        user: user._id,
        userName,
        orderIdAPi: orderIdAPi || response.order, // Use the response order if available
        serviceId,
        serviceName,
        quantity,
        rate,
        link: linkOrUrl,
        service,
        chargeAPI: orderDetails.charge || 0, // Fallback to 0 if not applicable
        startCount: orderDetails.start_count || 0,
        orderStatus: orderDetails.status || "Pending", // Set status to "Pending" if no order ID
        remain: orderDetails.remains || quantity,
        currency: orderDetails.currency || "USD",
        error, // Error message if applicable
        refill: apiService.refill,
        cancel: apiService.cancel,
        ApiRate: apiService.originalRate,
        pannelRate: apiService.rate,
        min: apiService.min,
        max: apiService.max,
        dripfeed, // Save dripfeed status
        runs, // Save runs
        intervals, // Save intervals
      });

      // Save new order history to the database
      await newOrderHistory.save();

      // Update the user's order history by adding the new order
      await UserModel.findOneAndUpdate(
        { userName },
        { $push: { orderHistory: newOrderHistory._id } }
      );

      return newOrderHistory; // Return the new order history for confirmation
    }
  } catch (error) {
    console.error("Error adding order history:", error);
    throw error; // Re-throw the error after logging
  }
};

// Function to fetch order details after creating an order
const fetchOrderDetails = async (response, apiDetails) => {
  try {
    const Order = {
      key: apiDetails.ApiKey,
      action: "status",
      order: response.order,
    };

    const statusResponse = await axios.post(
      `${apiDetails.ApiEndPoint}`,
      Order,
      { headers: { "Content-Type": "application/json" } }
    );

    // Return the response with additional details
    return {
      charge: statusResponse.data.charge,
      start_count: statusResponse.data.start_count,
      status: statusResponse.data.status,
      remains: statusResponse.data.remains,
      currency: statusResponse.data.currency,
    };
  } catch (error) {
    throw error;
  }
};

// Cron job to update order status every 10 minutes
// Cron job to update order status every 10 minutes
cron.schedule("* * * * *", async () => {
  try {
    // Find all orders that are still pending or in-progress
    const pendingOrders = await OrderHistoryModel.find({
      orderStatus: { $in: ["Pending", "Processing", "In progress"] },
    });

    for (const order of pendingOrders) {
      const apiDetails = await ApiListModel.findOne({ ApiName: order.ApiName });

      if (apiDetails) {
        // Fetch the latest status of the order
        const orderDetails = await fetchOrderDetails(
          { order: order.orderIdAPi },
          apiDetails
        );

        // Update the order history with new details
        await OrderHistoryModel.findByIdAndUpdate(order._id, {
          orderStatus: orderDetails.status,
          chargeAPI: orderDetails.charge,
          startCount:
            parseFloat(orderDetails.start_count) ||
            parseFloat(order.startCount),
          remain: parseFloat(orderDetails.remains) || parseFloat(order.remain),
        });

        // If the order is canceled, refund the user and update the rate to 0
        if (orderDetails.status === "Canceled") {
          // Find the user associated with the order
          const user = await UserModel.findById(order.user);

          if (user) {
            // Convert the rate to a number before refunding
            const rateNumber = parseFloat(order.rate);
            const updatedBalance = user.balance + rateNumber; // Refund the rate
            const UpdatedSpent = user.spent - rateNumber;

            // Update the user's balance
            await UserModel.findByIdAndUpdate(
              user._id,
              { balance: updatedBalance, spent: UpdatedSpent },
              { new: true }
            );

            // Set the rate to "0" in the order history
            await OrderHistoryModel.findByIdAndUpdate(order._id, {
              rate: "0",
              remain: 0,
              chargeAPI: orderDetails.charge,
              orderStatus: orderDetails.status,
            });
            console.log(`Order ${order._id} rate set to "0" on cancellation.`);
          }
        } else if (orderDetails.status === "Partial") {
          const user = await UserModel.findById(order.user);

          if (user) {
            // Convert the rate to a number before refunding
            const ratePer1000 = parseFloat(order.pannelRate); //  rate per 100 by pannel
            const ratePer1 = ratePer1000 / 1000; //rate per 1
            const quantityNotDelivered = // qunatity not delivered
              parseFloat(order.quantity) - parseFloat(orderDetails.remains);

            const amountToRefund = quantityNotDelivered * ratePer1; // amount to refund
            // Update the user's balance
            await UserModel.findByIdAndUpdate(
              user._id,
              {
                $inc: { balance: -amountToRefund, spent: amountToRefund },
              },
              { new: true }
            );

            const newChargeBYus =
              parseFloat(order.chargeByUs) - parseFloat(amountToRefund);
            // Update the order history with new details
            await OrderHistoryModel.findByIdAndUpdate(order._id, {
              orderStatus: orderDetails.status,
              chargeAPI: orderDetails.charge,
              rate: newChargeBYus,
              startCount:
                parseFloat(orderDetails.start_count) ||
                parseFloat(order.startCount),
              remain:
                parseFloat(orderDetails.remains) || parseFloat(order.remain),
            });
          }
        }
      }
    }
  } catch (error) {
    // console.error("Error in order status update:", error);
  }
});

// add order to cancel
export const addRefil = async (req, res) => {
  try {
    const { orderIdAPi, ApiName } = req.body;
    if (ApiName) {
      // Find the API details by ApiName
      const apiDetails = await ApiListModel.findOne({ ApiName });

      if (apiDetails) {
        const newOrderDetails = {
          key: apiDetails.ApiKey,
          action: "refill",
          order: orderIdAPi,
        };
        const refill = await newRefill(apiDetails, newOrderDetails);
        // Try to find the order in OrderHistoryModel
        const order = await OrderHistoryModel.findOne({ orderIdAPi });

        if (!order) {
          return res
            .status(404)
            .json({ success: false, message: "Order not found" });
        }
        // Update or insert the cancel response into the order history
        await OrderHistoryModel.findOneAndUpdate(
          { _id: order._id }, // Find order by its unique ID
          { refillResponse: refill } // Update CancelResponse with API response
        );

        if (refill.status) {
          return res.status(200).json({
            message: refill.message || "Added for refill please wait...",
            refill,
          });
        } else if (refill.error) {
          return res.status(202).json({
            message: refill.error,
            refill,
          });
        } else {
          return res.status(500).json({
            message: "failed to add order for refill",
          });
        }
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "ApiName is required" });
    }
  } catch (error) {
    console.error("Error in addRefil:", error);
    throw error;
  }
};

// Function to make the POST request to the API for  new order
const newRefill = async (apiDetails, newOrderDetails) => {
  try {
    const response = await axios.post(
      `${apiDetails.ApiEndPoint}`, // Correct API URL
      newOrderDetails, // Data to be sent in the request body
      {
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error in newOrder:", error);
  }
};

// Controller function to add a new cancellation
export const addNewCancel = async (req, res) => {
  try {
    const { orderIdAPi, ApiName, orderId } = req.body; // Extract necessary fields from the request body

    if (!ApiName) {
      return res
        .status(400)
        .json({ success: false, message: "ApiName is required" });
    }

    // Find the API details by ApiName in the ApiListModel collection
    const apiDetails = await ApiListModel.findOne({ ApiName });

    if (!apiDetails) {
      return res
        .status(404)
        .json({ success: false, message: "API details not found" });
    }

    const orderDetails = {
      key: apiDetails.ApiKey,
      action: "cancel",
      order: orderIdAPi,
    };

    // Try to find the order in OrderHistoryModel
    const order = await OrderHistoryModel.findOne({ orderId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    // Update or insert the cancel response into the order history

    // Send the cancellation request and store response in `cancel`
    const cancel = await newCancel(apiDetails, orderDetails);

    if (!cancel) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to cancel order" });
    }
    await OrderHistoryModel.findOneAndUpdate(
      { _id: order._id }, // Find order by its unique ID
      { CancelResponse: cancel } // Update CancelResponse with API response
      // Create new doc if none found, and return the updated document
    );
    if (cancel.status) {
      return res.status(200).json({
        message: cancel.message || "Added for Cancellation, please wait...",
        cancel,
      });
    } else if (cancel.error) {
      return res.status(202).json({
        message: cancel.error,
        cancel,
      });
    } else {
      return res.status(202).json({
        message: "Failed to cancel order",
        cancel,
      });
    }
  } catch (error) {
    console.error("Error in Add Cancel:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Helper function to send the cancellation request to an external API
const newCancel = async (apiDetails, orderDetails) => {
  try {
    const response = await axios.post(
      `${apiDetails.ApiEndPoint}`, // The API endpoint URL
      orderDetails, // Data sent in the request body
      {
        headers: {
          "Content-Type": "application/json", // Set content type
        },
      }
    );
    console.log("Cancel Response:", response.data);
    return response.data; // Return response data for storage
  } catch (error) {
    console.error("Error in new cancel:", error);
    return null; // Return null if the request fails, so caller knows of failure
  }
};
