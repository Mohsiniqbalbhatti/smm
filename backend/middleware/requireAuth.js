import jwt from "jsonwebtoken";
import UserModel from "../model/User.model.js";

// Middleware to protect routes and verify user authentication
const requireAuth = async (req, res, next) => {
  // Verify user is authenticated
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1]; // Extract the token from the Authorization header
  try {
    // Verify the token and extract the user ID
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    // Find the user in the database using the ID extracted from the token
    req.user = await UserModel.findOne({ _id }).select("_id"); // Only include _id in the request object
    if (!req.user) {
      return res.status(401).json({ error: "User not found" }); // Check if user exists
    }

    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    // console.log(error); // Log error for debugging
    res.status(401).json({ error: "Request is not authorized" });
  }
};

export default requireAuth;
