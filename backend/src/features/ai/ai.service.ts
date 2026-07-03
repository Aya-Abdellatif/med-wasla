
import axios from "axios";

const AI_URL = process.env.CHATBOT_SERVICE_URL ?? "http://localhost:3000/chat"; // flask endpiont
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export const sendMessageToAI = async (message: string, sessionId: string, userId?: string) => {
  try {
    const response = await axios.post(
      AI_URL,
      {
        message,
        chat_id: sessionId,
        user_id: userId,
      },
      {
        headers: INTERNAL_API_SECRET
          ? { "X-Internal-Secret": INTERNAL_API_SECRET }
          : undefined,
      },
    );

    // 🔄 Return response.data entirely so the UI component reads the dictionary directly
    return response.data;
  } catch (error: unknown) {
    throw new Error("AI service failed", {
      cause: error,
    });
  }
};