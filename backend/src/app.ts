import express from "express";
import cors from "cors";
import { patientRouter } from "./features/patient/patient.routes.js";
import errorHandler from "./middleware/errorHandler.middleware.js";
import authRouter from "./features/auth/auth.route.js";
import specialistsRouter from "./features/medicalSpecialist/specialists.routes.js";
import reviewsRouter from "./features/reviews/reviews.routes.js";
import queueRouter from "./features/queue/queue.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/patient", patientRouter);
app.use("/api/specialists", specialistsRouter);
// app.use("/api/appointments", appointmentsRouter);
app.use("/api/queue", queueRouter);
app.use("/api/reviews", reviewsRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/ai", aiRouter);
app.use(errorHandler);
export default app;
