import type  { Request, Response } from "express";
import { sendMessageToAI } from "./ai.service.js";

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const userId = req.user?.id;

    const aiResponse = await sendMessageToAI(message, sessionId, userId);

    return res.status(200).json({
      success: true,
      message: aiResponse,
    });
  } catch (error: unknown) {
    const err = error as Error;

    console.error("AI Error:", err.message);    
    return res.status(500).json({
      success: false,
      error: "AI service failed",
    });
  }
};