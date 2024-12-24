import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill's default theme CSS
import axios from "axios"; // Import axios for making HTTP requests
import toast from "react-hot-toast";

function EmailTemplates() {
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  // Initial state for multiple email templates
  const [templates, setTemplates] = useState({
    newUserWelcome: { subject: "", body: "" },
    newUserNotification: { subject: "", body: "" },
    passwordRecovery: { subject: "", body: "" },
    paymentNotification: { subject: "", body: "" },
    emailVerification: { subject: "", body: "" },
  });

  // Handle subject change for each template
  const handleSubjectChange = (e, template) => {
    setTemplates({
      ...templates,
      [template]: {
        ...templates[template],
        subject: e.target.value,
      },
    });
  };

  // Handle body change in the Quill editor
  const handleBodyChange = (value, template) => {
    setTemplates({
      ...templates,
      [template]: {
        ...templates[template],
        body: value,
      },
    });
  };

  // Fetch email templates from the backend
  const fetchEmailTemplates = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}siteSettings/getEmailTemplates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetchedTemplates = response.data;
      console.log("Fetched Templates:", fetchedTemplates); // Debug log

      if (fetchedTemplates) {
        toast.success("Templates fetched");

        // Ensure body is a valid string and not undefined
        setTemplates({
          newUserWelcome: {
            subject: fetchedTemplates.newUserWelcomeEmail.subject,
            body: fetchedTemplates.newUserWelcomeEmail.body,
          },
          newUserNotification: {
            subject: fetchedTemplates.newUserNotificationEmail.subject,
            body: fetchedTemplates.newUserNotificationEmail.body,
          },
          passwordRecovery: {
            subject: fetchedTemplates.passwordRecoveryEmail.subject,
            body: fetchedTemplates.passwordRecoveryEmail.body,
          },
          paymentNotification: {
            subject: fetchedTemplates.paymentNotificationEmail.subject,
            body: fetchedTemplates.paymentNotificationEmail.body,
          },
          emailVerification: {
            subject: fetchedTemplates.emailVerificationEmail.subject,
            body: fetchedTemplates.emailVerificationEmail.body,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching email templates:", error);
    }
  };

  // Submit the updated email templates to the backend
  const handleSubmit = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_URL}siteSettings/updateEmailTemplates`,
        {
          newUserWelcomeEmail: templates.newUserWelcome,
          newUserNotificationEmail: templates.newUserNotification,
          passwordRecoveryEmail: templates.passwordRecovery,
          paymentNotificationEmail: templates.paymentNotification,
          emailVerificationEmail: templates.emailVerification,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Email templates updated successfully.");
    } catch (error) {
      console.error("Error updating email templates:", error);
      toast.error("Failed to update email templates.");
    }
  };

  // Use effect hook to fetch templates on component mount
  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline"],
      [{ align: [] }],
      ["link"],
      ["image"],
      [{ color: [] }, { background: [] }],
      ["blockquote", "code-block"],
      ["clean"], // Button to clear content
    ],
  };

  return (
    <div className="card">
      <div className="card-title">
        <h3>Email Templates</h3>
      </div>
      <div className="card-body">
        {Object.keys(templates).map((templateKey) => (
          <div key={templateKey} className="mb-3 bg-100 shadow-sm p-3 rounded">
            <h4>{templateKey.replace(/([A-Z])/g, " $1")}</h4>
            <label htmlFor={`subject-${templateKey}`}>Subject</label>
            <input
              type="text"
              className="form-control"
              id={`subject-${templateKey}`}
              placeholder={`Enter subject for ${templateKey}`}
              value={templates[templateKey].subject}
              onChange={(e) => handleSubjectChange(e, templateKey)} // Handle subject change
            />
            <label htmlFor={`body-${templateKey}`} className="mt-3">
              Body
            </label>
            {/* Quill editor for email body */}
            <ReactQuill
              value={templates[templateKey].body} // Bind the editor value to the state
              onChange={(value) => handleBodyChange(value, templateKey)} // Handle body change
              theme="snow" // Use Quill's snow theme
              modules={modules} // Set the custom toolbar options
              placeholder={`Edit the ${templateKey} body here...`} // Placeholder text
            />
          </div>
        ))}
        <div className="mt-3">
          <button className="btn btn-main my-2" onClick={handleSubmit}>
            Submit Email Templates
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailTemplates;
