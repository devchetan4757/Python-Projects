import mongoose from "mongoose";

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error("MongoDB URI is missing");
  }

  try {
    await mongoose.connect(uri);  // <- no extra options
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
