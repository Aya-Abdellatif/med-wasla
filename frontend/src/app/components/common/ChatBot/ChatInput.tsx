import { Send } from "lucide-react";

interface ChatInputProps {
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
}

function ChatInput({
  message,
  setMessage,
  onSend,
}: ChatInputProps) {
  return (
    <div className="px-4 py-4 border-t border-border flex items-center gap-2 shrink-0">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-border bg-muted text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary"
      />

      <button
        onClick={onSend}
        className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ChatInput;