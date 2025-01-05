import React, { useEffect, useState } from "react";
import { MdAlternateEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { PiKeyholeBold } from "react-icons/pi";
import { useAuth } from "../context/AuthProvider";
import { FaClipboard, FaEye, FaKey, FaRegEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import Loader from "../components/Loader";
import { useSiteSettings } from "../context/SiteSettingsProvider";
import { Helmet } from "react-helmet"; // Import Helmet for SEO

function UserProfile() {
  const [authUser] = useAuth();
  const { siteSettings } = useSiteSettings();
  const [apiKey, setApiKey] = useState(null);
  const [load, setLoad] = useState(false); // State to handle loading
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showCurrentPassword1, setShowCurrentPassword1] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const {
    register: registerPasswordChange,
    handleSubmit: handlePasswordChange,
    formState: { errors: errorsPasswordChange },
    getValues,
    reset,
  } = useForm();

  const fetchApiKey = async () => {
    const userName = authUser.userName;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}user/apiKey/${userName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        setApiKey(res.data.apiKey);
      }
    } catch (error) {
      console.log("error Fetching Api", error); // Handle the error
    }
  };

  useEffect(() => {
    if (apiKey === null) {
      fetchApiKey();
    }
  }, []);

  const handleCreateNewApi = async () => {
    const userName = authUser.userName;
    const token = localStorage.getItem("token").replace(/^"|"$|'/g, "");

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_URL}user/newApiKey/${userName}`,
        {}, // Empty body if there is no data to send in the request
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data) {
        setApiKey(res.data.apiKey); // Set the new API key in the state
      }
    } catch (error) {
      console.log("Error Creating New Api:", error); // Log error if the request fails
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey); // Copy full API key to clipboard
    }
  };

  const maskedApi = () => {
    if (!apiKey || apiKey.length <= 8) return apiKey;

    const numVisibleChars = 4;
    const start = apiKey.slice(0, numVisibleChars);
    const end = apiKey.slice(-numVisibleChars);
    const maskedMiddle = "*".repeat(apiKey.length - 2 * numVisibleChars);

    return `${start}${maskedMiddle}${end}`;
  };

  const OnEmailChange = async (data) => {
    const EmailData = {
      userName: authUser.userName,
      email: authUser.email,
      newEmail: data.newEmail,
      password: data.password,
    };
    console.log(EmailData);
    setLoad(true);
    try {
      // Await the axios POST request to ensure it completes
      const res = await axios.put(
        "${import.meta.env.VITE_URL}user/changeEmail",
        EmailData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data) {
        console.log(res.data);
        toast.success("Email Address Changed successfully");
      }
    } catch (error) {
      console.log(error); // Log error details
      // Check if response exists to get error message
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoad(false);
    }
  };
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  const toggleCurrentPasswordVisibility1 = () => {
    setShowCurrentPassword1(!showCurrentPassword1);
  };
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const eyeplace = {
    position: "absolute",
    right: "30px",
    top: "67%", // Aligns to the center of the input field
    transform: "translateY(-50%)", // Centers vertically
    cursor: "pointer",
    zIndex: 2,
  };
  const invalidFeedback = {
    position: "absolute",
    bottom: "-20px",
    fontSize: "0.875em",
    color: "#dc3545",
    width: "100%",
    paddingLeft: "15px",
  };

  // change password
  const onSubmitPasswordChange = async (data) => {
    const passwordData = {
      userName: authUser.userName,
      password: data.password,
      newPassword: data.newPassword,
    };
    setLoad(true);
    try {
      // Await the axios POST request to ensure it completes
      const res = await axios.put(
        "${import.meta.env.VITE_URL}user/ChangePassword",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data) {
        toast.success("Password Changed successfully");
      }
    } catch (error) {
      console.log(error); // Log error details
      // Check if response exists to get error message
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoad(false);
      reset();
    }
  };
  return (
    <div className="px-4 px-lg-2">
      {load && <Loader />}
      <Helmet>
        <title>User Profile | Manage Your Account</title>
        <meta
          name="description"
          content={`Manage your user profile on ${siteSettings?.domainName}. Update your name, email, API key, and password securely and efficiently.`}
        />
        <meta
          name="keywords"
          content="user profile, account management, update profile, API key, change password"
        />
        <meta
          property="og:title"
          content="User Profile | Manage Your Account"
        />
        <meta
          property="og:description"
          content={`Access and manage your ${siteSettings?.domainName} account settings, including updating personal information, API key, and password.`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://${siteSettings?.domainName}/user-profile`}
        />
      </Helmet>

      <div className="row p-2 my-2">
        <div className="col-12 my-2 bg-200 py-4 rounded">
          <h4>
            {" "}
            <MdAlternateEmail className="me-1" />
            Change Your email address
          </h4>
          <form onSubmit={handleSubmit(OnEmailChange)}>
            <div className="mb-3">
              <label>Current Email</label>
              <input
                type="text"
                className="form-control p-2"
                disabled
                placeholder={authUser.email}
              />
            </div>
            <div className="mb-3">
              <label>New Email</label>
              <input
                type="text"
                className={`form-control p-2 ${
                  errors.newEmail ? "is-invalid" : ""
                }`} // Apply 'is-invalid' if there's an error
                id="new_email"
                placeholder="Enter New email"
                {...register("newEmail", { required: true })}
              />
              {errors.newEmail && (
                <div className="invalid-feedback">New Email is Required.</div>
              )}
            </div>
            <div className="mb-3 position-relative">
              <label>Current Password</label>
              <input
                type={!showCurrentPassword ? "password" : "text"}
                className={`form-control p-2 ${
                  errors.password ? "is-invalid" : ""
                }`} // Apply 'is-invalid' if there's an error
                id="current_password"
                placeholder="Enter Current Password"
                {...register("password", { required: true })}
              />
              {errors.password && (
                <div className="invalid-feedback">Password is Required.</div>
              )}
              <span style={eyeplace} onClick={toggleCurrentPasswordVisibility}>
                {!showCurrentPassword ? <FaRegEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="btn btn-main py-2">
              Change Email
            </button>
          </form>
        </div>
        <div className="col-12 my-2 bg-200 py-4 rounded">
          <h4>
            {" "}
            <FaKey className="me-1" />
            Change Your Password
          </h4>
          <form onSubmit={handlePasswordChange(onSubmitPasswordChange)}>
            <div className="mb-3 position-relative">
              <label>Current Password</label>
              <input
                type={!showCurrentPassword1 ? "password" : "text"}
                className={`form-control p-2 ${
                  errorsPasswordChange.password ? "is-invalid" : ""
                }`}
                placeholder="Enter Current Password"
                {...registerPasswordChange("password", {
                  required: "Current Password is required",
                })}
              />
              {errorsPasswordChange.password && (
                <div className="invalid-feedback" style={invalidFeedback}>
                  {errorsPasswordChange.password.message}
                </div>
              )}
              <span style={eyeplace} onClick={toggleCurrentPasswordVisibility1}>
                {!showCurrentPassword1 ? <FaRegEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="mb-3 position-relative">
              <label>New Password</label>
              <input
                type={!showNewPassword ? "password" : "text"}
                className={`form-control p-2 ${
                  errorsPasswordChange.newPassword ? "is-invalid" : ""
                }`}
                placeholder="Enter New Password"
                {...registerPasswordChange("newPassword", {
                  required: "New Password is required",
                })}
              />
              {errorsPasswordChange.newPassword && (
                <div className="invalid-feedback" style={invalidFeedback}>
                  {errorsPasswordChange.newPassword.message}
                </div>
              )}
              <span style={eyeplace} onClick={toggleNewPasswordVisibility}>
                {!showNewPassword ? <FaRegEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="mb-3 position-relative">
              <label>Confirm New Password</label>
              <input
                type={!showConfirmPassword ? "password" : "text"}
                className={`form-control p-2 ${
                  errorsPasswordChange.confirmPassword ? "is-invalid" : ""
                }`}
                placeholder="Confirm New Password"
                {...registerPasswordChange("confirmPassword", {
                  required: "Confirmation is required",
                  validate: (value) => {
                    const { newPassword } = getValues();
                    return (
                      value === newPassword || "New Passwords do not match"
                    );
                  },
                })}
              />
              {errorsPasswordChange.confirmPassword && (
                <div className="invalid-feedback" style={invalidFeedback}>
                  {errorsPasswordChange.confirmPassword.message}
                </div>
              )}
              <span style={eyeplace} onClick={toggleConfirmPasswordVisibility}>
                {!showConfirmPassword ? <FaRegEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="btn btn-warning py-2">
              Change Password
            </button>
          </form>
        </div>
        <div className="col-12 my-2 bg-200 py-4 rounded">
          <h4>
            {" "}
            <RiLockPasswordFill className="me-1" />
            Two-factor authentication
          </h4>
          <p>
            Email-based option to add an extra layer of protection to your
            account. When signing in you’ll need to enter a code that will be
            sent to your email address.
          </p>
          <button className="btn btn-danger">Enable</button>
        </div>
        <div className="col-12 my-2 bg-200 py-4 rounded">
          <h4>
            {" "}
            <PiKeyholeBold className="me-1" />
            Your Api Key
          </h4>
          <span
            title="Click to copy API Key"
            onClick={handleCopyApiKey}
            style={{ cursor: "pointer" }}
          >
            CLick To Copy API Key
            <FaClipboard className="ms-1" />
          </span>
          <input
            type="text"
            style={{ cursor: "pointer" }}
            className="form-control p-2 my-2"
            readOnly
            onClick={handleCopyApiKey}
            title="Click to copy API Key"
            placeholder={maskedApi()}
          />

          <button className="btn btn-info" onClick={handleCreateNewApi}>
            Generate New
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
