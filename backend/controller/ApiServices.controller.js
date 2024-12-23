import ServiceSchema from "../model/ApiServices.model.js";
import axios from "axios";
import categoriesList from "../model/categories.model.js";
import ApiListModel from "../model/ApiList.model.js";
import Update from "../model/update.model.js";
import cron from "node-cron"; // Ensure this is imported

// Function to add services to the database
export const addServices = async (req, res) => {
  const {
    ApiEndPoint,
    ApiKey,
    rateIncrease,
    refill,
    limit,
    ApiName,
    ApiStatus,
  } = req.body;

  try {
    // Convert rateIncrease to a float, limit to an integer, and refill to a boolean
    const parsedRateIncrease = parseFloat(rateIncrease);
    const parsedLimit = parseInt(limit, 10);
    const parsedRefill = refill === "true";

    // Validate parsedRateIncrease and parsedLimit
    if (
      isNaN(parsedRateIncrease) ||
      isNaN(parsedLimit) ||
      parsedRateIncrease < 0 ||
      parsedLimit < 0
    ) {
      return res
        .status(400)
        .json({ message: "Invalid rateIncrease or limit values" });
    }

    // Fetch services from the external API
    const services = await fetchServices(ApiEndPoint, ApiKey);

    // Filter services based on refill criteria
    let filteredServices = services.filter(
      (service) => service.refill === parsedRefill
    );

    if (!filteredServices.length) {
      return res.status(404).json({ message: "No services available" });
    }

    // Get existing service IDs from the database
    const existingServices = await ServiceSchema.find({
      service: { $in: filteredServices.map((s) => s.service) },
    }).select("service");

    const existingServiceIds = new Set(existingServices.map((s) => s.service));

    // Filter out services that already exist
    const newServices = filteredServices.filter(
      (service) => !existingServiceIds.has(service.service)
    );

    // Get existing categories
    const existingCategories = await categoriesList.find().select("name");
    const existingCategoryNames = new Set(
      existingCategories.map((cat) => cat.name)
    );

    const limitedServices = newServices.slice(0, limit);
    // Get unique categories from new services (after filtering)
    const uniqueCategories = [
      ...new Set(limitedServices.map((service) => service.category)),
    ];

    // Filter for new categories from new services
    const newCategories = uniqueCategories.filter(
      (category) =>
        !existingCategoryNames.has(category) &&
        limitedServices.some((service) => service.category === category)
    );

    // Add new categories to the database
    await Promise.all(
      newCategories.map(async (categoryName) => {
        let sort;

        // Assign sort values based on category name
        if (categoryName.toLowerCase().includes("tiktok")) {
          sort = "1";
        } else if (categoryName.toLowerCase().includes("youtube")) {
          sort = "2";
        } else if (categoryName.toLowerCase().includes("facebook")) {
          sort = "3";
        } else if (categoryName.toLowerCase().includes("instagram")) {
          sort = "4";
        } else {
          sort = "5";
        }

        // Create and save the new category with ApiName
        const newCategory = new categoriesList({
          name: categoryName,
          sort: sort,
          status: "active",
          ApiName: ApiName, // Add ApiName to the category
          ApiStatus: ApiStatus, // Add ApiName to the category
        });
        await newCategory.save();
      })
    );

    // Apply limit to the new services
    const addedServices = await Promise.all(
      newServices.slice(0, parsedLimit).map(async (service) => {
        const parsedAverageTime = !isNaN(service.average_time)
          ? parseInt(service.average_time)
          : 0;

        const newService = new ServiceSchema({
          service: service.service,
          name: service.name,
          type: service.type,
          rate: parseFloat(service.rate) * (1 + parsedRateIncrease / 100),
          min: parseInt(service.min),
          max: parseInt(service.max),
          category: service.category,
          description: service.description,
          refill: service.refill,
          dripfeed: service.dripfeed,
          cancel: service.cancel,
          average_time: parsedAverageTime,
          ApiName, // Add ApiName to the service
          originalRate: parseFloat(service.rate),
          rateIncreased: rateIncrease,
        });
        await newService.save();
        return newService;
      })
    );

    res.status(201).json({
      message: `${addedServices.length} services processed successfully.`,
      services: addedServices,
    });
  } catch (error) {
    console.error("Error adding services:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

// Function to fetch services from an external API
const fetchServices = async (apiEndPoint, apiKey) => {
  try {
    const response = await axios.post(apiEndPoint, null, {
      params: {
        key: apiKey,
        action: "services", // Action to get the service list
      },
    });
    return response.data; // Assuming the response contains a list of services
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services from API");
  }
};

// Function to get services from the database related to api name
export const getAPIServicesfromDB = async (req, res) => {
  try {
    const ApiName = req.params.ApiName;
    const services = await ServiceSchema.find({ ApiName });

    if (services.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found for this API. Add Now!" });
    }

    res.json(services);
  } catch (error) {
    console.error("Error getting services:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};
// Function to get services from the database related to category name
export const getCATServicesfromDB = async (req, res) => {
  try {
    const category = req.params.category;
    const services = await ServiceSchema.find({ category: category });

    if (services.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found for this category. Add Now!" });
    }

    res.json(services);
  } catch (error) {
    console.error("Error getting services:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

export const updateRates = async (req, res) => {
  const { ApiName, rateChange } = req.body;
  try {
    // Convert rateChange to a percentage
    const percentageChange = parseFloat(rateChange) / 100;

    // Find all services that belong to the specified API
    const services = await ServiceSchema.find({ ApiName });

    if (services.length === 0) {
      return res
        .status(404)
        .json({ message: `No services found for API: ${ApiName}` });
    }
    // Update rates for each service
    const updatedServices = await Promise.all(
      services.map(async (service) => {
        // Calculate the new rate based on the original rate and rateChange percentage
        const newRate = service.originalRate * (1 + percentageChange);
        service.rate = newRate;
        service.rateIncreased = rateChange;

        // Save the updated service
        await service.save();
        return service;
      })
    );
    res.status(200).json({
      message: `${updatedServices.length} services updated successfully.`,
      updatedServices,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update rates.", error });
  }
};

export const deleteService = async (req, res) => {
  const { serviceId } = req.params;
  const idAsString = String(serviceId);

  try {
    const deletedService = await ServiceSchema.findOneAndDelete({
      service: idAsString,
    });

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting service", error: err.message });
  }
};

// Assuming you are using the correct model for your service
export const editService = async (req, res) => {
  try {
    const {
      service,
      name,
      category,
      description,
      refill,
      rate,
      min,
      max,
      dripfeed,
    } = req.body;

    // Find the existing service
    const existingService = await ServiceSchema.findOne({ service });

    // Check if the service exists
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if the category has changed
    const isCategoryChanged = existingService.category !== category;

    if (isCategoryChanged) {
      // If the category has changed, create a new service with the new category and same fields
      const newService = new ServiceSchema({
        service: existingService.service, // Keep the same service identifier
        name: existingService.name || name,
        category, // New category
        description: existingService.description || description,
        refill: existingService.refill || refill,
        rate: existingService.rate || rate,
        min: existingService.min || min,
        max: existingService.max || max,
        dripfeed: existingService.dripfeed || dripfeed,
        ApiName: existingService.ApiName, // Keep other fields the same
        originalRate: existingService.originalRate,
        cancel: existingService.cancel,
        rateIncreased: existingService.rateIncreased,
        average_time: existingService.average_time,
        status: "active", // Default status for the new service
      });

      await newService.save(); // Save the new service in the new category

      return res.json({
        message: "New service created in the new category",
        newService,
      });
    } else {
      // If the category hasn't changed, update the existing service
      const updatedService = await ServiceSchema.findOneAndUpdate(
        { service }, // Query to find the service
        {
          name,
          category,
          description,
          refill,
          rate,
          min,
          max,
          dripfeed,
        }, // Update object
        { new: true } // Return the updated document
      );

      return res.json({
        message: "Service updated",
        updatedService,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// fetch all service from database
const fetchAllServiceFromDB = async (req, res) => {
  try {
    const services = await ServiceSchema.find({
      $and: [
        { $or: [{ ApiStatus: "active" }, { ApiStatus: { $exists: false } }] }, // Either active or doesn't exist
        { $or: [{ status: "active" }, { status: { $exists: false } }] }, // Either active or doesn't exist
        { $or: [{ catStatus: "active" }, { catStatus: { $exists: false } }] }, // Either active or doesn't exist
      ],
    });

    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

export default fetchAllServiceFromDB;

export const syncServices = async () => {
  try {
    const activeApis = await ApiListModel.find();

    for (const api of activeApis) {
      const services = await fetchServices(api.ApiEndPoint, api.ApiKey);

      // Get a list of service IDs fetched from the API
      const fetchedServiceIds = services.map((service) => service.service);

      // Process each fetched service
      await Promise.all(
        services.map(async (service) => {
          const existingService = await ServiceSchema.findOne({
            service: service.service, // Assuming `service.service` is the unique identifier
            ApiName: api.ApiName,
          });

          if (existingService) {
            // Check if any relevant fields have changed

            const oldApiRate = parseFloat(existingService.originalRate);
            const newApiRate = parseFloat(service.rate);
            const calculatedRate =
              parseFloat(newApiRate) *
              (1 + parseFloat(existingService.rateIncreased) / 100);

            const hasChanged =
              parseInt(existingService.min) !== parseInt(service.min) ||
              parseInt(existingService.max) !== parseInt(service.max) ||
              existingService.name !== service.name ||
              existingService.refill !== service.refill ||
              existingService.dripfeed !== service.dripfeed ||
              parseInt(existingService.average_time) !==
                parseInt(service.average_time) ||
              existingService.cancel !== service.cancel ||
              oldApiRate != newApiRate;

            if (hasChanged) {
              // Update the existing service
              existingService.min = parseInt(service.min);
              existingService.max = parseInt(service.max);
              existingService.name = service.name; // Update name
              existingService.refill = service.refill; // Update refill
              existingService.cancel = service.cancel; // Update cancel
              existingService.average_time = service.average_time; // Update avg time
              existingService.originalRate = service.rate; // Update api rate
              existingService.dripfeed = service.dripfeed; // Update dripfeed
              existingService.updatedAt = Date.now(); // Update the date when the service was updated

              // Log the rate change if it changed
              if (oldApiRate !== newApiRate) {
                // Log the rate change after updating the original rate
                const changeType =
                  oldApiRate < newApiRate
                    ? `rate increased to ${calculatedRate.toFixed(2)}`
                    : `rate decreased to ${calculatedRate.toFixed(2)}`;

                await Update.create({
                  ApiName: api.ApiName,
                  serviceId: existingService.serviceId,
                  name: existingService.name,
                  changeType: changeType,
                });

                console.log(changeType);

                // Update the original rate only after logging
                existingService.originalRate = parseFloat(service.rate);
              }

              // Apply rate increase and update rate
              existingService.rate = calculatedRate.toString();

              // Update the original rate for future comparisons
              existingService.originalRate = parseFloat(newApiRate);

              await existingService.save(); // Save the updated service
            }
          }
        })
      );

      // Find services that exist in the database but were not returned by the API
      const servicesToRemove = await ServiceSchema.find({
        service: { $nin: fetchedServiceIds },
        ApiName: api.ApiName, // Ensure we're checking the correct API's services
      });

      // Remove the services that no longer exist in the API's list
      if (servicesToRemove.length > 0) {
        await Promise.all(
          servicesToRemove.map(async (service) => {
            await Update.create({
              ApiName: api.ApiName,
              serviceId: service.serviceId, // Change serviceId to service.service
              name: service.name,
              changeType: "service disabled",
            });
            await ServiceSchema.deleteOne({ _id: service._id });
          })
        );
        console.log(
          `Removed ${servicesToRemove.length} services from the database.`
        );
      }
    }

    console.log("Service synchronization completed.");
  } catch (error) {
    console.error("Error synchronizing services:", error);
  }
};

// run syncServices on 1am every day

cron.schedule("53 00 * * *", async () => {
  await Update.deleteMany({});
  syncServices();
  console.log("Running cron job to update services...");
});
