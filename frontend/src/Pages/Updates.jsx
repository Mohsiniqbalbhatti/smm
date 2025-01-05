import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet"; // Import Helmet for SEO
import Loader from "../components/Loader";
import axios from "axios";
import { useSiteSettings } from "../context/SiteSettingsProvider";

function Updates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("1");
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;
  const { siteSettings } = useSiteSettings();

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}updates/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data && response.data.updates) {
          setUpdates(response.data.updates);
        }
      } catch (error) {
        console.error("Error fetching updates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const filteredUpdates = updates.filter((update) => {
    if (filter === "1") return true;
    if (filter === "2" && update.changeType.includes("rate increased"))
      return true;
    if (filter === "3" && update.changeType.includes("rate decreased"))
      return true;
    if (filter === "4" && update.changeType.includes("service disabled"))
      return true;
    return false;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "Invalid Date";
    const dateString = timestamp.$date || timestamp;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    return date.toLocaleString("sv-SE", options).replace(" ", " ");
  };

  return (
    <div>
      {/* SEO Metadata */}
      <Helmet>
        <title>Updates | {siteSettings?.domainName}</title>
        <meta
          name="description"
          content={`Stay informed with the latest updates from ${siteSettings?.domainName}. Get real-time information about rate changes, service updates, and status changes.`}
        />
        <meta
          name="keywords"
          content="updates, rate changes, service updates, disabled services, rate increase, rate decrease"
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content={`Updates | ${siteSettings?.domainName}`}
        />
        <meta
          property="og:description"
          content={`Stay updated on all changes at ${siteSettings?.domainName}, including rate adjustments and service modifications.`}
        />
        <meta
          property="og:url"
          content={`https://${siteSettings?.domainName}/updates`}
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://${siteSettings?.domainName}/updates`}
        />
      </Helmet>

      {loading && <Loader />}

      <header className="row">
        <div className="col-6">
          <h1>Updates</h1>
        </div>
        <div className="col-6">
          <select
            name="SelectOrderHistoryType"
            id="OrderHistoryType"
            className="p-3 w-75 rounded-pill float-end me-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="1">All</option>
            <option value="2">Rate Increased</option>
            <option value="3">Rate Decreased</option>
            <option value="4">Services Disabled</option>
          </select>
        </div>
      </header>

      <section className="overflow-x-auto api-list-table bg-300 p-2 rounded mt-5">
        <table className="table mt-4 custom-table">
          <thead>
            <tr>
              <th>Service ID</th>
              <th>TimeStamp</th>
              <th>Name</th>
              <th className="text-center">Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredUpdates.map((update) => (
              <tr key={update._id}>
                <td>
                  <h1 className="badge rounded-pill text-bg-danger">
                    {update.serviceId}
                  </h1>
                </td>
                <td>{formatDate(update.timestamp)}</td>
                <td>{update.name}</td>
                <td>
                  <div className="btn-main p-2 rounded text-center">
                    {update.changeType}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Updates;
