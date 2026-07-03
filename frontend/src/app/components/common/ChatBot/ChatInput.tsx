import { Send, Plus, Mic } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import type {
  SpeechRecognitionEvent,
} from "../../../types/chat.types";

interface ChatInputProps {
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
}

function ChatInput({ message, setMessage, onSend }: ChatInputProps) {
  const { t, i18n } = useTranslation("chatbot");
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------- ENTER KEY ----------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  // ---------------- VOICE INPUT ----------------
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t("input.voiceUnsupported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === "ar" ? "ar-SA" : "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setMessage(text);
      inputRef.current?.focus();
    };

    recognition.start();
  };

  // ---------------- ADD FILE (placeholder) ----------------
  const handleAdd = () => {
    alert(t("input.fileComingSoon"));
  };

  return (
    <div className="px-4 py-3 border-t border-border flex items-center gap-2 shrink-0 w-full bg-white">
      {/* ➕ BUTTON */}
      <button
        onClick={handleAdd}
        className="p-2 hover:opacity-70 flex-shrink-0"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* INPUT */}
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("input.placeholder")}
        className="flex-1 min-w-0 w-full text-sm px-4 py-2 rounded-xl border border-border bg-muted focus:outline-none"
      />

      {/* MIC */}
      <button
        onClick={startVoice}
        className="p-2 hover:opacity-70 flex-shrink-0"
      >
        <Mic className="h-5 w-5" />
      </button>

      {/* SEND */}
      <button
        onClick={onSend}
        className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ChatInput;