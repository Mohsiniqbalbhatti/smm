import express from "express";
import dotenv from "dotenv";
import session from "express-session"; // Import express-session
import passport from "passport"; // Import Passport
import cors from "cors";
import bodyParser from "body-parser";
import path from "path"; // Import path for handling file paths
import connectDB from "./config/database.js"; // Import the connectDB function
import apiListRouter from "./router/ApiList.router.js";
import apiServicesRouter from "./router/apiService.router.js";
import categoriesRouter from "./router/categories.router.js";
import exchangeRateRouter from "./router/CurrencyConvertor.router.js";
import NewOrderRouter from "./router/AddOrder.router.js";
import userRouter from "./router/User.router.js";
import updatesRouter from "./router/updates.router.js";
import guestServices from "./router/guestServices.router.js";
import adminOnly from "./router/adminOnly.router.js";
import paymentRoute from "./router/PaymentMethods.router.js";
import siteSettingsRouter from "./router/SiteSettings.router.js";
import sendMailRouter from "./router/SendMail.router.js";
import ticketRouter from "./router/Tickets.router.js";
import apiRouter from "./router/OurAPi.router.js";
import UserManagementRouter from "./router/UserManagement.router.js";
import statsRouter from "./router/StatsForAdmin.router.js";
import OrderHistoryRouter from "./router/OrderHistory.router.js";
import transactionsLogsRouter from "./router/TransactionLogs.router.js";
import authGoogleRouter from "./router/authGoogle.router.js";
import NotificationRouter from "./router/Notification.router.js";

const app = express();
dotenv.config();
connectDB(); // Call the connectDB function

// Middleware
app.use(
  cors({
    origin: "*", // Replace with your frontend's URL during development
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_default_secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Routes
app.use("/siteSettings", siteSettingsRouter);
app.use("/admin/ApiList", apiListRouter);
app.use("/admin/notification", NotificationRouter);
app.use("/admin/apiServices", apiServicesRouter);
app.use("/admin/category", categoriesRouter);
app.use("/rate", exchangeRateRouter);
app.use("/NewOrder", NewOrderRouter);
app.use("/user", userRouter);
app.use("/OrderHistory", OrderHistoryRouter);
app.use("/updates", updatesRouter);
app.use("/login", authGoogleRouter);
app.use("/statistics", statsRouter);
app.use("/Guest", guestServices);
app.use("/adminOnly", adminOnly);
app.use("/payments", paymentRoute);
app.use("/transactionsLogs", transactionsLogsRouter);
app.use("/sendMail", sendMailRouter);
app.use("/ticket", ticketRouter);
app.use("/api", apiRouter);
app.use("/userManagement", UserManagementRouter);

// Serve React Frontend from 'dist'
const __dirname = path.resolve(); // For ES modules
app.use(express.static(path.join(__dirname, "dist"))); // Serve static files

// Handle React routing, return index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start Server
const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
