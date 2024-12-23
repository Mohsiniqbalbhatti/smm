import axios from "axios";
import ApiListModel from "../model/ApiList.model.js";
import ApiServicesModel from "../model/ApiServices.model.js";
import UserModel from "../model/User.model.js";
import OrdersViaApiKeyModel from "../model/OrdersViaApiKey.model.js";
import cron from "node-cron";

// Main API handler
export const handleAPIRequest = async (req, res) => {
  const { key, action } = req.body;
  try {
    const user = await validateApiKey(key); // Validate API Key

    // Map actions to corresponding functions
    const actionFunctions = {
      balance: () => getBalance(user),
      services: () => getServices(),
      add: () => addOrder(req.body, user),
      status: () => getOrderStatus(req.body),
      refill: () => getRefill(req.body),
      cancel: () => addNewCancel(req.body),
    };

    const response = actionFunctions[action];
    if (!response) return res.status(400).json({ error: "Invalid action" });

    return res.status(200).json(await response());
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Validate API Key
const validateApiKey = async (apiKey) => {
  const user = await UserModel.findOne({ apiKey });
  if (!user) throw new Error("Invalid API key");
  return user;
};

// Get user balance
const getBalance = async (user) => ({ balance: user.balance, currency: "USD" });

// Get services list
const getServices = async () => {
  const services = await ApiServicesModel.find();
  if (services.length === 0) throw new Error("No services available");

  return services.map((service) => ({
    service: service.serviceId,
    type: service.type || "Default",
    rate: parseFloat(service.rate).toFixed(6),
    min: parseInt(service.min, 10) || 100,
    max: parseInt(service.max, 10) || 1000000000,
    name: service.name,
    category: service.category,
    description: service.description || "",
    dripfeed: service.dripfeed || false,
    refill: service.refill || false,
    cancel: service.cancel || false,
    average_time: service.average_time || null,
  }));
};
// Add order function
const addOrder = async (orderData, user) => {
  const { service, link, quantity, runs, interval } = orderData;
  if (!service || !link || !quantity)
    throw new Error("Missing required parameters: service, link, and quantity");

  const serviceDetails = await ApiServicesModel.findOne({ serviceId: service });

  if (!serviceDetails) throw new Error("Service not found");

  // Validate quantity
  if (quantity < parseFloat(serviceDetails.min))
    throw new Error(`Quantity cannot be less than ${serviceDetails.min}`);
  if (quantity > serviceDetails.max)
    throw new Error(`Quantity cannot exceed ${serviceDetails.max}`);

  // Check user balance
  const totalCost = parseFloat(serviceDetails.rate) * (quantity / 1000);
  if (user.balance < totalCost) throw new Error("Insufficient balance");

  const apiDetails = await ApiListModel.findOne({
    ApiName: serviceDetails.ApiName,
  });
  if (!apiDetails) throw new Error("API details not found");

  // Prepare order details
  const newOrderDetails = {
    key: apiDetails.ApiKey,
    action: "add",
    service: serviceDetails.service,
    quantity,
    [apiDetails.linkParam || "link"]: link,
    ...(serviceDetails.dripfeed ? { runs, intervals } : {}),
  };

  const response = await newOrder(apiDetails, newOrderDetails);
  if (response && !response.error) {
    await UserModel.findByIdAndUpdate(user._id, {
      balance: user.balance - totalCost,
    });
    const newOrderHistory = await OrdersViaApiKeyModel.create({
      user: user._id,
      userName: user.userName,
      userApiKey: user.apiKey,
      apiName: apiDetails.ApiName,
      externalApiServiceId: serviceDetails.service,
      externalApiRate: serviceDetails.originalRate,
      orderIdAPI: response.order,
      pannelServiceId: serviceDetails.serviceId,
      serviceName: serviceDetails.name,
      quantity,
      link,
      orderStatus: "Pending",
      cancel: serviceDetails.cancel,
      dripfeed: serviceDetails.dripfeed,
      refill: serviceDetails.refill,
      runs: serviceDetails.dripfeed ? orderData.runs : null,
      intervals: serviceDetails.dripfeed ? orderData.intervals : null,
      chargeByUs: totalCost,
    });
    return { Order: newOrderHistory.order };
  }
  return handleOrderError(response, user, serviceDetails, quantity, link);
};

// Handle errors during order creation
const handleOrderError = async (
  response,
  user,
  serviceDetails,
  quantity,
  link
) => {
  await UserModel.findByIdAndUpdate(user._id, {
    balance: user.balance - serviceDetails.originalRate,
  });
  const newOrderHistory = await OrdersViaApiKeyModel.create({
    user: user._id,
    userName: user.userName,
    userApiKey: user.apiKey,
    apiName: serviceDetails.ApiName,
    externalApiServiceId: serviceDetails.service,
    externalApiRate: serviceDetails.originalRate,
    orderIdAPI: null,
    pannelServiceId: serviceDetails.serviceId,
    serviceName: serviceDetails.name,
    quantity,
    link,
    orderStatus: "Pending",
    cancel: serviceDetails.cancel,
    dripfeed: serviceDetails.dripfeed,
    refill: serviceDetails.refill,
    runs: serviceDetails.dripfeed ? orderData.runs : null,
    intervals: serviceDetails.dripfeed ? orderData.intervals : null,
    chargeByUs: serviceDetails.originalRate,
    error: response.error,
  });
  return { Order: newOrderHistory.order };
};

// Function to make the POST request to the External API for a new order
const newOrder = async (apiDetails, newOrderDetails) => {
  try {
    const response = await axios.post(apiDetails.ApiEndPoint, newOrderDetails, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in newOrder:", error);
    throw error;
  }
};

// Get order status
const getOrderStatus = async (orderData) => {
  let orderIds = [];

  if (orderData.orders) {
    // Split the `orders` parameter into an array
    orderIds = orderData.orders.split(",");
  } else if (orderData.order) {
    // Split the `order` parameter into an array and only take the first ID
    orderIds = orderData.order.split(",").slice(0, 1); // Only process the first ID
  }

  console.log("Normalized Order IDs:", orderIds);

  if (orderIds.length > 100) {
    return { message: "Maximum orders limit exceeded." };
  }

  const orderStatuses = {};
  for (const orderId of orderIds) {
    try {
      const orderHistory = await OrdersViaApiKeyModel.findOne({
        order: orderId.trim(), // Ensure no extra spaces cause errors
      });

      if (!orderHistory) {
        orderStatuses[orderId] = { error: "Incorrect order ID" };
        continue;
      }

      const apiDetails = await ApiListModel.findOne({
        ApiName: orderHistory.apiName,
      });

      if (!apiDetails) {
        orderStatuses[orderId] = { error: "Error getting status" };
        continue;
      }

      const orderStatus = await fetchOrderStatus(orderHistory, apiDetails);
      orderStatuses[orderId] = {
        charge: orderHistory.chargeByUs.toFixed(5),
        start_count: orderStatus.start_count || orderHistory.startCount,
        status: orderStatus.status,
        remains: orderStatus.remains || orderHistory.remain,
        currency: orderHistory.currency || "USD",
      };
    } catch (error) {
      console.error("Error processing order:", orderId, error);
      orderStatuses[orderId] = { error: "Failed to fetch order status" };
    }
  }

  // If single ID (whether from `order` or `orders`), return directly; else, return all
  return orderIds.length === 1 ? orderStatuses[orderIds[0]] : orderStatuses;
};

// Fetch order status from external API
const fetchOrderStatus = async (orderHistory, apiDetails) => {
  const requestPayload = {
    key: apiDetails.ApiKey,
    action: "status",
    order: orderHistory.orderIdAPI,
  };
  const response = await axios.post(apiDetails.ApiEndPoint, requestPayload, {
    headers: { "Content-Type": "application/json" },
  });
  const statusResponse = response.data;

  if (!statusResponse) throw new Error("Invalid response from external API");

  await OrdersViaApiKeyModel.findOneAndUpdate(
    { order: orderHistory.order },
    {
      chargeByApi:
        parseFloat(statusResponse.charge) || orderHistory.chargeByApi,
      orderStatus: statusResponse.status || orderHistory.orderStatus,
      remain: statusResponse.remains || orderHistory.remain,
    }
  );

  return statusResponse;
};

// get order refill
const getRefill = async (orderData) => {
  let orderIds = [];

  if (orderData.orders) {
    // Split the `orders` parameter into an array
    orderIds = orderData.orders.split(",");
  } else if (orderData.order) {
    // Split the `order` parameter into an array and only take the first ID
    orderIds = orderData.order.split(",").slice(0, 1); // Only process the first ID
  }

  if (orderIds.length > 100) {
    return { message: "Maximum orders limit exceeded." };
  }

  const ordersForRefill = {};
  for (const orderId of orderIds) {
    try {
      const orderHistory = await OrdersViaApiKeyModel.findOne({
        order: orderId.trim(), // Ensure no extra spaces cause errors
      });

      if (!orderHistory) {
        ordersForRefill[orderId] = { error: "Incorrect order ID" };
        continue;
      }

      const apiDetails = await ApiListModel.findOne({
        ApiName: orderHistory.apiName,
      });

      if (!apiDetails) {
        ordersForRefill[orderId] = { error: "Refill Error" };
        continue;
      }

      const orderRefill = await fetchOrderRefill(orderHistory, apiDetails);
      ordersForRefill[orderId] = orderRefill;
    } catch (error) {
      console.error("Error processing refill:", orderId, error);
      ordersForRefill[orderId] = { error: "Failed to get refill status" };
    }
  }

  // If single ID (whether from `order` or `orders`), return directly; else, return all
  return orderIds.length === 1 ? ordersForRefill[orderIds[0]] : ordersForRefill;
};

// Fetch order refills from external API
const fetchOrderRefill = async (orderHistory, apiDetails) => {
  const requestPayload = {
    key: apiDetails.ApiKey,
    action: "refill",
    order: orderHistory.orderIdAPI,
  };
  const response = await axios.post(apiDetails.ApiEndPoint, requestPayload, {
    headers: { "Content-Type": "application/json" },
  });
  const refillResponse = response.data;

  if (!refillResponse) throw new Error("Invalid response from  API");

  await OrdersViaApiKeyModel.findOneAndUpdate(
    { order: orderHistory.order },
    {
      refillResponse: refillResponse,
    }
  );

  return refillResponse;
};

// Add Cancel
export const addNewCancel = async (orderData) => {
  console.log("orderData", orderData);
  try {
    // chech parameter
    if (!orderData.order) {
      return {
        success: false,
        error: "Order ID is required",
      };
    }
    const orderHistory = await OrdersViaApiKeyModel.findOne({
      order: orderData.order,
    });

    // Check if order history exists
    if (!orderHistory) {
      return {
        success: false,
        error: "Incorrect order ID",
      };
    }

    // Check if cancellation is available
    if (!orderHistory.cancel) {
      console.log("orderHistory", orderHistory);
      console.log("orderHistory cancel", orderHistory.cancel);
      return {
        success: false,
        error: "Cancel not available for this order ID",
      };
    }

    const apiDetails = await ApiListModel.findOne({
      ApiName: orderHistory.apiName,
    });

    // Check if API details are found
    if (!apiDetails) {
      return {
        success: false,
        error: "API not found",
      };
    }

    // Prepare order cancellation details
    const orderDetails = {
      key: apiDetails.ApiKey,
      action: "cancel",
      order: orderHistory.orderIdAPI,
    };

    // Call helper function to send cancellation request
    const cancelResponse = await newCancel(apiDetails, orderDetails);

    if (cancelResponse) {
      // Update the order with the cancellation response
      await OrdersViaApiKeyModel.findOneAndUpdate(
        { orderId: orderData.orderId },
        {
          cancelResponse: cancelResponse,
        }
      );

      return {
        success: true,
        cancelResponse,
      };
    } else {
      return {
        error: "Failed to cancel the order",
      };
    }
  } catch (error) {
    console.error("Error in addNewCancel:", error);

    // Return structured error response
    return {
      success: false,
      error: "An unexpected error occurred while processing the cancellation.",
      details: error.message,
    };
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
    console.error("Error in newCancel:", error);

    // Return null for failure to make it explicit for caller
    return null;
  }
};

// Cron job to check order status every minute (adjust frequency as needed)
cron.schedule("*/20 * * * *", async () => {
  try {
    const ordersToCheck = await OrdersViaApiKeyModel.find({
      orderStatus: "Pending",
    }).limit(100);

    if (ordersToCheck.length === 0) {
      return;
    }

    for (let order of ordersToCheck) {
      try {
        const apiDetails = await ApiListModel.findOne({
          ApiName: order.apiName,
        });
        if (!apiDetails) {
          console.log(`API details not found for order: ${order.order}`);
          continue;
        }

        const orderStatus = await fetchOrderStatus(order, apiDetails);

        await OrdersViaApiKeyModel.findOneAndUpdate(
          { order: order.order },
          {
            orderStatus: orderStatus.status || order.orderStatus,
            remain: orderStatus.remains || order.remain,
            chargeByApi: parseFloat(orderStatus.charge) || order.chargeByApi,
          }
        );
      } catch (error) {
        console.error("Error processing order:", error);
      }
    }
  } catch (error) {
    console.error("Cron job error:", error);
  }
});
