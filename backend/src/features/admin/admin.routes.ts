import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

const requireAdmin = [protect, restrictTo("admin")] as const;

// Retrieve specialists pending admin approval
router.get("/specialists/pending", ...requireAdmin, AdminController.getPendingSpecialists);
router.get("/specialists", ...requireAdmin, AdminController.getAllSpecialists);

// Approve a specialist
router.patch("/specialists/:id/approve", ...requireAdmin, AdminController.approveSpecialist);

// Reject a specialist
router.patch("/specialists/:id/reject", ...requireAdmin, AdminController.rejectSpecialist);

router.patch(
  "/specialists/:id/certificates/:certId/approve",
  AdminController.approveCertificate,
);
router.patch(
  "/specialists/:id/certificates/:certId/reject",
  AdminController.rejectCertificate,
);

export default router;
