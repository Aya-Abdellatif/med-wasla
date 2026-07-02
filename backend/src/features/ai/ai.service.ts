
import axios from "axios";

const AI_URL = "http://localhost:3000/chat"; // flask endpiont

export const sendMessageToAI = async (message: string, sessionId: string, userId?: string) => {
  try {
    const response = await axios.post(AI_URL, {
      message,
      chat_id: sessionId,
      user_id: userId,
    });

    // 🔄 Return response.data entirely so the UI component reads the dictionary directly
    return response.data;
} catch (error: unknown) {
  throw new Error("AI service failed", {
    cause: error,
  });
}
};