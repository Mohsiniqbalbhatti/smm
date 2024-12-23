import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoAddCircle } from "react-icons/io5";
import Loader from "../components/Loader";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import toast from "react-hot-toast";

function Notifications() {
  const [load, setLoad] = useState(false);
  const [notifications, setNotifications] = useState([]); // Ensure it's an array
  const [description, setDescription] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const {
    register: registerEditNotification,
    setValue,
    handleSubmit: handleEditNotification,
    reset: resetEditNotification, // Get reset for the edit form
    formState: { errors: errorsEditNotification },
  } = useForm();
  // Handle form submission for adding notifications.
  const onSubmit = async (data) => {
    setLoad(true);
    const notificationData = {
      type: data.type,
      title: data.title,
      description: description,
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      status: data.status,
    };

    await axios
      .post(`${import.meta.env.VITE_URL}admin/notification`, notificationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data) {
          toast.success("Notification Added");
          resetForm();
          fetchNotifications();
        }
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoad(false);
      });
  };

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    setLoad(true);
    await axios
      .get(`${import.meta.env.VITE_URL}admin/notification`)
      .then((res) => {
        // Ensure the response data is an array
        console.log(res.data.notifications);

        setNotifications(res.data.notifications);
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoad(false);
      });
  };

  // Reset form and editing state
  const resetForm = () => {
    reset();
    setDescription("");
    setSelectedNotification(null);
  };

  // Handle edit button click
  const handleEditClick = (notification) => {
    setSelectedNotification(notification);
    setValue("type", notification.type);
    setValue("title", notification.title);
    setValue("startDate", notification.startDate);
    setValue("expiryDate", notification.expiryDate);
    setValue("status", notification.status);
    setDescription(notification.description); // Set description in ReactQuill
  };

  // Handle edit notification submit
  const onEditNotificationSubmit = async (data) => {
    setLoad(true);
    const notificationData = {
      type: data.type,
      title: data.title,
      description: description,
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      status: data.status,
    };

    // const notificationId = se;
    await axios
      .put(
        `${import.meta.env.VITE_URL}admin/notification/${
          selectedNotification._id
        }`,
        notificationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data) {
          toast.success("Notification Updated");
          resetEditNotification();
        }
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoad(false);
      });
  };
  const handleDeleteClick = async (notification) => {
    setLoad(true);

    await axios
      .delete(
        `${import.meta.env.VITE_URL}admin/notification/${notification._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data) {
          toast.success("Notification deleted successfully");
          resetEditNotification();
          fetchNotifications();
        }
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoad(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      {load && <Loader />}

      {/* Add Notification Button */}
      <button
        className="btn btn-main d-flex align-items-center"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#addNewNotification"
        aria-controls="addNewNotification"
      >
        <IoAddCircle className="fs-2 pe-2" /> Add Notification
      </button>

      {/* Offcanvas Form for Adding Notifications */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="addNewNotification"
        aria-labelledby="addNewNotificationLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title d-flex align-items-center"
            id="addNewNotificationLabel"
          >
            <FaEdit className="pe-2 fs-2" />
            Add New Notification
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
            {/* Form Fields for Notification */}
            <div className="mb-3">
              <label htmlFor="type" className="form-label">
                Type
              </label>
              <select
                id="type"
                className="form-select"
                {...register("type", { required: "Type is required" })}
              >
                <option value="">Select Type</option>
                <option value="announcement">Announcement</option>
                <option value="newService">New Service</option>
                <option value="disabledService">Disabled Service</option>
                <option value="updatedService">Updated Service</option>
              </select>
              {errors.type && (
                <small className="text-danger">{errors.type.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="form-control"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <small className="text-danger">{errors.title.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="form-control"
                {...register("startDate", {
                  required: "Start Date is required",
                })}
              />
              {errors.startDate && (
                <small className="text-danger">
                  {errors.startDate.message}
                </small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="expiryDate" className="form-label">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                className="form-control"
                {...register("expiryDate", {
                  required: "Expiry Date is required",
                })}
              />
              {errors.expiryDate && (
                <small className="text-danger">
                  {errors.expiryDate.message}
                </small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                className="form-select"
                {...register("status", { required: "Status is required" })}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && (
                <small className="text-danger">{errors.status.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <ReactQuill theme="snow" onChange={setDescription} />
            </div>

            <button type="submit" className="btn btn-main">
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-x-auto api-list-table">
        <table className="table mt-4 table-bordered border-secondary custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Type</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No Notifications Found
                </td>
              </tr>
            ) : (
              notifications.map((notification, index) => (
                <tr key={notification._id}>
                  <td>{index + 1}</td>
                  <td>{notification.title}</td>
                  <td>{notification.type}</td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: notification.description,
                    }}
                  ></td>
                  <td>{notification.startDate}</td>
                  <td>{notification.expiryDate}</td>
                  <td>{notification.status}</td>
                  <td className="d-flex">
                    <button
                      onClick={() => handleEditClick(notification)}
                      className="btn btn-sm btn-primary"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#editNotification"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(notification)}
                      className="btn ms-2 btn-sm btn-primary bg-danger"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Offcanvas Form for editing Notifications */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="editNotification"
        aria-labelledby="editNotificationLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title d-flex align-items-center"
            id="editNotificationLabel"
          >
            <FaEdit className="pe-2 fs-2" />
            Edit Notification
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
          <form onSubmit={handleEditNotification(onEditNotificationSubmit)}>
            {/* Form Fields for Notification */}
            <div className="mb-3">
              <label htmlFor="type" className="form-label">
                Type
              </label>
              <select
                id="type"
                className="form-select"
                {...registerEditNotification("type", {
                  required: "Type is required",
                })}
              >
                <option value="">Select Type</option>
                <option value="announcement">Announcement</option>
                <option value="newService">New Service</option>
                <option value="disabledService">Disabled Service</option>
                <option value="updatedService">Updated Service</option>
              </select>
              {errorsEditNotification.type && (
                <small className="text-danger">
                  {errorsEditNotification.type.message}
                </small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="form-control"
                {...registerEditNotification("title", {
                  required: "Title is required",
                })}
              />
              {errorsEditNotification.title && (
                <small className="text-danger">
                  {errorsEditNotification.title.message}
                </small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="form-control"
                defaultChecked={selectedNotification?.startDate}
                {...registerEditNotification("startDate", {
                  required: "Start Date is required",
                })}
              />
              {errorsEditNotification.startDate && (
                <small className="text-danger">
                  {errorsEditNotification.startDate.message}
                </small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="expiryDate" className="form-label">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                className="form-control"
                {...registerEditNotification("expiryDate", {
                  required: "Expiry Date is required",
                })}
              />
              {errorsEditNotification.expiryDate && (
                <small className="text-danger">
                  {errorsEditNotification.expiryDate.message}
                </small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                className="form-select"
                {...registerEditNotification("status", {
                  required: "Status is required",
                })}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errorsEditNotification.status && (
                <small className="text-danger">{errors.status.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
              />
            </div>

            <button type="submit" className="btn btn-main">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
