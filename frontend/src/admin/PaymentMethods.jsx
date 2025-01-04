import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import Loader from "../components/Loader";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null); // Store the selected method for editing
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}payments/getAll`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          },
        }
      );
      if (res.data && Array.isArray(res.data.PaymentMethods)) {
        setMethods(res.data.PaymentMethods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleEditClick = (method) => {
    setSelectedMethod(method);
    reset({
      ...method,
      params: method.params || {}, // Reset form with selected method's params
    });
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      const updatedMethod = { ...selectedMethod, params: data.params };
      updatedMethod.newUser = data.newUser;
      updatedMethod.status = data.status;
      updatedMethod.min = data.min;
      updatedMethod.max = data.max;
      updatedMethod.name = data.name;
      updatedMethod.description = data.description;
      updatedMethod.method = data.method;
      // Send updated method to backend
      await axios.put(
        `${import.meta.env.VITE_URL}payments/update/${selectedMethod._id}`,
        updatedMethod,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          },
        }
      );
      toast.success("Payment method updated successfully!");
      fetchPaymentMethods(); // Refresh the payment methods after update
    } catch (error) {
      toast.error("Error updating payment method:", error);
      console.error("Error updating payment method:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      {loading && <Loader />}
      <div className="col-12">
        <div className="overflow-x-auto mx-2 mt-3">
          <table className="table custom-table2">
            <thead>
              <tr>
                <th className="fw-medium">No</th>
                <th className="fw-medium">Method</th>
                <th className="fw-medium">Name</th>
                <th className="fw-medium">Min</th>
                <th className="fw-medium">Max</th>
                <th className="fw-medium">New User</th>
                <th className="fw-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method, index) => (
                <tr key={method._id}>
                  <td>{index + 1}</td>
                  <td>{method.method}</td>
                  <td>{method.name}</td>
                  <td>{method.min}</td>
                  <td>{method.max}</td>
                  <td>{method.newUser ? "Allowed" : "Not Allowed"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning mb-2"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasEdit"
                      aria-controls="offcanvasRight"
                      onClick={() => handleEditClick(method)} // Pass method to handleEditClick
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offcanvas for editing */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasEdit"
        aria-labelledby="offcanvasEditLabel"
      >
        <div className="offcanvas-header">
          <h5 id="offcanvasEditLabel">Edit Payment Method</h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {selectedMethod && (
              <>
                {/* Constant fields (name, method, min, max, newUser, status) */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-danger">{errors.name.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="method" className="form-label">
                    Method
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="method"
                    {...register("method", { required: "Method is required" })}
                  />
                  {errors.method && (
                    <p className="text-danger">{errors.method.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="min" className="form-label">
                    Min
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="min"
                    {...register("min", { required: "Min is required" })}
                  />
                  {errors.min && (
                    <p className="text-danger">{errors.min.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="max" className="form-label">
                    Max
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="max"
                    {...register("max", { required: "Max is required" })}
                  />
                  {errors.max && (
                    <p className="text-danger">{errors.max.message}</p>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    {...register("description", {
                      required: "Description is required",
                    })}
                  />

                  {errors.description && (
                    <p className="text-danger">{errors.description.message}</p>
                  )}
                </div>

                {/* Boolean fields (newUser, status) */}
                <div className="mb-3">
                  <label className="form-label">New User</label>
                  <div>
                    <label className="me-2">
                      <input
                        type="radio"
                        value={true}
                        {...register("newUser", {
                          required: "New User is required",
                        })}
                        defaultChecked={selectedMethod.newUser === true}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value={false}
                        {...register("newUser")}
                        defaultChecked={selectedMethod.newUser === false}
                      />
                      No
                    </label>
                  </div>
                  {errors.newUser && (
                    <p className="text-danger">{errors.newUser.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <div>
                    <label className="me-2">
                      <input
                        type="radio"
                        value={true}
                        {...register("status", {
                          required: "Status is required",
                        })}
                        defaultChecked={selectedMethod.status === true}
                      />
                      Active
                    </label>
                    <label>
                      <input
                        type="radio"
                        value={false}
                        {...register("status")}
                        defaultChecked={selectedMethod.status === false}
                      />
                      Inactive
                    </label>
                  </div>
                  {errors.status && (
                    <p className="text-danger">{errors.status.message}</p>
                  )}
                </div>

                {/* Dynamic params fields */}
                {selectedMethod.params &&
                  Object.keys(selectedMethod.params).map((key) => (
                    <div className="mb-3" key={key}>
                      <label htmlFor={key} className="form-label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={key}
                        {...register(`params.${key}`, {
                          required: `${key} is required`,
                        })}
                      />
                      {errors?.params?.[key] && (
                        <p className="text-danger">
                          {errors?.params?.[key]?.message}
                        </p>
                      )}
                    </div>
                  ))}

                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentMethods;
