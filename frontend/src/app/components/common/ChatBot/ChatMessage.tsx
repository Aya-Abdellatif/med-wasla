interface ChatMessageProps {
  sender: "user" | "ai";
  text: string;
}

function ChatMessage({ sender, text }: ChatMessageProps) {
  return (
    <div
      className={`mb-3 ${
        sender === "user"
          ? "text-right"
          : "text-left"
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