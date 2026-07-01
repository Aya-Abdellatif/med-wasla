import { Router } from "express";
import { AdminController } from "./admin.controller.js";

const router = Router();

// Retrieve specialists pending admin approval
router.get("/specialists/pending", AdminController.getPendingSpecialists);
// داخل backend/src/features/admin/admin.routes.ts
router.get("/specialists", AdminController.getAllSpecialists); // الـ endpoint الجديد

// Approve a specialist
router.patch("/specialists/:id/approve", AdminController.approveSpecialist);

// Reject a specialist
router.patch("/specialists/:id/reject", AdminController.rejectSpecialist);

router.patch(
  "/specialists/:id/certificates/:certId/approve",
  AdminController.approveCertificate,
);
router.patch(
  "/specialists/:id/certificates/:certId/reject",
  AdminController.rejectCertificate,
);

export default router;
