import { Router } from "express";
import { AdminController } from "./admin.controller.js";

const router = Router();

router.get("/specialists/pending", AdminController.getPendingSpecialists);
router.get("/specialists", AdminController.getAllSpecialists); 
router.patch("/specialists/:id/approve", AdminController.approveSpecialist);
router.patch("/specialists/:id/reject", AdminController.rejectSpecialist);

export default router;
