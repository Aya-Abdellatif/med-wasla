import api from "./api";

export const sendMessageToAI = async (message: string) => {
  const response = await api.post("/ai/chat", {
    message,
  });

  return response.data.message;
};