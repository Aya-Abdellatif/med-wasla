interface ChatMessageProps {
  sender: "user" | "ai";
  text: string;
}

function ChatMessage({ sender, text }: ChatMessageProps) {
  // ✅ SPECIAL CASE: Thinking message
  if (text === "Thinking...") {
    return (
      <div className="mb-3 text-left">
        <div className="inline-block px-3 py-2 rounded-xl bg-white text-xs text-gray-400 italic">
          ● ● ● thinking
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-3 ${
        sender === "user" ? "text-right" : "text-left"
      }`}
    >
      <div
        className={`inline-block px-3 py-2 rounded-xl ${
          sender === "user"
            ? "bg-primary text-white"
            : "bg-white"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default ChatMessage;