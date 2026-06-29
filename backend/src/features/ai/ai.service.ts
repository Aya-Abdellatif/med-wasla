
import axios from "axios";

const AI_URL = "http://localhost:3000/chat";

export const sendMessageToAI = async (message: string) => {
  try {
    const response = await axios.post(AI_URL, { message });
    
    // 🔄 Return response.data entirely so the UI component reads the dictionary directly
    return response.data;
} catch (error: unknown) {
  throw new Error("AI service failed", {
    cause: error,
  });
}
};