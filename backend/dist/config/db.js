import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_STRING);
        console.log("MongoDB Connected.");
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
//# sourceMappingURL=db.js.map