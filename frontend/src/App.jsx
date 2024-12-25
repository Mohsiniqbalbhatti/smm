import React from "react";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Guest from "./Guest/Guest";
import { useAuth } from "./context/AuthProvider";
import Maintainess from "./Pages/Maintainess";
import { useSiteSettings } from "./context/SiteSettingsProvider";

function App() {
  const [authUser] = useAuth();

  // If maintenance mode is enabled, show the maintenance page
  if (!authUser) {
    const { siteSettings } = useSiteSettings();

    if (siteSettings && siteSettings.maintenanceMode === true) {
      return (
        <>
          <Maintainess />
        </>
      );
    }
  }

  return (
    <div>
      {authUser ? (
        <div className="container-fluid">
          <Toaster />
          <div className="row">
            <div className="col-12 ">
              <Navbar />
            </div>
            <div className="col-3 d-none d-lg-block">
              <SideBar />
            </div>
            <div className="col-12 col-lg-9" style={{ marginBottom: "150px" }}>
              <Outlet />
            </div>
          </div>
        </div>
      ) : (
        <>
          <Guest />
          <Toaster />
        </>
      )}
    </div>
  );
}

export default App;
