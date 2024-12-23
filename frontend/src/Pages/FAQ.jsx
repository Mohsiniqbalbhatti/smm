import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import axios from "axios";
function FAQ() {
  const [faq, setFaq] = useState(null); // State to store terms content
  const [loading, setLoading] = useState(true); // State to handle loading status

  // Function to fetch terms content from the backend
  const getFAQ = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}siteSettings/getFAQ`
      );
      if (response.data.success) {
        setFaq(response.data.faqPageContent); // Set terms content on success
      } else {
        console.error("Failed to fetch terms content");
      }
    } catch (error) {
      console.error("Error fetching terms content:", error);
    } finally {
      setLoading(false); // Hide loader once the request completes
    }
  };

  useEffect(() => {
    getFAQ(); // Fetch terms content on component mount
  }, []);

  return (
    <div className="px-2 px-lg-4">
      {loading && <Loader />}

      <div className="row">
        <div dangerouslySetInnerHTML={{ __html: faq }} className="col-12" />
      </div>
    </div>
  );
}

export default FAQ;
