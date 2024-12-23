import express from "express";
import {
  addServices,
  deleteService,
  editService,
  getAPIServicesfromDB,
  getCATServicesfromDB,
  updateRates,
} from "../controller/ApiServices.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();
router.use(requireAdmin);
// Route for adding services
router.post("/addServices", addServices);

// Route for updating rates
router.post("/updateRates", updateRates);

// Route for fetching services by API name
router.get("/api/:ApiName", getAPIServicesfromDB); // Changed to /api/:ApiName

// Route for fetching services by category
router.get("/category/:category", getCATServicesfromDB); // Changed to /category/:category

// Route for deleting a service
router.delete("/deleteService/:serviceId", deleteService);

// Route for editing a service
router.put("/editService", editService);

export default router;
