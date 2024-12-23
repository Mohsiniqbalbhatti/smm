import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import Loader from "../components/Loader";

function Categories() {
  const [load, setLoad] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const {
    register: registerEditCategory,
    handleSubmit: handleCategoryEdit,
    formState: { errors: errorsEditCategory },
    reset: resetEditForm,
  } = useForm();

  // form for add category
  const onSubmit = async (data) => {
    const newCategory = {
      name: data.name,
      sort: data.sort,
      status: data.status,
    };
    setLoad(true);
    await axios
      .post(
        `${import.meta.env.VITE_URL}admin/category/addCategory`,
        newCategory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data) {
          toast.success("Category Added");
          reset(); // reset the form after submission
          fetchCategoriesList(); // refresh the list
        }
      })
      .catch((err) => {
        console.log("Error Adding Category: ", err);
        const errorMessage = err.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoad(false);
      });
  };

  // fetch categories from db
  const fetchCategoriesList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}Guest/getCategory`
      );
      const categories = response.data;
      setCategories(categories); // Set updated category list
    } catch (error) {
      console.error("Error fetching Categories list:", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    setLoad(true);
    fetchCategoriesList();
  }, []);

  // Sort categories based on the sort number
  const sortedCategories = categories.sort((a, b) => a.sort - b.sort);

  // delete category
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_URL}admin/category/deleteCategory/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Category deleted successfully");
        fetchCategoriesList(); // Refresh the list after deletion
      } catch (error) {
        console.error("Error deleting category:", error);
        const errorMessage = error.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      }
    }
  };

  // update category - set the selected category to be edited
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    resetEditForm(category); // Populate the edit form with selected category data
  };

  const handleCategoryEditSubmit = async (data) => {
    const updatedCategory = {
      name: data.name,
      sort: data.sort,
      status: data.status,
    };
    if (!selectedCategory) return; // Ensure a category is selected for editing

    setLoad(true);
    await axios
      .put(
        `${import.meta.env.VITE_URL}admin/category/updateCategory/${
          selectedCategory._id
        }`,
        updatedCategory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data) {
          toast.success("Category updated successfully");
          fetchCategoriesList(); // refresh the list
          setSelectedCategory(null); // Clear the selected category after update
        }
      })
      .catch((err) => {
        console.log("Error Updating Category: ", err);
        const errorMessage = err.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoad(false);
      });
  };

  return (
    <div>
      <button
        className="btn btn-main d-flex align-items-center"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#addNewCategory"
        aria-controls="offcanvasRight"
      >
        <IoAddCircle className="fs-2 pe-2" /> Add Category
      </button>

      {/* Add categories offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="addNewCategory"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title d-flex align-items-center"
            id="offcanvasRightLabel"
          >
            <FaEdit className="pe-2 fs-2" /> Add New Category
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
              <label className="form-label">Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                {...register("name", { required: true })}
              />
              {errors.name && (
                <div className="invalid-feedback">
                  Category Name is required.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Default Sorting Number</label>
              <input
                type="number"
                className={`form-control ${errors.sort ? "is-invalid" : ""}`}
                {...register("sort", { required: true })}
              />
              {errors.sort && (
                <div className="invalid-feedback">Sort number is required.</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                {...register("status", { required: true })}
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status?.type === "required" && (
                <p role="alert" className="text-danger">
                  Status is required
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-main">
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Table for categories list */}
      {load ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto api-list-table">
          <table className="table mt-4 table-bordered border-secondary custom-table2">
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Sort</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((category, index) => (
                <tr key={category._id}>
                  <th scope="row">{index + 1}</th>
                  <td>{category.name}</td>
                  <td>{category.sort}</td>
                  <td className="fw-semibold text-danger">{category.status}</td>
                  <td className="d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#editCategoryCanvas"
                      aria-controls="offcanvasRight"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(category._id)}
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

      {/* Edit category offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="editCategoryCanvas"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title d-flex align-items-center"
            id="offcanvasRightLabel"
          >
            <FaEdit className="pe-2 fs-2" /> Edit Category
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
          <form onSubmit={handleCategoryEdit(handleCategoryEditSubmit)}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className={`form-control ${
                  errorsEditCategory.name ? "is-invalid" : ""
                }`}
                {...registerEditCategory("name", { required: true })}
              />
              {errorsEditCategory.name && (
                <div className="invalid-feedback">
                  Category Name is required.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Default Sorting Number</label>
              <input
                type="number"
                className={`form-control ${
                  errorsEditCategory.sort ? "is-invalid" : ""
                }`}
                {...registerEditCategory("sort", { required: true })}
              />
              {errorsEditCategory.sort && (
                <div className="invalid-feedback">Sort number is required.</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                {...registerEditCategory("status", { required: true })}
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errorsEditCategory.status?.type === "required" && (
                <p role="alert" className="text-danger">
                  Status is required
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-main">
              Update
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Categories;
