import mongoose from "mongoose";

const SiteSettingsSchema = mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: "siteName", // Dummy default value for site name
  },
  domainName: {
    type: String,
    required: true,
    default: "example.com", // Dummy default value for site name
  },
  siteTitle: {
    type: String,
    required: true,
    default: "siteTitle", // Dummy default value for site title
  },
  whatsapp_channel: {
    type: String,
  },
  whatsapp_number: {
    type: String,
  },
  siteDescription: {
    type: String,
    required: true,
    default: "This is the default site description for SEO purposes.", // Dummy default description
  },
  siteKeyWords: {
    type: String,
    required: true,
    default: "default, keywords, for, seo", // Dummy keywords for SEO
  },
  maintenanceMode: {
    type: Boolean,
    default: false, // Maintenance mode (false by default)
  },
  termsPageContent: {
    type: String,
    required: false,
    default: "Default Terms and Conditions content.", // Dummy default terms content
  },
  faqPageContent: {
    type: String,
    required: false,
    default: "Default FAQ content.", // Dummy default FAQ content
  },
  email_from: {
    type: String,
    required: true,
    default: "example@mail.com", // Dummy default contact email
  },

  email_name: {
    type: String,
    default: "Admin Pannel", // Default email sender name
  },
  email_Password: {
    type: String,
    default: "", // Default email sender name
  },

  // New Email Templates with default values
  newUserWelcomeEmail: {
    subject: {
      type: String,
      default: "Welcome to our platform", // Default subject for New User Welcome Email
    },
    body: {
      type: String,
      default: "<p>Welcome to our platform. We're glad to have you!</p>", // Default body for New User Welcome Email
    },
  },
  pendingPaymentEmail: {
    subject: {
      type: String,
      default: "Approve Pending Payment now!",
    },
    body: {
      type: String,
      default:
        "Hey Admin there is an pending payment of {{userName}} with Payment id {{transactionId}}.", // Default body for New User Welcome Email
    },
  },
  pendingOrderEmail: {
    subject: {
      type: String,
      default: "Alert Order in pending!",
    },
    body: {
      type: String,
      default:
        "Hey Admin there is an pending Order of {{userName}} with Order id {{orderID}}.", // Default body for New User Welcome Email
    },
  },

  passwordRecoveryEmail: {
    subject: {
      type: String,
      default: "Password Recovery Request", // Default subject for Password Recovery Email
    },
    body: {
      type: String,
      default: "<p>Click <a href='#'>here</a> to reset your password.</p>", // Default body for Password Recovery Email
    },
  },

  paymentNotificationEmail: {
    subject: {
      type: String,
      default: "Payment Received", // Default subject for Payment Notification Email
    },
    body: {
      type: String,
      default:
        "<p>Your payment has been received. Thank you for your purchase!</p>", // Default body for Payment Notification Email
    },
  },

  emailVerificationEmail: {
    subject: {
      type: String,
      default: "Email Verification", // Default subject for Email Verification Email
    },
    body: {
      type: String,
      default: "<p>Click <a href='#'>here</a> to verify your email.</p>", // Default body for Email Verification Email
    },
  },

  // Flags to enable/disable email
  is_payment_notice_email: {
    type: Boolean,
    default: false, // Default value for payment notice email
  },
  is_ticket_notice_email: {
    type: Boolean,
    default: false, // Default value for ticket notice email
  },
  is_ticket_notice_email_admin: {
    type: Boolean,
    default: false, // Default value for ticket notice email to admin
  },
  is_verification_new_account: {
    type: Boolean,
    default: false, // Default value for verification new account email
  },
  is_welcome_email: {
    type: Boolean,
    default: false, // Default value for welcome email
  },
});

const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
