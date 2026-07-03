import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import type { Message } from "../../../types/chat.types";

function ChatMessage({ sender, text }: Message) {
  const { t } = useTranslation("chatbot");

  return (
    <div className={`mb-3 ${sender === "user" ? "text-end" : "text-start"}`}>
      <div
        className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[85%] ${
          sender === "user"
            ? "bg-primary text-white"
            : "bg-white text-gray-800 shadow-sm border border-gray-100"
        }`}
      >
        <ReactMarkdown>{text || t("noResponse")}</ReactMarkdown>
      </div>
    </div>
  );
}

export default ChatMessage;