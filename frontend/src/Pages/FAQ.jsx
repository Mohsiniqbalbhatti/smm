import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import axios from "axios";
import { useSiteSettings } from "../context/SiteSettingsProvider";
import { Helmet } from "react-helmet"; // Import Helmet for SEO

function FAQ() {
  const [faq, setFaq] = useState(null); // State to store terms content
  const [loading, setLoading] = useState(true); // State to handle loading status
  const { siteSettings } = useSiteSettings();

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
      <Helmet>
        <title>{`FAQ | ${siteSettings?.domainName || ""}`}</title>{" "}
        <meta
          name="description"
          content={`Get answers to the most frequently asked questions on ${siteSettings?.domainName}. Find help and information about our services, policies, and more.`}
        />
        <meta
          name="keywords"
          content="FAQ, frequently asked questions, help center, support, services, {siteSettings?.domainName} FAQ"
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content={`FAQ | ${siteSettings?.domainName}`}
        />
        <meta
          property="og:description"
          content={`Find answers to common questions and get more information about ${siteSettings?.domainName} services, policies, and support.`}
        />
        <meta
          property="og:url"
          content={`https://${siteSettings?.domainName}/faq`}
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://${siteSettings?.domainName}/faq`}
        />
      </Helmet>

      {loading && <Loader />}

      <div className="row">
        <div dangerouslySetInnerHTML={{ __html: faq }} className="col-12" />
      </div>
    </div>
  );
}

export default FAQ;
