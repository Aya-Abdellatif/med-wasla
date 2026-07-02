
import axios from "axios";

const AI_URL = process.env.CHATBOT_SERVICE_URL ?? "http://localhost:3000/chat"; // flask endpiont

export const sendMessageToAI = async (message: string) => {
  try {
    const response = await axios.post(AI_URL, { message });

    // Return response.data entirely so the UI component reads the dictionary directl
    return response.data;
  } catch (error: unknown) {
    throw new Error("AI service failed", {
      cause: error,
    });
  }
};