import mongoose from "mongoose";
import ApiServicesModel from "./ApiServices.model.js";

const categoriesSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
  },
  sort: {
    type: String,
    required: [true, "Sort number is required"],
    default: "5",
  },
  status: {
    type: String,
    required: [true, "Category Status is required"],
    default: "active",
  },
  ApiStatus: {
    type: String,
  },
  ApiName: {
    type: String,
  },
});
categoriesSchema.post("findOneAndUpdate", async function (doc, next) {
  if (doc) {
    try {
      // Find all categories related to this API by ApiName
      const servicesToUpdate = await ApiServicesModel.find({
        category: doc.name, // Assuming ApiName is used to track the source in categories
      });

      // Update the ApiStatus in the related categories
      if (servicesToUpdate.length > 0) {
        await Promise.all(
          servicesToUpdate.map(async (service) => {
            service.catStatus = doc.status; // Update ApiStatus in categories
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

export default mongoose.model("categoriesList", categoriesSchema);
