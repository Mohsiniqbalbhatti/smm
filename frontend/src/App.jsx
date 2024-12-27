import React from "react";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Guest from "./Guest/Guest";
import { useAuth } from "./context/AuthProvider";
import Maintainess from "./Pages/Maintainess";
import { useSiteSettings } from "./context/SiteSettingsProvider";
import { IoLogoWhatsapp } from "react-icons/io5";

function App() {
  const [authUser] = useAuth();
  const { siteSettings } = useSiteSettings();

  // If maintenance mode is enabled, show the maintenance page
  if (!authUser && siteSettings?.maintenanceMode === true) {
    return <Maintainess />;
  }

  return (
    <div>
      {authUser ? (
        <div className="container-fluid position-relative">
          <div>
            <div className="position-absolute top-0 start-0 p-3 bg-dark text-white">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${siteSettings?.whatsapp_number}`} // Replace with your WhatsApp number
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success position-fixed bottom-0 end-0 mb-4 me-4 rounded-circle p-2"
                style={{ zIndex: 1000 }}
              >
                <IoLogoWhatsapp style={{ fontSize: "36px" }} />
              </a>
            </div>
          </div>
          <Toaster />
          <div className="row">
            <div className="col-12 ">
              <Navbar />
            </div>
            <div className="col-3 d-none d-lg-block">
              <SideBar />
            </div>
            <div className="col-12 col-lg-9 mt-10">
              {" "}
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
