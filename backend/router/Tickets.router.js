import { Router } from "express";
import {
  createNewTicket,
  sendAllTickets,
  sendTicketByTicketId,
  sendTicketByUserName,
  updateTicketByTicketId,
} from "../controller/Tickets.controller.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";
const router = new Router();
router.post("/createNewTicket", requireAuth, createNewTicket);

router.get("/getAllTickets", requireAdmin, sendAllTickets);

router.get("/getTicket/:ticketId", requireAuth, sendTicketByTicketId);
router.get("/getTicketsForUser/:userName", requireAuth, sendTicketByUserName);

// update existing tickets messaging and status
router.put("/updateTicket", requireAuth, updateTicketByTicketId);
export default router;
