import React, { useEffect, useState } from "react";
import { IoAddCircle } from "react-icons/io5";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import exchangeRate, { useCurrency } from "../context/CurrencyContext";

function Services() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [load, setLoad] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const { currency } = useCurrency();
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fetchCategoriesList = async () => {
    setLoad(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}Guest/getCategory`
      );
      const categories = response.data;
      setCategories(categories);
    } catch (error) {
      console.error("Error fetching Categories list:", error);
      toast.error("Error fetching categories");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  const sortedCategories = categories
    .filter(
      (category) =>
        category.status === "active" &&
        (category.ApiStatus === "active" || !category.ApiStatus)
    )
    .sort((a, b) => a.sort - b.sort);

  const fetchServices = async (category) => {
    setLoad(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_URL
        }admin/apiServices/category/${encodeURIComponent(category)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setServices(res.data || []);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Error fetching services");
      setServices([]); // Reset services on error
    } finally {
      setLoad(false);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryName = e.target.value;
    setSelectedCategory(selectedCategoryName);
    if (selectedCategoryName) {
      fetchServices(selectedCategoryName);
    } else {
      setServices([]);
    }
  };

  const deleteService = async (serviceId) => {
    if (!serviceId) {
      toast.error("Service ID not found");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );
    if (!confirmDelete) return;

    setLoad(true);
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
        setServices((prevServices) =>
          prevServices.filter((service) => service._id !== serviceId)
        ); // Filter by service ID correctly
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Error deleting service");
    } finally {
      setLoad(false);
    }
  };

  const handleEditClick = (service) => {
    setSelectedService(service);
  };

  const onSubmit = async (data) => {
    const editServiceData = {
      originalRate: selectedService ? selectedService.originalRate : null,
      ApiName: selectedService ? selectedService.ApiName : null,
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
    setLoad(true);
    console.log(editServiceData);
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
        toast.success(res.data.message); // Show success message
        setSelectedService(null); // Clear selectedService after successful edit
      }
    } catch (error) {
      console.error("Error updating service:", error); // Log the error for debugging
      toast.error("Failed to update service"); // Show error message
    } finally {
      setLoad(false); // Ensure loading is set to false after the request
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
      });
    }
  }, [selectedService, reset]);

  return (
    <div>
      {load && <Loader />} {/* Show loader only when load is true */}
      <div className="row d-flex align-items-center justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 mt-2">
          <Link to={"/admin/apiServices"} className="btn btn-main">
            <IoAddCircle className="fs-2 pe-2" /> Add Services
          </Link>
        </div>
        <div className="col-12 col-md-8 col-lg-6 mt-2">
          <select
            name="SelectApi"
            id="SelectApi"
            className="w-100 p-2 rounded border-0"
            onChange={handleCategoryChange}
            value={selectedCategory}
          >
            <option value="">Select Category</option>
            {sortedCategories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name} {/* Display category name */}
              </option>
            ))}
          </select>
        </div>
      </div>
      {services.length > 0 ? (
        <div className="overflow-x-auto mx-2 mt-3">
          <table className="table table-bordered border-secondary custom-table2">
            <thead>
              <tr>
                <th className="fw-medium">No</th>
                <th className="fw-medium">Services Id</th>
                <th className="fw-medium">Name</th>
                <th className="fw-medium">Category</th>
                <th className="fw-medium">Rate Per 1000{currency}</th>
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
                  <td>{service.serviceId}</td>
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
                      type="button"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasRight"
                      aria-controls="offcanvasRight"
                      onClick={() => handleEditClick(service)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteService(service.service)}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedCategory && (
          <p className="text-center mt-3">
            No services found for this category.
          </p>
        )
      )}
      {selectedService && ( // Check if selectedService is not null
        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasRight"
          aria-labelledby="offcanvasRightLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasRightLabel">
              <FaEdit className="pe-2 fs-2" /> Edit Service
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Service Id */}
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
                  {...register("service", { required: false })} // Register input with validation
                  disabled
                />
              </div>

              {/* Service Name */}
              <div className="mb-3">
                <label htmlFor="ServiceName" className="form-label">
                  Service Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ServiceName"
                  defaultValue={selectedService?.name}
                  {...register("name", { required: true })}
                  placeholder="Enter Service Name"
                />
                {errors.name?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Name is required
                  </p>
                )}
              </div>

              {/* Service Category */}
              <div className="mb-3">
                <label htmlFor="ServiceCategory" className="form-label">
                  Category
                </label>
                <select
                  id="ServiceCategory"
                  className="form-select"
                  defaultValue={selectedService?.category} // Set selected value from selectedService
                  {...register("category", { required: true })}
                >
                  <option value="">Select Category</option>
                  {sortedCategories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category?.type === "required" && (
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
                  id="ServiceRate" // Unique ID for accessibility
                  defaultValue={selectedService?.rate}
                  {...register("rate", { required: true })} // Register input with validation
                  placeholder="Enter Service Rate" // Added placeholder for better UX
                  aria-describedby="serviceRateHelp" // Aria reference to the descriptive text or error
                />
                {errors.rate?.type === "required" ? (
                  <p role="alert" className="text-danger" id="serviceRateHelp">
                    Rate is required
                  </p>
                ) : (
                  <small id="serviceRateHelp" className="form-text text-muted">
                    Enter custom rate you want for this service. Always in USD
                  </small>
                )}
              </div>

              {/* Min and Max Order */}
              <div className="mb-3">
                <label htmlFor="MinOrder" className="form-label">
                  Min Order
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="MinOrder"
                  defaultValue={selectedService?.min}
                  {...register("min", { required: true })}
                  placeholder="Enter Min Order"
                />
                {errors.min?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Min Order is required
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="MaxOrder" className="form-label">
                  Max Order
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="MaxOrder"
                  defaultValue={selectedService?.max}
                  {...register("max", { required: true })}
                  placeholder="Enter Max Order"
                />
                {errors.max?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Max Order is required
                  </p>
                )}
              </div>

              {/* Refill and Drip Feed */}
              <div className="mb-3">
                <label htmlFor="ServiceDripFeed" className="form-label">
                  Drip Feed
                </label>
                <select
                  className={`form-select ${
                    errors.dripfeed ? "is-invalid" : ""
                  }`} // Add 'is-invalid' class if there's an error
                  {...register("dripfeed", { required: true })} // Ensure required validation
                  defaultValue={selectedService?.dripfeed} // Set selected value from selectedService
                >
                  <option value="">Select Status</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                {errors.dripfeed?.type === "required" && (
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
                  className={`form-select ${errors.refill ? "is-invalid" : ""}`} // Add 'is-invalid' class if there's an error
                  {...register("refill", { required: true })} // Ensure required validation
                  defaultValue={selectedService?.refill} // Set selected value from selectedService
                >
                  <option value="">Select Status</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                {errors.refill?.type === "required" && (
                  <p role="alert" className="text-danger">
                    refill is required
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-main">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;
