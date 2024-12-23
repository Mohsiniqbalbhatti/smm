import { Router } from "express";
import { handleAPIRequest } from "../controller/OurAPI.controller.js";
const router = new Router();
router.post("/v2", handleAPIRequest);
export default router;
