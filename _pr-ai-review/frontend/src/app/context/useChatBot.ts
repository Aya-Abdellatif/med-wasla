import { useContext } from "react";
import { ChatBotContext } from "./ChatBotContextProvider.ts";

export function useChatBot() {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error("useChatBot must be used within ChatBotProvider");
  }
  return context;
}
