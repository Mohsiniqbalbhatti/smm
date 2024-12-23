import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill's default theme CSS
import Loader from "../../components/Loader";
import axios from "axios"; // Import axios for making HTTP requests
import toast from "react-hot-toast";
function FAQSettings() {
  const [editorValue, setEditorValue] = useState(""); // State to store editor content
  const [load, setLoad] = useState(false); // State to store loading status
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  // Fetch terms content from the database when the component mounts
  useEffect(() => {
    const fetchFAQContent = async () => {
      try {
        setLoad(true); // Show loading spinner while fetching content
        const response = await axios.get(
          `${import.meta.env.VITE_URL}siteSettings/getFAQ`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // If terms content is available, set it in the editor
        if (response.data?.faqPageContent) {
          setEditorValue(response.data.faqPageContent); // Populate editor with saved HTML content
        }
      } catch (error) {
        console.error("Error fetching terms content:", error);
      } finally {
        setLoad(false); // Hide loading spinner after fetching
      }
    };

    fetchFAQContent();
  }, []); // Empty dependency array to run only once on mount

  // Handle content change in the editor
  const handleChange = (value) => {
    setEditorValue(value); // Update state with new editor value
  };

  const saveContent = async () => {
    console.log(editorValue);
    setLoad(true); // Show loading spinner while saving content
    const faqPageContent = { faqPageContent: editorValue }; // Wrap in an object
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}siteSettings/updateFAQ`,
        faqPageContent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Faqs Updated Successfully");
      }

      console.log(response.data); // Log response for debugging
    } catch (error) {
      console.error("Error submitting site settings:", error); // Log error
    } finally {
      setLoad(false); // Hide loading spinner after saving
    }
  };

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
    <div>
      {load && <Loader />} {/* Show loading spinner while loading */}
      <h1>FAQ Settings</h1>
      <ReactQuill
        value={editorValue} // Bind the editor value to the state
        onChange={handleChange} // Update the state on editor change
        theme="snow" // Use Quill's snow theme
        modules={modules} // Set the custom toolbar options
        placeholder="Edit the  FAQ page content  here..." // Placeholder text
      />
      <div className="mt-3">
        <button className="btn btn-main my-2" onClick={saveContent}>
          Save FAQ Content
        </button>
      </div>
    </div>
  );
}

export default FAQSettings;
