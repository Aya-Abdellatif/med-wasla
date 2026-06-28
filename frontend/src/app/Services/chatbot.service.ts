import api from "./api";

export const sendMessageToAI = async (message: string) => {
  const response = await api.post("/ai/chat", {
    message,
  });

  // 🔄 FIX HERE: Pull out '.message' so the UI gets the flat {"answer": "...", "sources": [...]}
  return response.data.message; 
};