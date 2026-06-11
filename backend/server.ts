import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
dotenv.config();
const startServer = async (): Promise<void> => {
  await connectDB();

  const PORT = process.env.PORT_NUMBER || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();