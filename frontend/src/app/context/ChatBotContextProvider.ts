import { createContext } from "react";
import type { ChatBotContextType } from "./ChatBotContextType";

export const ChatBotContext = createContext<ChatBotContextType | undefined>(
  undefined,
);
