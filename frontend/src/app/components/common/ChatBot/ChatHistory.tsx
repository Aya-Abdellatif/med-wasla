import { useTranslation } from "react-i18next";
import type { Chat } from "../../../types/chat.types";

interface ChatHistoryProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

function ChatHistory({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onClose,
}: ChatHistoryProps) {
  const { t } = useTranslation("chatbot");

  return (
    <div className="w-31 h-full p-2 flex flex-col">
      {/* top bar */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-semibold text-gray-500">
          {t("history.title")}
        </p>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black text-sm"
        >
          ✕
        </button>
      </div>

      {/* new chat */}
      <button
        onClick={onNewChat}
        className="w-full mb-3 px-2 py-1 bg-primary text-white rounded text-xs"
      >
        {t("history.newChat")}
      </button>

      {/* chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full px-2 py-1 rounded mb-1 text-xs text-start whitespace-nowrap overflow-hidden text-ellipsis ${
              selectedChatId === chat.id
                ? "bg-gray-200 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            {chat.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatHistory;