import SiteSettings from "../model/SiteSettings.model.js";
// update general setting
export const generalSetting = async (req, res) => {
  try {
    const {
      maintenanceMode,
      siteTitle,
      siteName,
      domainName,
      siteDescription,
      siteKeyWords,
      whatsapp_channel,
    } = req.body;

    // Find the current site settings in the database (assuming there's only one document)
    let siteSettings = await SiteSettings.findOne();

    // If settings are not found, create a new document with the provided values
    if (!siteSettings) {
      siteSettings = new SiteSettings({
        maintenanceMode:
          maintenanceMode !== undefined ? maintenanceMode : false, // Default to false if not provided
        siteTitle: siteTitle || "Default Site Title", // Default site title if not provided
        siteName: siteName || "Default Site Name", // Default site name if not provided
        domainName: domainName || "Default Domain Name", // Default site name if not provided
        siteDescription:
          siteDescription || "Cheapest SMM Panel in Pakistan & Worldwide! 🔥", // Default description if not provided
        siteKeyWords:
          siteKeyWords ||
          "SMM panel , cheapest SMM panel , SMM Provider panel , Cheapest Smm Services Provider , Best SMM Panel , Cheap SMM Panel , Indian SMM Panel , SMM reseller panel , cheapest smm reseller panel , instagram panel , smm panel india", // Default keywords if not provided
        whatsapp_channel: whatsapp_channel || "",
        whatsapp_number: whatsapp_number || "+9212345678",
      });

      // Save the new settings document
      await siteSettings.save();

      return res
        .status(201)
        .json({ message: "Site settings created successfully", siteSettings });
    }

    // If settings exist, update them with the new values from the request body
    if (maintenanceMode !== undefined) {
      siteSettings.maintenanceMode = maintenanceMode; // Update only if provided
    }
    if (siteTitle) {
      siteSettings.siteTitle = siteTitle; // Update title only if it's provided
    }
    if (siteName) {
      siteSettings.siteName = siteName; // Update name only if it's provided
    }
    if (domainName) {
      siteSettings.domainName = domainName; // Update name only if it's provided
    }
    if (siteDescription) {
      siteSettings.siteDescription = siteDescription; // Update description only if provided
    }
    if (siteKeyWords) {
      siteSettings.siteKeyWords = siteKeyWords; // Update keywords only if provided
    }
    if (whatsapp_channel) {
      siteSettings.whatsapp_channel = whatsapp_channel; // Update whatsapp_channel only if provided
    }
    if (whatsapp_number) {
      siteSettings.whatsapp_number = whatsapp_number; // Update whatsapp_channel only if provided
    }

    // Save the updated settings
    await siteSettings.save();

    // Send back the updated settings as a response
    res
      .status(200)
      .json({ message: "Settings updated successfully", siteSettings });
  } catch (error) {
    // Handle errors
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating site settings", error: error.message });
  }
};
// send general setting
export const sendGeneralSetting = async (req, res) => {
  try {
    // Fetch only the selected fields from the SiteSettings document
    let siteSettings = await SiteSettings.findOne().select(
      "maintenanceMode domainName whatsapp_channel"
    );

    // If settings are not found, create a new document with default values
    if (!siteSettings) {
      siteSettings = new SiteSettings({
        maintenanceMode: false, // Default to false if not provided
        siteTitle: "Default Site Title", // Default site title if not provided
        siteName: "Default Site Name", // Default site name if not provided
        domainName: "Default Domain Name", // Default site name if not provided
        siteDescription: "Cheapest SMM Panel in Pakistan & Worldwide! 🔥", // Default description if not provided
        siteKeyWords:
          "SMM panel, cheapest SMM panel, SMM Provider panel, Cheapest SMM Services Provider, Best SMM Panel, Cheap SMM Panel, Indian SMM Panel, SMM reseller panel, cheapest smm reseller panel, instagram panel, smm panel india", // Default keywords if not provided
        whatsapp_channel: "009999999999", // Default WhatsApp channel if not provided
      });

      // Save the new settings document
      await siteSettings.save();
      return res.status(200).json({
        maintenanceMode: siteSettings.maintenanceMode,
        siteTitle: siteSettings.siteTitle,
        siteName: siteSettings.siteName,
        domainName: siteSettings.domainName,
        siteDescription: siteSettings.siteDescription,
        siteKeyWords: siteSettings.siteKeyWords,
        whatsapp_channel: siteSettings.whatsapp_channel,
      });
    }

    // Send back only the selected fields as a response
    res.status(200).json({
      maintenanceMode: siteSettings.maintenanceMode,
      siteTitle: siteSettings.siteTitle,
      siteName: siteSettings.siteName,
      domainName: siteSettings.domainName,
      siteDescription: siteSettings.siteDescription,
      siteKeyWords: siteSettings.siteKeyWords,
      whatsapp_channel: siteSettings.whatsapp_channel,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating site settings", error: error.message });
  }
};

// Corrected function for updating terms page content
export const updateTermsPageContent = async (req, res) => {
  try {
    const { termsPageContent } = req.body;

    // Update the termsPageContent in the database
    const updatedContent = await SiteSettings.findOneAndUpdate(
      {},
      { termsPageContent },
      { new: true, upsert: true } // Upsert ensures it creates a new document if none exists
    );

    res.status(200).json({
      success: true,
      message: "Terms page content updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update terms page content",
      error: error.message,
    });
  }
};

// send terms
export const SendTermsPageContent = async (req, res) => {
  try {
    // Retrieve the termsPageContent from the database (assuming a single document)
    const siteSettings = await SiteSettings.findOne(
      {},
      { termsPageContent: 1 } // Project only termsPageContent field
    );

    if (!siteSettings) {
      return res.status(404).json({
        success: false,
        message: "Terms page content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Terms page content fetched successfully",
      termsPageContent: siteSettings.termsPageContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch terms page content",
      error: error.message,
    });
  }
};
// Corrected function for updating terms page content
export const updateFAQPageContent = async (req, res) => {
  try {
    const { faqPageContent } = req.body;

    // Update the termsPageContent in the database
    await SiteSettings.findOneAndUpdate(
      {},
      { faqPageContent },
      { new: true, upsert: true } // Upsert ensures it creates a new document if none exists
    );

    res.status(200).json({
      success: true,
      message: "FAQ page content updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update FAQ page content",
      error: error.message,
    });
  }
};

// send terms
export const SendFAQPageContent = async (req, res) => {
  try {
    // Retrieve the termsPageContent from the database (assuming a single document)
    const siteSettings = await SiteSettings.findOne(
      {},
      { faqPageContent: 1 } // Project only termsPageContent field
    );

    if (!siteSettings) {
      return res.status(404).json({
        success: false,
        message: "FAQ page content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ page content fetched successfully",
      faqPageContent: siteSettings.faqPageContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to FAQ terms page content",
      error: error.message,
    });
  }
};

// get email  setting
export const getEmailSettings = async (req, res) => {
  try {
    const emailSettings = await SiteSettings.findOne().select(
      "email_from email_name email_Password is_new_user_email is_order_notice_email is_payment_notice_email is_ticket_notice_email is_ticket_notice_email_admin is_verification_new_account is_welcome_email"
    );
    if (emailSettings) {
      res.status(200).json(emailSettings); // Send the email settings if they exist
    } else {
      res.status(404).json({ message: "Email settings not found" }); // If no settings found
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving email settings", error });
  }
};

// 2. Update email settings
export const updateEmailSetting = async (req, res) => {
  try {
    const {
      email_from,
      email_name,
      email_Password,
      is_new_user_email,
      is_order_notice_email,
      is_payment_notice_email,
      is_ticket_notice_email,
      is_ticket_notice_email_admin,
      is_verification_new_account,
      is_welcome_email,
    } = req.body;

    // Find the existing settings (if any)
    let emailSettings = await SiteSettings.findOne({});

    if (emailSettings) {
      // If settings exist, update them
      emailSettings.email_from = email_from;
      emailSettings.email_name = email_name;
      emailSettings.email_Password = email_Password;
      emailSettings.is_new_user_email = is_new_user_email;
      emailSettings.is_order_notice_email = is_order_notice_email;
      emailSettings.is_payment_notice_email = is_payment_notice_email;
      emailSettings.is_ticket_notice_email = is_ticket_notice_email;
      emailSettings.is_ticket_notice_email_admin = is_ticket_notice_email_admin;
      emailSettings.is_verification_new_account = is_verification_new_account;
      emailSettings.is_welcome_email = is_welcome_email;

      await emailSettings.save(); // Save updated settings
    } else {
      // If no settings exist, create new ones
      emailSettings = new SiteSettings({
        email_from,
        email_name,
        email_Password,
        is_new_user_email,
        is_order_notice_email,
        is_payment_notice_email,
        is_ticket_notice_email,
        is_ticket_notice_email_admin,
        is_verification_new_account,
        is_welcome_email,
      });

      await emailSettings.save(); // Save the new settings
    }

    res
      .status(200)
      .json({ message: "Email settings updated successfully", emailSettings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating email settings", error });
  }
};

// GET request to fetch email templates
export const getEmailTemplates = async (req, res) => {
  try {
    // Fetch the email template-related fields from the SiteSettings
    const siteSettings = await SiteSettings.findOne(
      {},
      "newUserWelcomeEmail newUserNotificationEmail passwordRecoveryEmail paymentNotificationEmail emailVerificationEmail"
    );

    if (!siteSettings) {
      return res.status(404).json({ message: "Site settings not found." });
    }

    return res.status(200).json(siteSettings); // Send back the email templates
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST request to update email templates
export const updateEmailTemplates = async (req, res) => {
  const {
    newUserWelcomeEmail,
    newUserNotificationEmail,
    passwordRecoveryEmail,
    paymentNotificationEmail,
    emailVerificationEmail,
  } = req.body; // Destructure email template data from the request body

  try {
    // Find the SiteSettings document (Assuming only one document exists)
    const siteSettings = await SiteSettings.findOne({});

    if (!siteSettings) {
      return res.status(404).json({ message: "Site settings not found." });
    }

    // Update the email templates with the new values from the request body
    if (newUserWelcomeEmail) {
      siteSettings.newUserWelcomeEmail = newUserWelcomeEmail;
    }
    if (newUserNotificationEmail) {
      siteSettings.newUserNotificationEmail = newUserNotificationEmail;
    }
    if (passwordRecoveryEmail) {
      siteSettings.passwordRecoveryEmail = passwordRecoveryEmail;
    }
    if (paymentNotificationEmail) {
      siteSettings.paymentNotificationEmail = paymentNotificationEmail;
    }
    if (emailVerificationEmail) {
      siteSettings.emailVerificationEmail = emailVerificationEmail;
    }

    // Save the updated siteSettings to the database
    await siteSettings.save();

    return res
      .status(200)
      .json({ message: "Email templates updated successfully." });
  } catch (error) {
    console.error("Error updating email templates:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
