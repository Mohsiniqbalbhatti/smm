import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
function EmailSettings() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  // Fetch email settings from the backend
  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}siteSettings/getEmailSettigs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          Object.keys(data).forEach((key) => setValue(key, data[key]));
        } else {
          toast.error(data.message || "Error fetching email settings");
        }
      } catch (err) {
        console.error("Could not fetch email settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmailSettings();
  }, [setValue]);

  // Update email settings on form submission
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}siteSettings/updateEmailSettings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || "Email settings updated successfully");
      } else {
        toast.error(result.message || "Error updating email settings");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setValue(e.target.name, e.target.checked); // Ensures boolean value (true/false)
  };

  if (loading)
    return (
      <p>
        <Loader />
      </p>
    );

  return (
    <div className="card">
      <div className="card-title">Email Settings</div>
      <div className="card-body">
        <form onSubmit={handleSubmit(onSubmit)} className="actionForm">
          <div className="row">
            <div className="col-md-12 col-lg-12">
              <div className="form-group">
                <div className="form-label">Email notifications</div>
                {/* Checkbox Fields */}
                {[
                  "is_verification_new_account",
                  "is_welcome_email",
                  "is_payment_notice_email",
                  "is_ticket_notice_email",
                  "is_ticket_notice_email_admin",
                ].map((field) => (
                  <div className="custom-controls-stacked" key={field}>
                    <label className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        name={field}
                        {...register(field)}
                        onChange={handleCheckboxChange}
                      />
                      <span className="custom-control-label">
                        {field
                          .replace(/_/g, " ")
                          .replace("is ", "")
                          .charAt(0)
                          .toUpperCase() +
                          field.replace(/_/g, " ").replace("is ", "").slice(1)}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              {/* Email Fields */}
              <div className="form-group">
                <label className="form-label">From</label>
                <input
                  className="form-control"
                  name="email_from"
                  {...register("email_from", {
                    required: "Email is required",
                  })}
                />
                {errors.email_from && (
                  <span className="text-danger">
                    {errors.email_from.message}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input
                  className="form-control"
                  name="email_name"
                  {...register("email_name", {
                    required: "Name is required",
                  })}
                />
                {errors.email_name && (
                  <span className="text-danger">
                    {errors.email_name.message}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Email APP Password</label>
                <input
                  className="form-control"
                  name="email_Password"
                  {...register("email_Password", {
                    required: "email Password is required",
                  })}
                />
                {errors.email_Password && (
                  <span className="text-danger">
                    {errors.email_Password.message}
                  </span>
                )}
              </div>
            </div>
            <div className="col-md-8">
              <div className="form-footer">
                <button type="submit" className="btn btn-main my-3">
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmailSettings;
