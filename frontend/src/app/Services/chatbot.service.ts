import api from "./api";

const CHAT_SESSION_KEY = "chatSessionId";

function getChatSessionId(): string {
  let sessionId = localStorage.getItem(CHAT_SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(CHAT_SESSION_KEY, sessionId);
  }

  return sessionId;
}

export const sendMessageToAI = async (message: string) => {
  const response = await api.post("/ai/chat", {
    message,
    sessionId: getChatSessionId(),
  });

  // 🔄 FIX HERE: Pull out '.message' so the UI gets the flat {"answer": "...", "sources": [...]}
  return response.data.message;
};