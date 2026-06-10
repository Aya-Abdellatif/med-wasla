import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ChatBotContextType {
  isOpen: boolean;
  openChatBot: () => void;
  closeChatBot: () => void;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

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

export function useChatBot() {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error("useChatBot must be used within ChatBotProvider");
  }
  return context;
}
