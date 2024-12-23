import jwt from "jsonwebtoken";
import UserModel from "../model/User.model.js";

// Middleware to protect routes and verify user authentication
const requireAdmin = async (req, res, next) => {
  // Verify user is authenticated
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1]; // Extract the token from the Authorization header
  try {
    // Verify the token and extract the user ID
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    req.user = await UserModel.findOne({ _id }).select("_id role"); // Include role in the request object
    if (!req.user) {
      return res.status(401).json({ error: "User not found" }); // Check if user exists
    }

    // Check if the user has admin role
    if (req.user.role !== "admin") {
      // Adjust the role name if necessary
      return res.status(403).json({ error: "Access denied, admin only" });
    }

    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.log(error); // Log error for debugging
    res.status(401).json({ error: "Request is not authorized" });
  }
};

export default requireAdmin;
