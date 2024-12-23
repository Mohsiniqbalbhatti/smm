import express from "express";
import {
  addNewCancel,
  addOrder,
  addRefil,
} from "../controller/AddOrder.controller.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router(); // Correct instantiation of the router
router.use(requireAuth);
router.post("/AddOrder", addOrder); // Correct use of the router instance

router.post("/addRefil", addRefil); // Correct use of the router instance
router.post("/addNewCancel", addNewCancel); // Correct use of the router instance

export default router;
