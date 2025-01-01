import mongoose from "mongoose";
import ApiListSchema from "../model/ApiList.model.js";
import axios from "axios";
import ApiServicesModel from "../model/ApiServices.model.js";
import categoriesModel from "../model/categories.model.js";

// Function to handle adding a new API
export const AddApiList = async (req, res) => {
  try {
    const { ApiName, ApiEndPoint, ApiKey, ApiStatus } = req.body;

    if (!ApiName || !ApiEndPoint || !ApiKey || !ApiStatus) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch balance and currency for the new API
    const { balance, currency } = await fetchBalance(ApiEndPoint, ApiKey);

    if (!currency) {
      // Check if currency is null or undefined
      return res.status(500).json({ message: "Currency is not defined" });
    }

    const newAPI = new ApiListSchema({
      ApiName,
      ApiEndPoint,
      ApiKey,
      ApiStatus,
      ApiBalance: balance,
      currencyCode: currency, // Corrected to use 'currency' and 'currencyCode'
    });

    await newAPI.save();
    res.status(200).json({ message: "API Saved successfully", api: newAPI });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

// Function to fetch balance and currency from the API provider
const fetchBalance = async (apiEndPoint, apiKey) => {
  try {
    const response = await axios.post(apiEndPoint, null, {
      params: {
        key: apiKey,
        action: "balance",
      },
    });
    // Return both balance and currency for storing in the database
    return { balance: response.data.balance, currency: response.data.currency };
  } catch (error) {
    console.error("Error fetching balance:", error);
    return { balance: "Error fetching balance", currency: null };
  }
};

export const getApiList = async (req, res) => {
  try {
    const apiList = await ApiListSchema.find();

    // Fetch balance for each API and update the database
    const updatedApiList = await Promise.all(
      apiList.map(async (api) => {
        const { balance } = await fetchBalance(api.ApiEndPoint, api.ApiKey);
        api.ApiBalance = balance; // Update the balance field
        await api.save(); // Save the updated API with new balance
        return api;
      })
    );

    res.status(200).json(updatedApiList);
  } catch (error) {
    console.log("Error fetching API list:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

// Edit APi
export const editApi = async (req, res) => {
  try {
    const { ApiName, ApiEndPoint, ApiKey, ApiStatus, _id } = req.body;

    // Find the Api by id and update the fields
    const updatedApi = await ApiListSchema.findOneAndUpdate(
      { _id }, // Query to find the Api
      {
        ApiName,
        ApiEndPoint,
        ApiKey,
        ApiStatus,
      }, // Update object
      { new: true } // Return the updated document
    );

    // Check if the Api was found
    if (!updatedApi) {
      return res.status(404).json({ message: "Api not found" });
    }

    // Return the updated Api
    res.json(updatedApi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete API and related data
export const deleteApi = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  // Check if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid API ID" });
  }

  const session = await mongoose.startSession(); // Start a session for transaction
  session.startTransaction();

  try {
    // Find and delete the API
    const deletedApi = await ApiListSchema.findByIdAndDelete(id, { session });

    if (!deletedApi) {
      await session.abortTransaction(); // Abort if API is not found
      session.endSession();
      return res.status(404).json({ message: "API not found" });
    }

    // Delete related services
    await ApiServicesModel.deleteMany(
      { ApiName: deletedApi.ApiName },
      { session }
    );

    // Delete related categories
    await categoriesModel.deleteMany(
      { ApiName: deletedApi.ApiName },
      { session }
    );

    await session.commitTransaction(); // Commit the transaction
    session.endSession();

    res
      .status(200)
      .json({ message: "API and related data deleted successfully" });
  } catch (err) {
    await session.abortTransaction(); // Rollback the transaction
    session.endSession();
    res.status(500).json({
      message: "Error deleting API and related Services and categories",
      error: err.message,
    });
  }
};
