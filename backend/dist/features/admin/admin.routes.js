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
export default router;
//# sourceMappingURL=admin.routes.js.map