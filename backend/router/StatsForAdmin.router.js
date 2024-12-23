import { Router } from "express";
import { getStats } from "../controller/StatsForAdmin.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = new Router();
router.get("/", requireAdmin, getStats);
export default router;
