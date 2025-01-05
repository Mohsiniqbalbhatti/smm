import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import axios from "axios";
import { Helmet } from "react-helmet"; // Import Helmet for SEO
import { useSiteSettings } from "../context/SiteSettingsProvider";

function TermsCondition() {
  const [terms, setTerms] = useState(null); // State to store terms content
  const [loading, setLoading] = useState(true); // State to handle loading status
  const { siteSettings } = useSiteSettings();

  // Function to fetch terms content from the backend
  const getTerms = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}siteSettings/getTerms`
      );
      if (response.data.success) {
        setTerms(response.data.termsPageContent); // Set terms content on success
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
    getTerms(); // Fetch terms content on component mount
  }, []);

  return (
    <div className="px-2 px-lg-4">
      <Helmet>
        <title>Terms and Conditions | {siteSettings?.domainName}</title>
        <meta
          name="description"
          content={`Read the Terms and Conditions of using ${siteSettings?.domainName}. Understand the rules, responsibilities, and guidelines for using our platform.`}
        />
        <meta
          name="keywords"
          content="terms and conditions, user agreement, rules, policies, ${siteSettings?.domainName} terms"
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content={`Terms and Conditions | ${siteSettings?.domainName}`}
        />
        <meta
          property="og:description"
          content={`Understand the legal terms and conditions of using ${siteSettings?.domainName}. Review our policies, responsibilities, and user agreements.`}
        />
        <meta
          property="og:url"
          content={`https://${siteSettings?.domainName}/terms`}
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://${siteSettings?.domainName}/terms`}
        />
      </Helmet>

      {loading && <Loader />}

      {/* Page header */}

      <div className="row">
        <div dangerouslySetInnerHTML={{ __html: terms }} className="col-12" />
      </div>
    </div>
  );
}

export default TermsCondition;
