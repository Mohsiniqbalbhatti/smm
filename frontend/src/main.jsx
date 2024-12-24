import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router/router.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import AuthProvider, { useAuth } from "./context/AuthProvider"; // Use the Auth context
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SiteSettingsProvider } from "./context/SiteSettingsProvider.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Wrapper component to conditionally apply SiteSettingsProvider
const ConditionalProviders = ({ children }) => {
  const [authUser] = useAuth(); // Get authUser from context

  if (authUser?.role == "admin") {
    return children;
  }

  return <SiteSettingsProvider>{children}</SiteSettingsProvider>;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SiteSettingsProvider>
      <AuthProvider>
        <CurrencyProvider>
          <GoogleOAuthProvider clientId={googleClientId}>
            <ConditionalProviders>
              <RouterProvider router={router} />
            </ConditionalProviders>
          </GoogleOAuthProvider>
        </CurrencyProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  </React.StrictMode>
);
