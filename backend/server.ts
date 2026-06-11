import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const server = express();

server.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

server.use(express.json());

try {
    await mongoose.connect(process.env.DATABASE_CONNECTION_STRING!);
    console.log("MongoDB Connected.");
    server.listen(process.env.PORT_NUMBER || 5000);
}
catch (error) {
    console.error(error);
    process.exit();
}

export default server;