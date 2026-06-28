import ReactMarkdown from "react-markdown";
import type { Message } from "../../../types/chat.types";

interface ChatMessageProps extends Message {}

function ChatMessage({ sender, text }: ChatMessageProps) {
  return (
    <div className={`mb-3 ${sender === "user" ? "text-right" : "text-left"}`}>
      <div
        className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[85%] ${
          sender === "user"
            ? "bg-primary text-white"
            : "bg-white text-gray-800 shadow-sm border border-gray-100"
        }`}
      >
        {/* Added dynamic check fallback if text arrives empty */}
        <ReactMarkdown>{text || "No response received"}</ReactMarkdown>
      </div>
    </div>
  );
}

export default ChatMessage;