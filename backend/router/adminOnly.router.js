import express from "express";
import {
  editOrder,
  getOrderHistory,
} from "../controller/OrderHistory.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { allUser } from "../controller/User.controller.js";

const router = new express.Router();
router.use(requireAdmin);
router.get("/allOrderHistory", getOrderHistory);
router.put("/editOrder", editOrder);
router.get("/allUser", allUser);

export default router;
