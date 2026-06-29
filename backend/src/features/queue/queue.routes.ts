import express from "express";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";
import {
  join,
  getQueue,
  myPosition,
  leave,
  nextPatient,
  setStatus,
  getQueueForAppointment,
} from "./queue.controller.js";

const router = express.Router();

router.post("/join", protect, restrictTo("patient"), join);

router.get("/my-position", protect, restrictTo("patient"), myPosition);

router.get("/appointment/:appointmentId", protect, getQueueForAppointment);

router.get("/:specialistId", getQueue);

router.delete("/leave", protect, restrictTo("patient"), leave);

router.patch("/next", protect, restrictTo("specialist"), nextPatient);

router.patch("/status", protect, restrictTo("specialist"), setStatus);

export default router;