import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Load environment variables (supports .env and env)
dotenv.config();
if (!process.env.DATABASE_CONNECTION_STRING) {
  dotenv.config({ path: "env" });
}

const startServer = async (): Promise<void> => {
  await connectDB();

  const PORT = process.env.PORT_NUMBER || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();
