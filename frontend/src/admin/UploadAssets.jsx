import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
const UploadAssets = () => {
  const {
    register: registerLogo,
    handleSubmit: handleSubmitLogo,
    formState: { errors: logoErrors },
  } = useForm();

  const {
    register: registerFavicon,
    handleSubmit: handleSubmitFavicon,
    formState: { errors: faviconErrors },
  } = useForm();

  const [load, setLoad] = useState(false);

  // Handle logo upload
  const onLogoSubmit = async (data) => {
    setLoad(true);
    const formData = new FormData();
    formData.append("logo", data.logo[0]);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}uploads/update-logo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.message);
      console.log("error uploading logo: " + error.message);
    } finally {
      setLoad(false);
    }
  };

  // Handle favicon upload
  const onFaviconSubmit = async (data) => {
    setLoad(true);
    const formData = new FormData();
    formData.append("favicon", data.favicon[0]);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}uploads/update-favicon`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.message);
      console.log("error uploading favicon: " + error.message);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Update Logo & Favicon</h2>
      {load && <Loader />}
      {/* Logo Form */}
      <form
        onSubmit={handleSubmitLogo(onLogoSubmit)}
        className="p-4 mb-4 border rounded bg-light shadow-sm"
      >
        <h4>Update Logo</h4>
        <div className="mb-3 form-control">
          <label htmlFor="logo" className="form-label">
            Select Logo (PNG):
          </label>
          <input
            type="file"
            accept="image/png"
            id="logo"
            className={`form-control ${logoErrors.logo ? "is-invalid" : ""}`}
            {...registerLogo("logo", {
              required: "Logo is required.",
            })}
          />
          {logoErrors.logo && (
            <div className="invalid-feedback">{logoErrors.logo.message}</div>
          )}
        </div>
        <button type="submit" className="btn btn-main my-2 ">
          Update Logo
        </button>
      </form>

      {/* Favicon Form */}
      <form
        onSubmit={handleSubmitFavicon(onFaviconSubmit)}
        className="p-4  mb-4 border rounded bg-light shadow-sm"
      >
        <h4>Update Favicon</h4>
        <div className="mb-3 form-control">
          <label htmlFor="favicon" className="form-label">
            Select Favicon (ICO):
          </label>
          <input
            type="file"
            accept="image/x-icon"
            id="favicon"
            className={`form-control ${
              faviconErrors.favicon ? "is-invalid" : ""
            }`}
            {...registerFavicon("favicon", {
              required: "Favicon is required.",
            })}
          />
          {faviconErrors.favicon && (
            <div className="invalid-feedback">
              {faviconErrors.favicon.message}
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-main my-2">
          Update Favicon
        </button>
      </form>
    </div>
  );
};

export default UploadAssets;
