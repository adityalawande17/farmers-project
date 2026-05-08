import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../context/AuthContext";

const SUGGESTIONS = [
  "When should I harvest my wheat?",
  "How to treat powdery mildew?",
  "Best fertilizer for tomatoes?",
  "PM-Kisan scheme eligibility?",
  "My tomato leaves are turning yellow",
];

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Namaste ${user?.name?.split(" ")[0] || ""} ji!  I'm your AI farming assistant. Ask me anything about crops, weather, pests, or government schemes — in Hindi, Marathi, or English!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg = { role: "user", content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const context = {
        crops: user?.crops || [],
        location: `${user?.location?.district || ""}, ${user?.location?.state || "India"}`,
        season: "Rabi 2024",
      };
      // Send only last 10 messages to keep context window reasonable
      const recentMsgs = updated
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      const { data } = await axios.post(`${API}/ai/chat`, {
        messages: recentMsgs,
        context,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-serif font-medium text-gray-900">
          AI Farm Assistant
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Powered by Claude AI · Hindi, Marathi & English
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 max-w-3xl w-full mx-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-green-500 text-white rounded-br-md"
                  : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-green-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-green-300 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-green-300 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 pb-3 flex gap-2 flex-wrap max-w-3xl mx-auto w-full">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 max-w-3xl mx-auto w-full">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && send()}
            placeholder="Ask anything... e.g. When should I water my wheat?"
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-colors"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
