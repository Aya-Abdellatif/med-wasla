import { X, Bot } from "lucide-react";
import { useEffect, useState } from "react";

import { useChatBot } from "../../../context/useChatBot";
import { sendMessageToAI } from "../../../Services/chatbot.service";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatHistory from "./ChatHistory";

import type { Chat } from "../../../types/chat.types";

function ChatBot() {
  const { isOpen, openChatBot, closeChatBot } = useChatBot();

  const [message, setMessage] = useState("");

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentChat = chats.find((c) => c.id === selectedChatId);

  const isFirstUserMessage =
    currentChat?.messages.length === 1;

  // ---------------- CREATE FIRST CHAT ----------------
  useEffect(() => {
    createNewChat();
  }, []);

  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: `Chat ${chats.length + 1}`,
      messages: [
        {
          sender: "ai",
          text: "Hi! I am WaslaBot. How can I help you today?",
        },
      ],
    };

    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
  };

  // ---------------- SEND MESSAGE ----------------
const handleSend = async () => {
  if (!message.trim() || !selectedChatId) return;

  const userMessage = message;
  setMessage("");
setChats((prev) =>
  prev.map((chat) => {
    if (chat.id !== selectedChatId) return chat;

    // if this is first user interaction (only AI welcome exists)
    if (
      chat.messages.length === 1 &&
      chat.messages[0].sender === "ai"
    ) {
      return {
        ...chat,
        messages: [],
      };
    }

    return chat;
  })
);

  // 1️⃣ ADD USER MESSAGE FIRST
  setChats((prev) =>
    prev.map((chat) =>
      chat.id === selectedChatId
        ? {
            ...chat,
            messages: [
              ...chat.messages,
              {
                sender: "user" as const,
                text: userMessage,
              },
            ],
          }
        : chat
    )
  );

  // 2️⃣ THEN ADD "THINKING..." AFTER USER MESSAGE
  setChats((prev) =>
    prev.map((chat) =>
      chat.id === selectedChatId
        ? {
            ...chat,
            messages: [
              ...chat.messages,
              {
                sender: "ai" as const,
                text: "Thinking...",
              },
            ],
          }
        : chat
    )
  );

  setIsLoading(true);

  try {
    // 3️⃣ GET AI RESPONSE
    const aiReply = await sendMessageToAI(userMessage);

    // 4️⃣ REPLACE "THINKING..." WITH AI RESPONSE
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== selectedChatId) return chat;

        const updatedMessages = [...chat.messages];

        // remove last message (Thinking...)
        updatedMessages.pop();

        return {
          ...chat,
          messages: [
            ...updatedMessages,
            {
              sender: "ai" as const,
              text: aiReply,
            },
          ],
        };
      })
    );

    setIsLoading(false);
  } catch (error) {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== selectedChatId) return chat;

        const updatedMessages = [...chat.messages];

        updatedMessages.pop(); // remove Thinking...

        return {
          ...chat,
          messages: [
            ...updatedMessages,
            {
              sender: "ai" as const,
              text: "Something went wrong.",
            },
          ],
        };
      })
    );

    setIsLoading(false);
  }
};

  return (
    <>
      {/* floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openChatBot}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
        >
          <Bot className="h-7 w-7" />
        </button>
      </div>

      {/* overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={closeChatBot}
        />
      )}

      {/* chatbot panel */}
      <div
        className={
          "fixed top-0 right-0 h-full w-[28rem] bg-white shadow-2xl z-50 flex flex-col transition-transform " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <p className="font-bold text-sm">WaslaBot</p>
              <p className="text-xs text-white/70">
                Always here to help
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory((p) => !p)}
              className="text-lg px-1"
            >
              ⋮
            </button>

            <button onClick={closeChatBot}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex flex-1 overflow-hidden">
          {/* history */}
          <div
            className={`h-full border-r border-gray-100 bg-white transition-all duration-300 overflow-hidden ${
              showHistory ? "w-32" : "w-0"
            }`}
          >
            {showHistory && (
              <ChatHistory
                chats={chats}
                selectedChatId={selectedChatId}
                onSelectChat={setSelectedChatId}
                onNewChat={createNewChat}
                onClose={() => setShowHistory(false)}
              />
            )}
          </div>

          {/* chat */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 bg-muted">
              {currentChat?.messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  sender={msg.sender}
                  text={msg.text}
                />
              ))}
            </div>

            <ChatInput
              message={message}
              setMessage={setMessage}
              onSend={handleSend}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatBot;