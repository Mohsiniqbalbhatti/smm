import {
  AddApiList,
  deleteApi,
  editApi,
  getApiList,
} from "../controller/ApiList.controller.js";
import express, { Router } from "express";
import requireAdmin from "../middleware/requireAdmin.js";

const router = new Router();
router.use(requireAdmin);
router.post("/", AddApiList); // POST endpoint to add API
router.get("/", getApiList); // GET endpoint to fetch APIs
router.put("/editApi", editApi);
router.delete("/:id", deleteApi);

export default router;
