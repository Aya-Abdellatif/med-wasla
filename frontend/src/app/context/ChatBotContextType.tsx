import type { ReactNode } from "react";

export interface ChatBotContextType {
  isOpen: boolean;
  openChatBot: () => void;
  closeChatBot: () => void;
}
