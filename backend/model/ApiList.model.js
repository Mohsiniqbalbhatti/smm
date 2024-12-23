import mongoose from "mongoose";
import categoriesList from "../model/categories.model.js"; // Import categories model
import ApiServicesModel from "./ApiServices.model.js";

const ApiListSchema = mongoose.Schema({
  ApiName: {
    type: String,
    required: [true, "API name is required"],
    minlength: [2, "API Name must be at least 2 characters long"],
    maxlength: [50, "API name cannot exceed 50 characters"],
  },
  ApiEndPoint: {
    type: String,
    required: [true, "API End Point is required"],
  },
  ApiKey: {
    type: String,
    required: [true, "API Key is required"],
  },
  ApiStatus: {
    type: String,
    required: [true, "API Status is required"],
  },
  currencyCode: {
    type: String,
    required: [true, "API Api Currency code is required"],
  },
  ApiBalance: {
    type: String,
    default: "Fetching...",
    set: function (value) {
      return parseFloat(value).toFixed(3); // Keeps 3 decimal places like "0.270"
    },
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Post middleware to detect API status changes
ApiListSchema.post("findOneAndUpdate", async function (doc, next) {
  if (doc) {
    try {
      // Find all categories related to this API by ApiName
      const categoriesToUpdate = await categoriesList.find({
        ApiName: doc.ApiName, // Assuming ApiName is used to track the source in categories
      });

      // Update the ApiStatus in the related categories
      if (categoriesToUpdate.length > 0) {
        await Promise.all(
          categoriesToUpdate.map(async (category) => {
            category.ApiStatus = doc.ApiStatus; // Update ApiStatus in categories
            await category.save(); // Save the updated category
          })
        );
      }
    } catch (error) {
      console.error("Error updating ApiStatus in categories:", error);
    }
  }
  next(); // Continue to the next middleware
});
ApiListSchema.post("findOneAndUpdate", async function (doc, next) {
  if (doc) {
    try {
      // Find all categories related to this API by ApiName
      const servicesToUpdate = await ApiServicesModel.find({
        ApiName: doc.ApiName, // Assuming ApiName is used to track the source in categories
      });

      // Update the ApiStatus in the related categories
      if (servicesToUpdate.length > 0) {
        await Promise.all(
          servicesToUpdate.map(async (service) => {
            service.ApiStatus = doc.ApiStatus; // Update ApiStatus in categories
            await service.save(); // Save the updated category
          })
        );
      }
    } catch (error) {
      console.error("Error updating ApiStatus in categories:", error);
    }
  }
  next(); // Continue to the next middleware
});

export default mongoose.model("ApiList", ApiListSchema);
