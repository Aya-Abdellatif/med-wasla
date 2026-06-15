// backend/src/features/medicalSpecialist/Doctors/specialists.routes.ts
import { Router } from "express";
import { SpecialistsController } from "./specialists.controller.js";
import { mockAuth } from "../../../middleware/mockAuth.js";

const router = Router();

router.use(mockAuth); // كل الـ routes هنا هتحتاج الـ Header

router.get("/me", SpecialistsController.getMe);
router.put("/profile", SpecialistsController.updateProfile);
router.put("/availability", SpecialistsController.updateProfile); // بتستخدم نفس الـ logic حالياً
router.put("/fees", SpecialistsController.updateProfile);
router.post("/me/certificates", SpecialistsController.addCertificate);

export default router;