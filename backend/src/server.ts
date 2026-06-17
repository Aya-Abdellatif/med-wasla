import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare and Google DNS

import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
dotenv.config();
const startServer = async (): Promise<void> => {
  await connectDB();

  const PORT = process.env.PORT_NUMBER || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();