import { Router } from "express";
import {
  generalSetting,
  getEmailSettings,
  getEmailTemplates,
  SendFAQPageContent,
  sendGeneralSetting,
  SendTermsPageContent,
  updateEmailSetting,
  updateEmailTemplates,
  updateFAQPageContent,
  updateTermsPageContent,
} from "../controller/SiteSettings.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
const router = new Router();

// general setting get and edit
router.post("/general", requireAdmin, generalSetting);
router.get("/sendGeneral", sendGeneralSetting);

// terms page content get and edit
router.post("/updateTerms", requireAdmin, updateTermsPageContent);
router.get("/getTerms", SendTermsPageContent);
// FAQ page content get and edit
router.post("/updateFAQ", requireAdmin, updateFAQPageContent);
router.get("/getFAQ", SendFAQPageContent);
// email settings get and edit
router.post("/updateEmailSettings", requireAdmin, updateEmailSetting);
router.get("/getEmailSettigs", requireAdmin, getEmailSettings);

// email templates get and edit
router.post("/updateEmailTemplates", requireAdmin, updateEmailTemplates);
router.get("/getEmailTemplates", requireAdmin, getEmailTemplates);

export default router;
