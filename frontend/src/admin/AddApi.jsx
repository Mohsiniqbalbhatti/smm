import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { FaEdit, FaListUl, FaTrashAlt } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import exchangeRate, { useCurrency } from "../context/CurrencyContext";

function AddApi() {
  const [load, setLoad] = useState(false);
  const [apiList, setApiList] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const { currency } = useCurrency();
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const {
    register: registerEditApi,
    handleSubmit: handleApiEdit,
    reset: resetEditApi, // Get reset for the edit form
    formState: { errors: errorsEditApi },
  } = useForm();

  const onSubmit = async (data) => {
    const newApi = {
      ApiName: data.ApiName,
      ApiEndPoint: data.ApiEndPoint,
      ApiKey: data.ApiKey,
      ApiStatus: data.ApiStatus,
    };
    setLoad(true);

    await axios
      .post(`${import.meta.env.VITE_URL}admin/ApiList`, newApi, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data) {
          if (res.status === 200) {
            toast.success(res?.message);
            reset();
            fetchApiList();
          } else if (res.status === 500) {
            toast.error(res?.error);
          }
          // Fetch API list after adding a new API
        }
      })
      .catch((err) => {
        console.log("Error Adding Api: ", err);
        const errorMessage = err.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoad(false);
      });
  };

  // Fetch API list from the database
  const fetchApiList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}admin/ApiList`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const apiData = response.data;
      setApiList(apiData); // Set updated API list with balance
    } catch (error) {
      console.error("Error fetching API list:", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    setLoad(true);
    fetchApiList();
  }, []);

  useEffect(() => {
    if (selectedApi) {
      // Reset the form with the selected API data whenever selectedApi changes
      resetEditApi({
        ApiName: selectedApi.ApiName,
        ApiEndPoint: selectedApi.ApiEndPoint,
        ApiKey: selectedApi.ApiKey,
        ApiStatus: selectedApi.ApiStatus,
      });
    }
  }, [selectedApi, resetEditApi]);

  // Delete API function
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this API?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_URL}admin/ApiList/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("API deleted successfully");
        fetchApiList(); // Refresh the list after deletion
      } catch (error) {
        console.error("Error deleting API:", error);
        toast.error("Failed to delete API");
      }
    }
  };

  const handleEditClick = (api) => {
    setSelectedApi(api);
  };

  const onEditApiSubmit = async (data) => {
    const updatedApi = {
      _id: selectedApi._id,
      ApiName: data.ApiName,
      ApiEndPoint: data.ApiEndPoint,
      ApiKey: data.ApiKey,
      ApiStatus: data.ApiStatus,
    };
    setLoad(true); // Set loading to true when starting the request

    try {
      const res = await axios.put(
        // Changed to PUT for updating
        `${import.meta.env.VITE_URL}admin/ApiList/editApi`,
        updatedApi,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        toast.success("API updated successfully"); // Show success message
        fetchApiList();
        setSelectedApi(null); // Clear selected API after successful edit
      }
    } catch (error) {
      console.error("Error updating service:", error); // Log the error for debugging
      toast.error("Failed to update service"); // Show error message
    } finally {
      setLoad(false); // Ensure loading is set to false after the request
    }
  };

  return (
    <div>
      <button
        className="btn btn-main d-flex align-items-center"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasRight"
        aria-controls="offcanvasRight"
      >
        <IoAddCircle className="fs-2 pe-2" /> Add API
      </button>

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title d-flex align-items-center"
            id="offcanvasRightLabel"
          >
            <FaEdit className="pe-2 fs-2" /> Add New API
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">API Name</label>
              <input
                type="text"
                className={`form-control ${errors.ApiName ? "is-invalid" : ""}`}
                {...register("ApiName", { required: true })}
              />
              {errors.ApiName && (
                <div className="invalid-feedback">API Name is required.</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">API End Point</label>
              <input
                type="text"
                className={`form-control ${
                  errors.ApiEndPoint ? "is-invalid" : ""
                }`}
                {...register("ApiEndPoint", { required: true })}
              />
              {errors.ApiEndPoint && (
                <div className="invalid-feedback">
                  API End Point is required.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">API Key</label>
              <input
                type="text"
                className={`form-control ${errors.ApiKey ? "is-invalid" : ""}`}
                {...register("ApiKey", { required: true })}
              />
              {errors.ApiKey && (
                <div className="invalid-feedback">API Key is required.</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">API Status</label>
              <select
                className={`form-select ${
                  errors.ApiStatus ? "is-invalid" : ""
                }`} // Add 'is-invalid' class if there's an error
                {...register("ApiStatus", { required: true })} // Ensure required validation
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.ApiStatus && ( // Show error message if ApiStatus has an error
                <div className="invalid-feedback">API Status is required.</div>
              )}
            </div>

            <button type="submit" className="btn btn-main">
              {load ? "Adding" : "Add API"}
            </button>
          </form>
        </div>
      </div>

      {/* API list table */}
      {load ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto api-list-table">
          <table className="table mt-4 table-bordered border-secondary custom-table2">
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Balance {currency}</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {apiList.map((api, index) => (
                <tr key={api._id}>
                  <th scope="row">{index + 1}</th>
                  <td>{api.ApiName}</td>
                  <td>
                    {exchangeRate(parseFloat(api.ApiBalance), currency)
                      .toFixed(6)
                      .slice(0, 7)}
                  </td>{" "}
                  {/* Assuming you have this field in your API */}
                  <td>{api.ApiStatus}</td>
                  <td className="d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasEditApi"
                      aria-controls="offcanvasEditApi"
                      onClick={() => handleEditClick(api)}
                    >
                      <FaEdit />
                    </button>
                    <Link
                      className="btn btn-sm btn-warning me-2"
                      to={"/admin/ApiServices"}
                    >
                      <FaListUl />
                    </Link>
                    <button
                      className="btn btn-sm btn-danger border border-light"
                      onClick={() => handleDelete(api._id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApi === null ? (
        ""
      ) : (
        <div
          className="offcanvas offcanvas-end pb-4"
          tabIndex="-1"
          id="offcanvasEditApi"
          aria-labelledby="offcanvasEditApiLabel"
        >
          <div className="offcanvas-header">
            <h5
              className="offcanvas-title d-flex align-items-center"
              id="offcanvasEditApiLabel"
            >
              <FaEdit className="pe-2 fs-2" /> Edit Api
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
            <form onSubmit={handleApiEdit(onEditApiSubmit)}>
              {/* Use handleRateEdit */}
              <div className="mb-3">
                <label htmlFor="ApiName" className="form-label">
                  Api Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ApiName" // Unique ID for accessibility
                  defaultValue={selectedApi?.ApiName} // Optional chaining to prevent errors
                  {...registerEditApi("ApiName", { required: true })} // Register input with validation
                />
                {errorsEditApi.ApiName?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Api Name is required
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="ApiEndPoint" className="form-label">
                  API End Point
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ApiEndPoint" // Unique ID for accessibility
                  defaultValue={selectedApi?.ApiEndPoint} // Optional chaining to prevent errors
                  {...registerEditApi("ApiEndPoint", { required: true })} // Register input with validation
                />
                {errorsEditApi.ApiEndPoint?.type === "required" && (
                  <p role="alert" className="text-danger">
                    Api End Point is required
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="ApiKey" className="form-label">
                  API Key
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ApiKey" // Unique ID for accessibility
                  defaultValue={selectedApi?.ApiKey} // Optional chaining to prevent errors
                  {...registerEditApi("ApiKey", { required: true })}
                />
                {errorsEditApi.ApiKey?.type === "required" && (
                  <p role="alert" className="text-danger">
                    ApiKey is required
                  </p>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">API Status</label>
                <select
                  className={`form-select ${
                    errorsEditApi.ApiStatus ? "is-invalid" : ""
                  }`} // Add 'is-invalid' class if there's an error
                  {...registerEditApi("ApiStatus", { required: true })} // Ensure required validation
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errorsEditApi.ApiStatus && ( // Show error message if ApiStatus has an error
                  <div className="invalid-feedback">
                    API Status is required.
                  </div>
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

export default AddApi;
