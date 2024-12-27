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
      setValue("domainName", settings.domainName);
      setValue("maintenanceMode", settings.maintenanceMode);
      setValue("whatsappChannel", settings.whatsapp_channel);
      setValue("whatsappNumber", settings.whatsapp_number);
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
      domainName: data.domainName,
      whatsapp_channel: data.whatsappChannel,
      whatsapp_number: data.whatsappNumber,
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
              <label htmlFor="flexSwitchCheckDefault">Maintainess Mode</label>
              <p>
                {" "}
                <strong>Note:</strong> Make sure you remember this link to get
                access to Maintenance mode before you activate:
                <strong>
                  {`https://${settings.domainName}/maintenance/access`}{" "}
                </strong>
              </p>
            </div>

            {/* Domain Name */}
            <div className="form-group">
              <label htmlFor="domainName">Domain Name</label>
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
                <span className="text-danger">
                  {errors.domainName?.message}
                </span>
              )}
            </div>

            {/* Whatsapp channel */}
            <div className="form-group">
              <label htmlFor="websiteTitle">whatsapp Channel</label>
              <input
                type="text"
                className="form-control"
                id="whatsappChannel"
                placeholder="Enter whatsappChannel Link"
                {...register("whatsappChannel")}
              />
            </div>
            {/* Whatsapp Number */}
            <div className="form-group">
              <label htmlFor="websiteTitle">whatsapp Number</label>
              <input
                type="text"
                className="form-control"
                id="whatsappNumber"
                placeholder="Enter whatsapp Number"
                {...register("whatsappNumber")}
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
