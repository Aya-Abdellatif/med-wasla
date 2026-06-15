import express from "express";
import cors from "cors";
import adminRouter from "./features/admin/admin.routes.js";
import specialistsRouter from "./features/medicalSpecialist/Doctors/specialists.routes.js";
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
// Routes
app.use("/api/admin", adminRouter);
app.use("/api/specialists", specialistsRouter); // تفعيل الـ routes الجديدة
// app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter);
// app.use("/api/specialists", specialistsRouter);
// app.use("/api/appointments", appointmentsRouter);
// app.use("/api/queue", queueRouter);
// app.use("/api/reviews", reviewsRouter);
// app.use("/api/ai", aiRouter);
export default app;
//# sourceMappingURL=app.js.map