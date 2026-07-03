import { Router } from "express";
import { chatWithAI } from "./ai.controller.js";
import { optionalAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/chat", optionalAuth, chatWithAI);

export default router;



