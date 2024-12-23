import express from "express";
import {
  addCategory,
  deleteCategory,
  updateCategory,
} from "../controller/categories.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
const router = express.Router();
router.use(requireAdmin);
router.post("/addCategory", addCategory);
router.delete("/deleteCategory/:id", deleteCategory);
router.put("/updateCategory/:id", updateCategory);

export default router;
