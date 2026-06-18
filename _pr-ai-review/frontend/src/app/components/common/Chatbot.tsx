import { X, Bot, Send } from "lucide-react";
import { useChatBot } from "../../context/useChatBot";

function ChatBot() {
  const { isOpen, openChatBot, closeChatBot } = useChatBot();

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <span className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping" />
        <span className="absolute inset-0 scale-110 rounded-full bg-primary opacity-20 animate-pulse" />

        <button
          onClick={openChatBot}
          className="relative h-14 w-14 rounded-full bg-primary hover:bg-primary-deep text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
        >
          <Bot className="h-7 w-7" />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={closeChatBot}
        />
      )}

      <div
        className={
          "fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">WaslaBot</p>
              <p className="text-xs text-white/70">Always here to help</p>
            </div>
          </div>
          <button
            onClick={closeChatBot}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 flex flex-col items-center justify-center gap-3 bg-muted">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-semibold text-fg">
            Hi! I am your Assistant, WaslaBot
          </p>
          <p className="text-xs text-fg-muted text-center">
            Ask me anything about doctors, services, or appointments.
          </p>
        </div>

        <div className="px-4 py-4 border-t border-border flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-border bg-muted text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary transition-colors"
          />
          <button className="h-10 w-10 rounded-xl bg-primary hover:bg-primary-deep text-white flex items-center justify-center transition-colors cursor-pointer shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatBot;
