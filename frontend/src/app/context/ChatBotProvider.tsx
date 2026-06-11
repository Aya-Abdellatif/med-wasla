import { useState } from "react";
import type { ReactNode } from "react";
import { ChatBotContext } from "./ChatBotContextProvider";

export function ChatBotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openChatBot = () => setIsOpen(true);
  const closeChatBot = () => setIsOpen(false);

  return (
    <ChatBotContext.Provider value={{ isOpen, openChatBot, closeChatBot }}>
      {children}
    </ChatBotContext.Provider>
  );
}
