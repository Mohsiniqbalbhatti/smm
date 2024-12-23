import express, { Router } from "express";
import { fetchAllUpdates } from "../controller/Updates.controller.js";
import requireAuth from "../middleware/requireAuth.js";

const router = new Router();
router.use(requireAuth);
router.get("/all", fetchAllUpdates); // GET endpoint to fetch APIs

export default router;
