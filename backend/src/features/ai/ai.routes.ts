import { Router } from "express";
import { chatWithAI } from "./ai.controller.js";
import { optionalAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/chat", optionalAuth, chatWithAI);

export default router;



/*
Current Architecture (1 calls 2 calls 3 calls 4)
1) Express -> POST /api/ai/chat
2) Service -> axios.post("http://localhost:5000/chat")
3) Flask -> POST /chat -> calls -> 
4) Ollama (OpenAI API) -> http://localhost:11434/api/generate

Returns:-
1) Ollama returns response to Flask
2) Flask returns response to Service
3) Service returns response to Express
4) Express returns response to client

*/