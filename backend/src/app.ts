import express from "express";
import cors from "cors";
import adminRouter from "./features/admin/admin.routes.js";
import specialistsRouter from "./features/medicalSpecialist/Doctors/specialists.routes.js";
import { patientRouter } from "./features/patient/patient.routes.js";
import errorHandler from "./middleware/errorHandler.middleware.js";
import authRouter from "./features/auth/auth.route.js";
import reviewsRouter from "./features/reviews/reviews.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/specialists", specialistsRouter);
app.use("/api/auth", authRouter);
app.use("/api/patient", patientRouter);
app.use("/api/reviews", reviewsRouter);
app.use(errorHandler);

export default app;
