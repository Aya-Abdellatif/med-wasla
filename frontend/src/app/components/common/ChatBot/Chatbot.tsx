import { X, Bot } from "lucide-react";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useChatBot } from "../../../context/useChatBot";
import { sendMessageToAI } from "../../../Services/chatbot.service";

// import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatHistory from "./ChatHistory";

import type { Chat } from "../../../types/chat.types";

function ChatBot() {
  const { t } = useTranslation("chatbot");
  const { isOpen, openChatBot, closeChatBot } = useChatBot();

  const makeWelcomeChat = (title: string): Chat => ({
    id: crypto.randomUUID(),
    title,
    messages: [
      {
        sender: "ai",
        text: t("welcome"),
      },
    ],
  });

  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>(() => [
    makeWelcomeChat(t("chatTitle", { number: 1 })),
  ]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    chats[0].id,
  );

  const [showHistory, setShowHistory] = useState(false);
  const [, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null); // handle auto scroll

  const currentChat = chats.find((c) => c.id === selectedChatId);

  useEffect(() => {
    // handle auto scroll
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  // ---------------- CREATE NEW CHAT ----------------
  const createNewChat = () => {
    const newChat = makeWelcomeChat(
      t("chatTitle", { number: chats.length + 1 }),
    );

    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
  };



  // ---------------- DYNAMIC WORD-MATCHING & MARKDOWN RENDER ENGINE ----------------
  interface Source {
    title?: string;
    name?: string;
    url?: string;
    link?: string;
  }
  const renderEnhancedText = (
    text: string,
    sources: (string | Source)[] = [],
  ) => {
    if (!text) return null;

    // 1. Split text into individual lines to respect '\n' structural newlines explicitly
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      const trimmedLine = line.trim();

      // If the line is blank, render a structural vertical spacing block
      if (!trimmedLine) return <div key={lineIdx} className="h-2" />;

      // Identify if the current line represents an isolated list question starting with a hyphen '-' or an explicit number layout
      const isListItem =
        trimmedLine.startsWith("-") || /^\d+\./.test(trimmedLine);

      // Clean list item formatting layout styling classes
      const lineClass = `block leading-relaxed mb-1 text-sm text-gray-800 ${
        isListItem
          ? "ps-4 mb-2.5 font-medium border-s-2 border-teal-500/30 bg-slate-50/50 py-1 rounded-e"
          : "mb-1.5"
      }`;

      // Extract raw titles safely from your sources context array
      const sourceTitles = sources
        .map((src) =>
          typeof src === "string" ? src : src.title || src.name || "",
        )
        .filter(Boolean);

      // Guardrail: If no source keywords are loaded, evaluate basic bold markers only
      if (sourceTitles.length === 0) {
        const boldParts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <span key={lineIdx} className={lineClass}>
            {boldParts.map((part, idx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong
                    key={idx}
                    className="font-bold text-gray-900"
                  >
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
        title.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
      );

      // Combine bolding markdown pattern with raw source title matching phrases
      const pattern = new RegExp(
        `(\\*\\*.*?\\*\\*|${escapedTitles.map((t) => `\\b${t}\\b|${t}`).join("|")})`,
        "gi",
      );

      const parts = line.split(pattern);

      return (
        <span key={lineIdx} className={lineClass}>
          {parts.map((part, idx) => {
            if (!part) return null;

            // 2. Process standard markdown bold boundaries
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong
                  key={idx}
                  className="font-bold text-gray-900"
                >
                  {part.slice(2, -2)}
                </strong>
              );
            }

            // 3. Cross-reference whether text fragment matches any returned citation strings
            const matchedSource = sources.find((src) => {
              const name =
                typeof src === "string" ? src : src.title || src.name || "";
              return (
                name.toLowerCase() === part.toLowerCase() ||
                part.toLowerCase().includes(name.toLowerCase())
              );
            });

            if (matchedSource) {
              // Extract original key label for string sanitation lookup
              const rawLabel =
                typeof matchedSource === "string"
                  ? matchedSource
                  : matchedSource.title || part;

              // Clean up prefixes (like "Overview-") for clean NHS condition slugs
              const cleanSlug = rawLabel
                .replace(/^overview-/i, "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-");

              let linkUrl: string;

              if (typeof matchedSource === "string") {
                linkUrl = `https://www.nhs.uk/conditions/${cleanSlug}`;
              } else {
                linkUrl =
                  matchedSource.url ||
                  matchedSource.link ||
                  `https://www.nhs.uk/conditions/${cleanSlug}`;
              }

              return (
                <a
                  key={idx}
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-600 hover:bg-teal-100 hover:underline transition-colors decoration-dotted"
                  title={t("sources.linkTitle", { label: rawLabel })}
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

    const welcomeText = t("welcome");
    const thinkingText = t("thinking");

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== selectedChatId) return chat;

        let messages = [...chat.messages];
        const isOnlyWelcome =
          messages.length === 1 &&
          messages[0].sender === "ai" &&
          messages[0].text === welcomeText;

        if (isOnlyWelcome) {
          messages = [];
        }

        return {
          ...chat,
          messages: [
            ...messages,
            { sender: "user", text: userMessage },
            { sender: "ai", text: thinkingText },
          ],
        };
      }),
    );

    setIsLoading(true);

    try {
      const response = await sendMessageToAI(userMessage);
      console.log("🔴 Raw Payload in UI:", response);

      const aiReply =
        response?.answer ||
        response?.message?.answer ||
        response?.response?.answer ||
        t("noText");

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
            .lastIndexOf(thinkingText);

          if (lastThinkingIndex !== -1) {
            messages[lastThinkingIndex] = {
              sender: "ai",
              text: aiReply,
              sources,
            };
          }

          return { ...chat, messages };
        }),
      );
    } catch (error) {
      console.error("🔴 Frontend API Error:", error);
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== selectedChatId) return chat;

          const messages = [...chat.messages];
          const lastThinkingIndex = messages
            .map((m) => m.text)
            .lastIndexOf(thinkingText);

          if (lastThinkingIndex !== -1) {
            messages[lastThinkingIndex] = {
              sender: "ai",
              text: t("error"),
            };
          }

          return { ...chat, messages };
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const thinkingText = t("thinking");

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 end-6 z-50">
          <span className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping" />
          <span className="absolute inset-0 scale-110 rounded-full bg-primary opacity-20 animate-pulse" />
          <button
            onClick={openChatBot}
            className="relative h-14 w-14 rounded-full bg-primary hover:bg-fg text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
          >
            <Bot className="h-7 w-7" />
          </button>
        </div>
      )}

      {/* panel */}
      <div
        className={`fixed
z-50
bottom-4 sm:bottom-6
end-4 sm:end-6
w-[90vw]
sm:w-[22rem]
lg:w-[25rem]
xl:w-[25rem]
h-[65vh]
sm:h-[35rem]
bg-white
rounded-xl
border border-gray-200
shadow-xl
overflow-hidden
flex flex-col
transition-all duration-300 ease-out
${
  isOpen
    ? "translate-y-0 opacity-100"
    : "translate-y-6 opacity-0 pointer-events-none"
}`}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white shrink-0">
          {" "}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">{t("header.title")}</p>
              <p className="text-xs text-white/70">{t("header.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory((p) => !p)}
              className="text-lg px-2 hover:bg-white/10 rounded"
            >
              ⋮
            </button>

            <button
              onClick={closeChatBot}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex flex-1 overflow-hidden">
          {/* history */}
          <div
            className={`h-full border-e border-gray-100 bg-white transition-all duration-300 overflow-hidden ${
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
                const isThinking = msg.text === thinkingText;

                return (
                  <div
                    key={i}
                    className={`flex ${isAI ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        isAI
                          ? "bg-white text-gray-800 rounded-ss-none border border-gray-100"
                          : "bg-primary text-white rounded-ee-none"
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

              <div ref={messagesEndRef} />
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
