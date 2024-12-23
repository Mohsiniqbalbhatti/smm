import { Router } from "express";
import { sendEmailToUser } from "../controller/SendEmails.controller.js";
const router = new Router();

// send mails to user

router.post("/sendMailToUser", sendEmailToUser);
export default router;
