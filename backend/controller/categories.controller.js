import categoriesList from "../model/categories.model.js";
import ApiServicesModel from "../model/ApiServices.model.js";

// Function to add new categories to categoriesList
export const addCategory = async (req, res) => {
  try {
    const { name, sort, status } = req.body;

    // Ensure required fields are present
    if (!name || !sort || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create and save the new category
    const newCategory = new categoriesList({ name, sort, status });
    await newCategory.save();

    res.status(201).json({
      message: "Category Saved successfully",
      category: newCategory,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

// Function to get all categories from categoriesList
export const getCategories = async (req, res) => {
  try {
    // Fetch all categories from the categoriesList collection
    const categories = await categoriesList.find({
      $or: [{ ApiStatus: "active" }, { ApiStatus: { $exists: false } }], // Either active or doesn't exist
    });

    // Check if categories exist
    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    // Send the categories as a response
    res.status(200).json(categories);
  } catch (error) {
    console.log("Error fetching categories:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

// delet category and related service
export const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await categoriesList.findByIdAndDelete(id);
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    await ApiServicesModel.deleteMany({ category: category.name });

    res.status(200).json({
      message: "Category and related services deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting category:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

// update category and related category
export const updateCategory = async (req, res) => {
  try {
    const { name, sort, status } = req.body;
    const id = req.params.id;

    // Find the original category first
    const originalCategory = await categoriesList.findById(id);

    if (!originalCategory) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Update the category
    const updatedCategory = await categoriesList.findByIdAndUpdate(
      id,
      { name, sort, status },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(400).json({ message: "Category update failed" });
    }

    // Update ApiServicesModel with the new category name, using the original name for filtering
    await ApiServicesModel.updateMany(
      { category: originalCategory.name }, // Match old name
      { category: name } // Set to new name
    );

    res.status(200).json({
      message: "Category updated successfully",
      updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};
