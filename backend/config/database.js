import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const URI = process.env.MongoDBURI;
    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
