import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import exchangeRate, { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthProvider";
import { Helmet } from "react-helmet"; // Import Helmet for SEO
import { useSiteSettings } from "../context/SiteSettingsProvider";

function Services() {
  const [load, setLoad] = useState(true); // State to handle global loading
  const [services, setServices] = useState([]); // State to hold services
  const [categories, setCategories] = useState([]); // State to hold categories
  const [selectedCategory, setSelectedCategory] = useState(""); // State for selected category
  const { currency, setCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [authUser] = useAuth();
  const { siteSettings } = useSiteSettings();

  // Fetch categories and services simultaneously
  const fetchData = async () => {
    setLoad(true);
    try {
      const [categoryResponse, servicesResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_URL}Guest/getCategory`),
        axios.get(`${import.meta.env.VITE_URL}Guest/allServices`),
      ]);

      const fetchedCategories = categoryResponse.data;
      const sortedCategories = fetchedCategories
        .filter((category) => category.status === "active")
        .sort((a, b) => a.sort - b.sort);
      setCategories(sortedCategories);

      const fetchedServices = servicesResponse.data;
      if (fetchedServices) {
        setServices(fetchedServices);
        localStorage.setItem("services", JSON.stringify(fetchedServices)); // Store as JSON string
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoad(false); // Set loading to false only after both requests are done
    }
  };

  useEffect(() => {
    fetchData(); // Fetch both categories and services on component mount
  }, []);

  // Filter services based on the selected category
  const filteredServices = selectedCategory
    ? services.filter((service) => service.category === selectedCategory)
    : services; // Show all services if no category is selected

  // Group services by category for display
  const servicesByCategory = categories
    .map((category) => ({
      categoryName: category.name,
      services: filteredServices.filter(
        (service) => service.category === category.name
      ), // Only services for this category
    }))
    .filter((item) => item.services.length > 0);

  // Filter searched services based on search term
  const searchedServices = searchTerm
    ? services.filter(
        (service) =>
          service.serviceId.toString().includes(searchTerm) ||
          service.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : [];

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  return (
    <div>
      <Helmet>
        <title>
          Our Services - {selectedCategory || "All Categories"} |{" "}
          {siteSettings?.domainName}
        </title>
        <meta
          name="description"
          content={`Explore a wide range of services offered by ${
            siteSettings?.domainName
          }${
            selectedCategory ? ` in the ${selectedCategory} category` : ""
          }. Find the best solutions tailored to your needs.`}
        />
        <meta
          name="keywords"
          content={`services, ${
            selectedCategory || "all categories"
          }, service id, description, price`}
        />
        <meta
          property="og:title"
          content={`Our Services - ${selectedCategory || "All Categories"} | ${
            siteSettings?.domainName
          }`}
        />
        <meta
          property="og:description"
          content={`Discover premium services from ${siteSettings?.domainName}${
            selectedCategory ? ` in the ${selectedCategory} category` : ""
          }. Reliable and affordable solutions at your fingertips.`}
        />
        <meta
          property="og:url"
          content={`https://${siteSettings?.domainName}/services${
            selectedCategory ? `/${selectedCategory}` : ""
          }`}
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {authUser ? (
        <h1>Services</h1>
      ) : (
        <div className="row bg-200 d-flex align-items-center">
          <div className="col">
            <h1 className="ms-5">Services</h1>
          </div>
          <div className="col ">
            <div className="float-end me-5 border-400 p-2">
              <label htmlFor="SelectCurrency">Select Currency</label>
              <select
                className="currency-select bg-500"
                value={currency}
                onChange={handleCurrencyChange}
                style={{
                  border: "1px solid black",
                }}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
                <option value="PKR">PKR</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-6">
          <select
            name="SelectOrderHistoryType"
            id="OrderHistoryType"
            className="p-3 w-75 rounded-pill"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)} // Update selected category
          >
            <option value="">All</option>
            {categories.map((category) => {
              return (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="col-6">
          <div className="header-search float-end me-2 bg-400 rounded p-2">
            <div className="header-search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Service Id"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {load ? (
        <Loader />
      ) : searchTerm ? (
        // Display searched services if search term is present
        searchedServices.length > 0 ? (
          searchedServices.map((service) => (
            <div className="col-12 card my-2 px-2" key={service._id}>
              <div className="row">
                <div className="col-12 border-bottom card-title row justify-content-between">
                  <span className="col-10 text-ellipse fw-light">
                    <span className="fw-bold">{service.serviceId} - </span>
                    {service.name}
                  </span>
                  <span className="col-2 bg-light text-center rounded">
                    {currency}{" "}
                    {isNaN(parseFloat(service.rate))
                      ? "N/A"
                      : exchangeRate(
                          parseFloat(service.rate),
                          currency
                        ).toFixed(4)}
                  </span>
                </div>
                <div className="col-12 card-detail align-items-center">
                  <span className="fw-semibold mx-1">Min: </span>
                  {service.min}
                  <span className="fw-semibold mx-1">Max:</span> {service.max}
                  <button
                    type="button"
                    className="btn btn-main float-end"
                    data-bs-toggle="modal"
                    data-bs-target={`#modal-${service.serviceId}`}
                  >
                    Description
                  </button>
                </div>
                <div
                  className="modal fade"
                  id={`modal-${service.serviceId}`}
                  tabIndex="-1"
                  aria-labelledby="exampleModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered custom-modal-services">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">
                          Service Description
                        </h1>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        <p>
                          {service.description === ""
                            ? "No description available for this service"
                            : service.description}
                        </p>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-bs-dismiss="modal"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No services found for the given search term</p>
        )
      ) : servicesByCategory.length > 0 ? (
        // Display services by category if no search term is present
        servicesByCategory.map((item, index) => (
          <div className="my-3" key={index}>
            <div className="row px-2">
              <div className="col-12 bg-danger p-2  rounded text-light">
                <h5>
                  {index + 1}. {item.categoryName}
                </h5>
              </div>
            </div>

            <div className="row px-3">
              {item.services.length > 0 ? (
                item.services.map((service) => {
                  const convertedRate = isNaN(parseFloat(service.rate))
                    ? "N/A"
                    : exchangeRate(parseFloat(service.rate), currency).toFixed(
                        4
                      );
                  return (
                    <div className="col-12 card my-2 px-2" key={service._id}>
                      <div className="row">
                        <div className="col-12 border-bottom card-title row justify-content-between">
                          <span className="col-10 text-ellipse fw-light">
                            <span className="fw-bold">
                              {service.serviceId} -{" "}
                            </span>
                            {service.name}
                          </span>
                          <span className="col-2 bg-light text-center rounded">
                            {currency} {convertedRate}
                          </span>
                        </div>
                        <div className="col-12 card-detail align-items-center">
                          <span className="fw-semibold mx-1">Min: </span>
                          {service.min}
                          <span className="fw-semibold mx-1">Max:</span>{" "}
                          {service.max}
                          <button
                            type="button"
                            className="btn btn-main float-end"
                            data-bs-toggle="modal"
                            data-bs-target={`#modal-${service.serviceId}`}
                          >
                            Description
                          </button>
                        </div>
                        <div
                          className="modal fade"
                          id={`modal-${service.serviceId}`}
                          tabIndex="-1"
                          aria-labelledby="exampleModalLabel"
                          aria-hidden="true"
                        >
                          <div className="modal-dialog modal-dialog-centered custom-modal-services">
                            <div className="modal-content">
                              <div className="modal-header">
                                <h1
                                  className="modal-title fs-5"
                                  id="exampleModalLabel"
                                >
                                  Service Description
                                </h1>
                                <button
                                  type="button"
                                  className="btn-close"
                                  data-bs-dismiss="modal"
                                  aria-label="Close"
                                ></button>
                              </div>
                              <div className="modal-body">
                                <p>
                                  {service.description === ""
                                    ? "No description available for this service"
                                    : service.description}
                                </p>
                              </div>
                              <div className="modal-footer">
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  data-bs-dismiss="modal"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No services available for this category</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No services available</p>
      )}
    </div>
  );
}

export default Services;
