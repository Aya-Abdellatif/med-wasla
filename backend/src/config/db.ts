import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(
      process.env.DATABASE_CONNECTION_STRING! 
    );

    console.log("MongoDB Connected.");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};