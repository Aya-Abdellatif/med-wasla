import type { Message } from "../../../types/chat.types";

function ChatSources({ message }: { message: Message }) {
  if (!message.sources?.length) return null;

  return (
    <div className="border-t p-2 text-xs bg-gray-50">
      <p className="font-bold mb-1">Sources</p>

      {message.sources.map((s, i) => (
        <div key={i} className="text-gray-600">
          • {s.title}
        </div>
      ))}

      {message.confidence !== undefined && (
        <p className="mt-1 text-gray-400">
          Confidence: {Math.round(message.confidence * 100)}%
        </p>
      )}
    </div>
  );
}

export default ChatSources;