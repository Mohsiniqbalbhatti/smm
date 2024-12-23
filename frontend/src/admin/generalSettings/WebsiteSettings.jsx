import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Loader from "../../components/Loader";
import axios from "axios";
import toast from "react-hot-toast";

function WebsiteSettings() {
  const [load, setLoad] = useState(false);
  const [settings, setSettings] = useState([]);
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  // Using React Hook Form with default values
  const {
    register,
    handleSubmit,
    setValue, // for setting default values dynamically
    formState: { errors },
  } = useForm();

  // Fetch general settings and set them as default values
  const getGeneralSettings = async () => {
    setLoad(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}siteSettings/sendGeneral`
      );
      const settings = response.data;
      setSettings(response.data);
      // Set default values in the form
      setValue("maintenanceMode", settings.maintenanceMode);
      setValue("domainName", settings.domainName);
      setValue("websiteName", settings.siteName);
      setValue("websiteTitle", settings.siteTitle);
      setValue("websiteDescription", settings.siteDescription);
      setValue("websiteKeywords", settings.siteKeyWords);
    } catch (error) {
      console.error("Error fetching general settings:", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    getGeneralSettings(); // Fetch settings when component mounts
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    setLoad(true);
    const generalSiteData = {
      maintenanceMode: data.maintenanceMode,
      siteName: data.websiteName,
      domainName: data.domainName,
      siteTitle: data.websiteTitle,
      siteKeyWords: data.websiteKeywords,
      siteDescription: data.websiteDescription,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}siteSettings/general`,
        generalSiteData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } // Pass the data to the backend API
      );
      if ((res.status = 200 || 200)) {
        toast.success("Updated site settings");
      }
    } catch (error) {
      console.error("Error submitting site settings:", error);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div>
      {load && <Loader />}
      <div className="card">
        <div className="card-title">Website Settings</div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h4>Website Settings</h4>

            {/* Maintenance Mode Switch */}
            <div className="form-check form-switch">
              <input
                className="form-check-input d-block"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
                {...register("maintenanceMode")}
              />
              <br />
              <label htmlFor="flexSwitchCheckDefault">
                <strong>Note:</strong> Make sure you remember this link to get
                access to Maintenance mode before you activate:
                <strong>
                  {`https://${settings.domainName}/maintenance/access`}{" "}
                </strong>
              </label>
            </div>

            {/* Website Name */}
            <div className="form-group">
              <label htmlFor="websiteName">Domain Name</label>
              <input
                type="text"
                className="form-control"
                id="domainName"
                placeholder="smmpanel.com"
                {...register("domainName", {
                  required: "Website name is required",
                })}
              />
              {errors.websiteName && (
                <span className="text-danger">{errors.domainName.message}</span>
              )}
            </div>
            <div className="form-group">
              {" "}
              <label htmlFor="websiteName">Website Name</label>
              <input
                type="text"
                className="form-control"
                id="websiteName"
                placeholder="e.g., smmPannel.com: Best and Cheapest SMM Service Provider in World"
                {...register("websiteName", {
                  required: "Website name is required",
                })}
              />
              {errors.websiteName && (
                <span className="text-danger">
                  {errors.websiteName.message}
                </span>
              )}
            </div>

            {/* Website Description */}
            <div className="form-group">
              <label htmlFor="websiteDescription">Website Description</label>
              <textarea
                className="form-control"
                id="websiteDescription"
                rows="3"
                placeholder="Enter website description here"
                {...register("websiteDescription")}
              ></textarea>
            </div>

            {/* Website Keywords */}
            <div className="form-group">
              <label htmlFor="websiteKeywords">Website Keywords</label>
              <textarea
                className="form-control"
                id="websiteKeywords"
                rows="3"
                placeholder="Enter website keywords here"
                {...register("websiteKeywords")}
              ></textarea>
            </div>

            {/* Website Title */}
            <div className="form-group">
              <label htmlFor="websiteTitle">Website Title</label>
              <input
                type="text"
                className="form-control"
                id="websiteTitle"
                placeholder="Enter website title"
                {...register("websiteTitle")}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-main my-3">
              Save
            </button>
          </form>
        </div>
      </div>{" "}
    </div>
  );
}

export default WebsiteSettings;
