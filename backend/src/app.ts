import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// Routes
// app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter);
// app.use("/api/specialists", specialistsRouter);
// app.use("/api/appointments", appointmentsRouter);
// app.use("/api/queue", queueRouter);
// app.use("/api/reviews", reviewsRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/ai", aiRouter);

export default app;
