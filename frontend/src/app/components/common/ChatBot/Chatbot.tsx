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



// ---------------- DYNAMIC WORD-MATCHING & MARKDOWN RENDER ENGINE ----------------
  const renderEnhancedText = (text: string, sources: any[] = []) => {
    if (!text) return null;

    // 1. Split text into individual lines to respect '\n' structural newlines explicitly
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      const trimmedLine = line.trim();

      // If the line is blank, render a structural vertical spacing block
      if (!trimmedLine) return <div key={lineIdx} className="h-2" />;

      // Identify if the current line represents an isolated list question starting with a hyphen '-' or an explicit number layout
      const isListItem = trimmedLine.startsWith("-") || /^\d+\./.test(trimmedLine);
      
      // Clean list item formatting layout styling classes
      const lineClass = `block leading-relaxed mb-1 text-sm text-gray-800 ${
        isListItem 
          ? "pl-4 mb-2.5 font-medium border-l-2 border-teal-500/30 bg-slate-50/50 py-1 rounded-r" 
          : "mb-1.5"
      }`;

      // Extract raw titles safely from your sources context array
      const sourceTitles = sources
        .map((src) => (typeof src === "string" ? src : src.title || src.name || ""))
        .filter(Boolean);

      // Guardrail: If no source keywords are loaded, evaluate basic bold markers only
      if (sourceTitles.length === 0) {
        const boldParts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <span key={lineIdx} className={lineClass}>
            {boldParts.map((part, idx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={idx} className="font-bold text-gray-900 bg-yellow-50/40 px-0.5 rounded">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </span>
        );
      }

      // Escape special regex characters in titles to prevent dynamic pattern compilation errors
      const escapedTitles = sourceTitles.map((title) =>
        title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
      );

      // Combine bolding markdown pattern with raw source title matching phrases
      const pattern = new RegExp(
        `(\\*\\*.*?\\*\\*|${escapedTitles.map((t) => `\\b${t}\\b|${t}`).join("|")})`,
        "gi"
      );

      const parts = line.split(pattern);

      return (
        <span key={lineIdx} className={lineClass}>
          {parts.map((part, idx) => {
            if (!part) return null;

            // 2. Process standard markdown bold boundaries
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={idx} className="font-bold text-gray-900 bg-yellow-50/40 px-0.5 rounded">
                  {part.slice(2, -2)}
                </strong>
              );
            }

            // 3. Cross-reference whether text fragment matches any returned citation strings
            const matchedSource = sources.find((src) => {
              const name = typeof src === "string" ? src : src.title || src.name || "";
              return (
                name.toLowerCase() === part.toLowerCase() ||
                part.toLowerCase().includes(name.toLowerCase())
              );
            });

            if (matchedSource) {
              // Extract original key label for string sanitation lookup
              const rawLabel = typeof matchedSource === "string" ? matchedSource : matchedSource.title || part;
              
              // Clean up prefixes (like "Overview-") for clean NHS condition slugs
              const cleanSlug = rawLabel
                .replace(/^overview-/i, "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-");

              const linkUrl =
                matchedSource.url ||
                matchedSource.link ||
                `https://www.nhs.uk/conditions/${cleanSlug}`;

              return (
                <a
                  key={idx}
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-600 hover:bg-teal-100 hover:underline transition-colors decoration-dotted"
                  title={`Read verified NHS medical content for: ${rawLabel}`}
                >
                  {part} ↗
                </a>
              );
            }

            return part;
          })}
        </span>
      );
    });
  };

  

  // ---------------- SEND MESSAGE ----------------
  const handleSend = async () => {
    if (!message.trim() || !selectedChatId) return;

    const userMessage = message;
    setMessage("");

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== selectedChatId) return chat;

        let messages = [...chat.messages];
        const isOnlyWelcome =
          messages.length === 1 &&
          messages[0].sender === "ai" &&
          messages[0].text.includes("Hi! I am WaslaBot");

        if (isOnlyWelcome) {
          messages = [];
        }

        return {
          ...chat,
          messages: [
            ...messages,
            { sender: "user", text: userMessage },
            { sender: "ai", text: "Thinking..." },
          ],
        };
      })
    );

    setIsLoading(true);

    try {
      const response = await sendMessageToAI(userMessage);
      console.log("🔴 Raw Payload in UI:", response);

      const aiReply =
        response?.answer ||
        response?.message?.answer ||
        response?.response?.answer ||
        "No text returned from server.";

      const sources =
        response?.sources ||
        response?.message?.sources ||
        response?.response?.sources ||
        [];

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== selectedChatId) return chat;

          const messages = [...chat.messages];
          const lastThinkingIndex = messages
            .map((m) => m.text)
            .lastIndexOf("Thinking...");

          if (lastThinkingIndex !== -1) {
            messages[lastThinkingIndex] = {
              sender: "ai",
              text: aiReply,
              sources,
            };
          }

          return { ...chat, messages };
        })
      );
    } catch (error) {
      console.error("🔴 Frontend API Error:", error);
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== selectedChatId) return chat;

          const messages = [...chat.messages];
          const lastThinkingIndex = messages
            .map((m) => m.text)
            .lastIndexOf("Thinking...");

          if (lastThinkingIndex !== -1) {
            messages[lastThinkingIndex] = {
              sender: "ai",
              text: "Something went wrong. Please check your backend connection.",
            };
          }

          return { ...chat, messages };
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openChatBot}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Bot className="h-7 w-7" />
        </button>
      </div>

      {/* overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={closeChatBot}
        />
      )}

      {/* panel */}
      <div
        className={
          "fixed top-0 right-0 h-full w-[28rem] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <p className="font-bold text-sm">WaslaBot</p>
              <p className="text-xs text-white/70">Always here to help</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory((p) => !p)}
              className="text-lg px-2 hover:bg-white/10 rounded"
            >
              ⋮
            </button>

            <button onClick={closeChatBot} className="p-1 hover:bg-white/10 rounded">
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
          <div className="flex-1 flex flex-col bg-slate-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChat?.messages.map((msg, i) => {
                const isAI = msg.sender === "ai";
                const isThinking = msg.text === "Thinking...";

                return (
                  <div key={i} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        isAI
                          ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                          : "bg-primary text-white rounded-tr-none"
                      }`}
                    >
                      {isAI && !isThinking ? (
                        renderEnhancedText(msg.text, msg.sources)
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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