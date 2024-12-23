import express from "express";
import { getCategories } from "../controller/categories.controller.js";
import fetchAllServiceFromDB from "../controller/ApiServices.controller.js";
const router = express.Router();
// get all categories
router.get("/getCategory", getCategories);
// get all services
router.get("/allServices", fetchAllServiceFromDB);

export default router;
