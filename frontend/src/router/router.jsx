import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import NewOrder from "../Pages/NewOrder";
import Notfound from "../Pages/Notfound";
import OrderHistory from "../Pages/OrderHistory";
import AddApi from "../admin/AddApi";
import ApiServices from "../admin/ApiServices";
import Categories from "../admin/Categories";
import Services from "../admin/Services";
import ServicesForUser from "../Pages/UserServices";
import Signup from "../Guest/Signup";
import ProtectedRoute from "./ProtectedRoute"; // Import the protected route
import AdminAccess from "../admin/AdminAccess";
import OrderLogs from "../admin/OrderLogs";
import Guest from "../Guest/Guest";
import Login from "../Guest/Login";
import Updates from "../Pages/Updates";
import UserExist from "./UserExist";
import UserProfile from "../Pages/UserProfile";
import ForgotPassword from "../Guest/ForgotPassword";
import TermsCondition from "../Pages/TermsCondition";
import FAQ from "../Pages/FAQ";
import Api from "../Pages/Api";
import UserManagement from "../admin/UserManagement";
import PaymentMethods from "../admin/PaymentMethods";
import AddFunds from "../Pages/AddFunds";
import TransactionLogs from "../admin/TransactionLogs";
import SiteSettings from "../admin/SiteSettings";
import WebsiteSettings from "../admin/generalSettings/WebsiteSettings";
import TermsPolicy from "../admin/generalSettings/TermsSetting";
import PagesText from "../admin/generalSettings/PagesTextSetting";
import ChildPanel from "../admin/generalSettings/ChildPannelSettings";
import Affiliate from "../admin/generalSettings/AffliateSettings";
import EmailSetting from "../admin/generalSettings/EmailSettings";
import EmailTemplates from "../admin/generalSettings/EmailTemplates";
import Tickets from "../Pages/Tickets";
import TicketDetailsUser from "../Pages/TicketDetailsUser";
import TicketsAdmin from "../admin/Tcikets";
import TicketDetailsAdmin from "../admin/TicketDetailsAdmin";
import FAQSettings from "../admin/generalSettings/FAQSettings";
import AdminLogin from "../Guest/AdminLogin";
import StatsForAdmin from "../admin/StatsForAdmin";
import ResetPassword from "../Guest/ResetPassword";
import Notifications from "../admin/Notifications";
import UploadAssets from "../admin/UploadAssets";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      { path: "", element: <NewOrder /> },
      { path: "/services", element: <ServicesForUser /> },
      { path: "/forgetPassword", element: <ForgotPassword /> },
      { path: "/terms", element: <TermsCondition /> },
      { path: "/api", element: <Api /> },
      { path: "/faq", element: <FAQ /> },

      // Protected Routes
      {
        element: <UserExist />,
        children: [
          { path: "/updates", element: <Updates /> },
          { path: "/OrderHistory", element: <OrderHistory /> },
          { path: "/profile", element: <UserProfile /> },
          { path: "/addFunds", element: <AddFunds /> },
          { path: "/tickets", element: <Tickets /> },
          { path: "/tickets/:ticketId", element: <TicketDetailsUser /> },
        ],
      },
      // Protected Admin Routes
      {
        element: <ProtectedRoute />,

        children: [
          { path: "/Admin-statistics", element: <StatsForAdmin /> },
          { path: "/OrderHistory", element: <OrderHistory /> },
          { path: "/admin/ApiProviders", element: <AddApi /> },
          { path: "/admin/apiService", element: <ApiServices /> },
          { path: "/admin/categories", element: <Categories /> },
          { path: "/admin/services", element: <Services /> },
          { path: "/admin/OrderLogs", element: <OrderLogs /> },
          { path: "/admin/UserManagement", element: <UserManagement /> },
          { path: "/admin/PaymentMethods", element: <PaymentMethods /> },
          { path: "/admin/transactionsLog", element: <TransactionLogs /> },
          { path: "/admin/tickets", element: <TicketsAdmin /> },
          { path: "/admin/tickets/:ticketId", element: <TicketDetailsAdmin /> },
          { path: "admin/notifications", element: <Notifications /> },
          { path: "admin/uploadAssets", element: <UploadAssets /> },

          {
            element: <SiteSettings />,
            children: [
              { path: "admin/siteSettings", element: <WebsiteSettings /> },
              { path: "admin/termsPolicy", element: <TermsPolicy /> },
              { path: "admin/faq", element: <FAQSettings /> },
              { path: "admin/pagesText", element: <PagesText /> },
              { path: "admin/childPanel", element: <ChildPanel /> },
              { path: "admin/affiliate", element: <Affiliate /> },
              { path: "admin/emailSetting", element: <EmailSetting /> },
              { path: "admin/emailSetting", element: <EmailSetting /> },
              { path: "admin/emailTemplate", element: <EmailTemplates /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "",
    element: <Guest />,
    children: [
      { path: "", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },
  { path: "*", element: <Notfound /> }, // 404 route
  { path: "/maintenance/access", element: <AdminLogin /> },
  { path: "/AdminAccess", element: <AdminAccess /> },
  // Admin Routes for Site Settings
]);

export default router;
