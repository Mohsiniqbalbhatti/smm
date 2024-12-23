import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { FaPlus } from "react-icons/fa6";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import exchangeRate, { useCurrency } from "../context/CurrencyContext";

function ApiServices() {
  const [apiList, setApiList] = useState([]); // State to hold the list of APIs
  const [loading, setLoading] = useState(false); // State to manage loading
  const [selectedApi, setSelectedApi] = useState("0"); // State to hold the selected API
  const [services, setServices] = useState([]); // State to hold services related to selected API
  const [selectedService, setSelectedService] = useState(null); // State to hold service selected to edit
  const [categoryList, setCategoryList] = useState([]); // State to
  const { currency } = useCurrency();

  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  // First form for bulk add
  const {
    register: registerBulkAdd,
    handleSubmit: handleBulkAdd,
    formState: { errors: errorsBulkAdd },
  } = useForm();

  // Second form for rate edit
  const {
    register: registerRateEdit,
    handleSubmit: handleRateEdit,
    formState: { errors: errorsRateEdit },
  } = useForm();
  //  form for  edit Service
  const {
    register: registerEditService,
    handleSubmit: handleServiceEdit,
    reset,
    formState: { errors: errorsEditService },
  } = useForm();

  useEffect(() => {
    const getAPiList = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_URL}admin/ApiList`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data) {
          setApiList(res.data); // Store the API list in state
        }
      } catch (err) {
        console.log(err);
        toast.error(err.message);
      } finally {
        setLoading(false); // Set loading to false after the request is complete
      }
    };
    getAPiList();
  }, []);

  // Handle selection change in the dropdown
  const handleApiChange = (e) => {
    const selectedApiName = e.target.value;
    if (selectedApiName === "null") {
      toast.error("Please Select API");
    }
    setSelectedApi(selectedApiName); // Update selected API state
    if (selectedApiName) {
      fetchServices(selectedApiName); // Fetch services for the selected API
    } else {
      setServices([]); // Clear services if no API is selected
    }
  };

  // Handle submit for bulk add
  const onBulkAddSubmit = async (data) => {
    // Changed function name for clarity
    const addService = {
      ApiName: selectedApiDetails.ApiName,
      ApiEndPoint: selectedApiDetails.ApiEndPoint,
      ApiKey: selectedApiDetails.ApiKey,
      ApiStatus: selectedApiDetails.ApiStatus,
      refill: data.refill,
      limit: data.limit,
      rateIncrease: data.rateIncrease,
    };
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}admin/apiServices/addServices`,
        addService,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        toast.success("Successfully added");
        setLoading(false);
      }
    } catch (err) {
      console.log("Error Adding Api Services: ", err);
      toast.error(err.message);
    } finally {
      setLoading(false); // Ensure loading is set to false after the request
    }
  };

  // Handle submit for Rate edit
  const onRateEditSubmit = async (data) => {
    // Changed function name for clarity
    const EditRate = {
      ApiName: selectedApiDetails.ApiName,
      ApiEndPoint: selectedApiDetails.ApiEndPoint,
      ApiKey: selectedApiDetails.ApiKey,
      rateChange: data.rateChange,
    };
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}admin/apiServices/updateRates`,
        EditRate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        toast.success("Rate updated successfully");
        fetchServices();
        setLoading(false);
      }
    } catch (err) {
      console.log("Error Adding Api Services: ", err);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (selectedService) {
      // Only reset if selectedService is not null
      reset({
        service: selectedService.service || "",
        name: selectedService.name || "",
        category: selectedService.category || "",
        rate: selectedService.rate || "",
        min: selectedService.min || "",
        max: selectedService.max || "",
        description: selectedService.description || "",
        dripfeed:
          selectedService.dripfeed !== undefined
            ? selectedService.dripfeed
            : "",
      });
    }
  }, [selectedService, reset]);

  // Fetch services for the selected API
  const fetchServices = async (ApiName) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}admin/apiServices/api/${ApiName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        setServices(res.data); // Store the services in state
      } else {
        setServices([]);
      }
    } catch (err) {
      setServices([]); // Reset services on error
      console.log(err);
      toast.error(err.response?.data?.message || "Error fetching services"); // Added optional chaining to prevent errors if message is undefined
    } finally {
      setLoading(false); // Set loading to false after the request is complete
    }
  };

  // Find selected API details for the bulk add form
  const selectedApiDetails =
    apiList.find((api) => api.ApiName === selectedApi) || {};

  // delete service
  const deleteService = async (serviceId) => {
    if (!serviceId) {
      toast.error("Service ID not found");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );
    if (!confirmDelete) return;

    setLoading(true); // Show loading indicator
    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_URL
        }admin/apiServices/deleteService/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        toast.success("Service deleted successfully");
        // Update UI by removing the deleted service from the services list
        setServices(
          (prevServices) =>
            prevServices.filter((service) => service.service !== serviceId) // using service.service for filtering
        );
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Error deleting service");
    } finally {
      setLoading(false);
    }
  };

  // edit service code
  const handleEditClick = (service) => {
    setSelectedService(service);
    fetchCategoryList();
  };
  const onEditServiceSubmit = async (data) => {
    const editServiceData = {
      service: data.service,
      name: data.name,
      category: data.category,
      rate: data.rate,
      min: data.min,
      max: data.max,
      description: data.description,
      refill: data.refill,
      dripfeed: data.dripfeed,
    };

    setLoading(true); // Set loading to true when starting the request

    try {
      const res = await axios.put(
        // Changed to PUT for updating
        `${import.meta.env.VITE_URL}admin/apiServices/editService`,
        editServiceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        toast.success("Service updated successfully"); // Show success message
        setSelectedService(null); // Clear selectedService after successful edit
      }
    } catch (error) {
      console.error("Error updating service:", error); // Log the error for debugging
      toast.error("Failed to update service"); // Show error message
    } finally {
      setLoading(false); // Ensure loading is set to false after the request
    }
  };

  // const fetch category list
  const fetchCategoryList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}Guest/getCategory`
      );
      if (res.data) {
        setCategoryList(res.data); // Store the category list in state
        console.log(categoryList);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error fetching category list");
    } finally {
      setLoading(false); // Set loading to false after the request is complete
    }
  };
  const filteredApiList = apiList.filter((api) => api.ApiStatus === "active");
  const sortedCategories = categoryList.sort((a, b) => a.sort - b.sort);
  return (
    <div className="mx-2">
      <div className="row d-flex align-items-center justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h3>List of API Services</h3>
        </div>
        <div className="col-12 col-md-8 col-lg-6">
          {loading ? ( // Show spinner while loading
            <Loader />
          ) : (
            <select
              name="SelectApi"
              id="SelectApi"
              className="w-100 p-2 rounded border-0"
              onChange={handleApiChange} // Attach change handler
              value={selectedApi} // Control the selected value
            >
              <option value="0">Select API</option>
              {filteredApiList.map((api) => (
                <option key={api._id} value={api.ApiName}>
                  {api.ApiName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selectedApi === "0" ? (
        <div className="text-center my-5">
          <h2>Select an API to view its services</h2>
        </div>
      ) : (
        <div className="row mt-4 mx-2 bg-400 border py-2">
          <div className="col-6">
            <h4 className="float-start">Select API</h4>
          </div>
          <div className="col-6 d-flex flex-row-reverse ">
            <button
              className="btn btn-main  ms-3"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasRateEdit"
              aria-controls="offcanvasRight"
            >
              <FaEdit /> Edit Rate
            </button>
            <button
              className="btn btn-main "
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasBulkEdit"
              aria-controls="offcanvasRight"
            >
              <FaPlus /> Bulk ADD
            </button>
          </div>
        </div>
      )}

      {/* Bulk add offcanvas right */}
      <div
        className="offcanvas offcanvas-end pb-4"
        tabIndex="-1"
        id="offcanvasBulkEdit"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title d-flex align-items-center"
            id="offcanvasRightLabel"
          >
            <FaEdit className="pe-2 fs-2" /> Bulk Add All Services
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <hr />
        <div className="offcanvas-body">
          <form onSubmit={handleBulkAdd(onBulkAddSubmit)}>
            {" "}
            {/* Use handleBulkAdd */}
            <div className="mb-3">
              <label htmlFor="ApiName" className="form-label">
                API Name
              </label>
              <input
                type="text"
                className="form-control"
                id="ApiName"
                value={selectedApiDetails.ApiName || ""}
                disabled
              />
            </div>
            <div className="mb-3">
              <label htmlFor="ApiEndPoint" className="form-label">
                API End Point
              </label>
              <input
                type="text"
                className="form-control"
                id="ApiEndPoint"
                value={selectedApiDetails.ApiEndPoint || ""}
                disabled
              />
            </div>
            <div className="mb-3">
              <label htmlFor="ApiKey" className="form-label">
                API Key
              </label>
              <input
                type="text"
                className="form-control"
                id="ApiKey"
                value={selectedApiDetails.ApiKey || ""}
                disabled
              />
            </div>
            <div className="mb-3">
              <label htmlFor="rateIncrease" className="form-label">
                Price percentage increase
              </label>

              <select
                className="form-control"
                id="rateIncrease"
                aria-describedby="rateIncreaseHelp" // Link to the description
                {...registerBulkAdd("rateIncrease", { required: true })} // Register select with validation
              >
                <option value="">Select Percentage</option>
                {Array.from(
                  { length: 1000 },
                  (_, index) => 1 * (index + 1)
                ).map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </select>

              <div id="rateIncreaseHelp" className="form-text">
                Select how much you want to increase rates by percentage. For
                example, selecting 25% will increase the rate by 25%.
              </div>

              {errorsBulkAdd.rateIncrease?.type === "required" && (
                <p role="alert" className="text-danger">
                  Rate Increase is required
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Bulk ADD limit</label>
              <select
                className="form-select"
                {...registerBulkAdd("limit", { required: true })}
              >
                {Array.from({ length: 40 }, (_, index) => (index + 1) * 25).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                )}
              </select>
              {errorsBulkAdd.limit?.type === "required" && (
                <p role="alert" className="text-danger">
                  limit is required
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Refill</label>
              <select
                className="form-select"
                {...registerBulkAdd("refill", { required: true })}
              >
                <option value="">Select Refill type</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              {errorsBulkAdd.refill?.type === "required" && (
                <p role="alert" className="text-danger">
                  Refill type is required
                </p>
              )}
            </div>
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-main">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Rate offcanvas right */}
      <div
        className="offcanvas offcanvas-end pb-4"
        tabIndex="-1"
        id="offcanvasRateEdit"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title d-flex align-items-center"
            id="offcanvasRightLabel"
          >
            <FaEdit className="pe-2 fs-2" /> Edit Rate
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <hr />
        <div className="offcanvas-body">
          <form onSubmit={handleRateEdit(onRateEditSubmit)}>
            {" "}
            {/* Use handleRateEdit */}
            <div className="mb-3">
              <label htmlFor="ApiName" className="form-label">
                API Name
              </label>
              <input
                type="text"
                className="form-control"
                id="ApiName"
                value={selectedApiDetails.ApiName || ""}
                disabled
              />
            </div>
            <div className="mb-3">
              <label htmlFor="rateChange" className="form-label">
                Select new Rate
              </label>

              <select
                className="form-control"
                id="rateChange"
                aria-describedby="rateChangeHelp" // Link to the description
                {...registerRateEdit("rateChange", { required: true })} // Register select with validation
              >
                <option value="">Select Percentage</option>
                {Array.from({ length: 40 }, (_, index) => 25 * (index + 1)).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}%
                    </option>
                  )
                )}
              </select>

              <div id="rateChangeHelp" className="form-text">
                Select how much you want to increase rates by percentage. For
                example, selecting 25% will increase the rate by 25%.
              </div>

              {errorsRateEdit.rateIncrease?.type === "required" && (
                <p role="alert" className="text-danger">
                  Rate Increase is required
                </p>
              )}
            </div>
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-main">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {selectedApi === "0" ? (
        ""
      ) : (
        <div className="overflow-x-auto mx-2 mt-0">
          <table className="table table-bordered border-secondary custom-table2">
            <thead>
              <tr>
                <th className="fw-medium">No</th>
                <th className="fw-medium">Services Id</th>
                <th className="fw-medium">Name</th>
                <th className="fw-medium">Category</th>
                <th className="fw-medium">
                  Rate Per 1000 <small>{currency}</small>
                </th>
                <th className="fw-medium">Min/Max Order</th>
                <th className="fw-medium">Refill</th>
                <th className="fw-medium">Drip-feed</th>
                <th className="fw-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service._id}>
                  <td>{index + 1}</td>
                  <td>{service.service}</td>
                  <td>{service.name}</td>
                  <td>{service.category}</td>
                  <td>
                    {exchangeRate(parseFloat(service.rate), currency)
                      .toFixed(6)
                      .slice(0, 7)}
                  </td>
                  <td>
                    {service.min}/{service.max}
                  </td>
                  <td>{service.refill ? "true" : "false"}</td>
                  <td>{service.dripFeed ? "true" : "false"}</td>
                  <td className="d-flex">
                    <button
                      className="btn btn-warning me-2"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasEditService"
                      aria-controls="offcanvasRight"
                      onClick={() => handleEditClick(service)}
                    >
                      {" "}
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteService(service.service)}
                    >
                      {" "}
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedService === null ? (
        "" // Check if selectedService is null
      ) : (
        <div
          className="offcanvas offcanvas-end pb-4"
          tabIndex="-1"
          id="offcanvasEditService"
          aria-labelledby="offcanvasRightLabel"
        >
          <div className="offcanvas-header">
            <h5
              className="offcanvas-title d-flex align-items-center"
              id="offcanvasRightLabel"
            >
              <FaEdit className="pe-2 fs-2" /> Edit Service
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <hr />
          <div className="offcanvas-body">
            <form onSubmit={handleServiceEdit(onEditServiceSubmit)}>
              {/* Use handleRateEdit */}
              <div className="mb-3">
                <label htmlFor="ServiceId" className="form-label">
                  {" "}
                  {/* Changed id to ServiceId */}
                  Service Id
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ServiceId" // Unique ID for accessibility
                  defaultValue={selectedService?.service} // Optional chaining to prevent errors
                  {...registerEditService("service", { required: true })} // Register input with validation
                  disabled
                />
                {errorsEditService.service?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Service ID is required
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="ServiceName" className="form-label">
                  {" "}
                  {/* Changed id to ServiceName */}
                  Service Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ServiceName" // Unique ID for accessibility
                  defaultValue={selectedService?.name}
                  {...registerEditService("name", { required: true })} // Register input with validation
                  placeholder="Enter Service Name" // Added placeholder for better UX
                />
                {errorsEditService.name?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Name is required
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="ServiceCategory" className="form-label">
                  Service Category
                </label>

                <select
                  className="form-control"
                  id="ServiceCategory" // Unique ID for accessibility
                  defaultValue={selectedService?.category} // Set selected value from selectedService
                  {...registerEditService("category", { required: true })} // Register select with validation
                >
                  <option value="" disabled>
                    Select a Service Category
                  </option>{" "}
                  {/* Placeholder option */}
                  {sortedCategories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name} {/* Display category name */}
                    </option>
                  ))}
                </select>

                {errorsEditService.category?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Category is required
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="ServiceRate" className="form-label">
                  Service Rate USD
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="ServiceRate"
                  defaultValue={selectedService?.rate}
                  {...registerEditService("rate", { required: true })}
                  placeholder="Enter Service Rate"
                  aria-describedby="serviceRateHelp"
                />
                {errorsEditService.rate?.type === "required" ? (
                  <p role="alert" className="text-danger" id="serviceRateHelp">
                    Rate is required
                  </p>
                ) : (
                  <small id="serviceRateHelp" className="form-text text-muted">
                    Enter the custom rate you want for this service.Always in
                    USD
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="ServiceMin" className="form-label">
                  {" "}
                  {/* Changed id to ServiceMin */}
                  Min
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="ServiceMin" // Unique ID for accessibility
                  defaultValue={selectedService?.min}
                  {...registerEditService("min", { required: true })} // Register input with validation
                  placeholder="Enter Minimum" // Added placeholder for better UX
                />
                {errorsEditService.min?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Min is required
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="ServiceMax" className="form-label">
                  {" "}
                  {/* Changed id to ServiceMax */}
                  Max
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="ServiceMax" // Unique ID for accessibility
                  defaultValue={selectedService?.max}
                  {...registerEditService("max", { required: true })} // Register input with validation
                  placeholder="Enter Maximum" // Added placeholder for better UX
                />
                {errorsEditService.max?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Max is required
                  </p>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="ServiceMin" className="form-label">
                  {" "}
                  {/* Changed id to ServiceMin */}
                  Description
                </label>
                <textarea
                  name=""
                  id=""
                  className="w-100 p-2 rounded"
                  defaultValue={selectedService?.description}
                  {...registerEditService("description", { required: false })}
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="ServiceDripFeed" className="form-label">
                  Drip Feed
                </label>
                <select
                  className={`form-select ${
                    errorsEditService.dripfeed ? "is-invalid" : ""
                  }`} // Add 'is-invalid' class if there's an error
                  {...registerEditService("dripfeed", { required: true })} // Ensure required validation
                  defaultValue={selectedService?.dripfeed} // Set selected value from selectedService
                >
                  <option value="">Select Status</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                {errorsEditService.dripfeed?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Drip Feed is required
                  </p>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="ServiceRefill" className="form-label">
                  Refill
                </label>
                <select
                  className={`form-select ${
                    errorsEditService.refill ? "is-invalid" : ""
                  }`} // Add 'is-invalid' class if there's an error
                  {...registerEditService("refill", { required: true })} // Ensure required validation
                  defaultValue={selectedService?.refill} // Set selected value from selectedService
                >
                  <option value="">Select Status</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                {errorsEditService.refill?.type === "required" && (
                  <p role="alert" className="text-danger">
                    refill is required
                  </p>
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-main">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiServices;
