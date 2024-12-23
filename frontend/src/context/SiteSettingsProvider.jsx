import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Create the context
const SiteSettingsContext = createContext();

// Custom hook to use the context
export const useSiteSettings = () => useContext(SiteSettingsContext);

// Provider component
export const SiteSettingsProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState(null);

  // Fetch site settings from the backend
  const fetchSiteSettings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}siteSettings/sendGeneral`
      );
      setSiteSettings(res.data);
    } catch (error) {
      console.error("Error fetching site settings:", error);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  // Provide the settings and update method to the context consumers
  return (
    <SiteSettingsContext.Provider value={{ siteSettings, fetchSiteSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
