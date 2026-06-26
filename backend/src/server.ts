import dns from "node:dns";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { processReminders } from "./features/appointments/reminder.service.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const startServer = async (): Promise<void> => {
  await connectDB();

  const PORT = process.env.PORT_NUMBER || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Check for pending WhatsApp reminders every minute
  const runReminders = () =>
    processReminders().catch(err => console.error("[Reminder Scheduler]", err));

  runReminders(); // run immediately on start
  setInterval(runReminders, 60 * 1000);
  console.log("[Reminder Scheduler] Started - checking every 60s");
};

startServer();