import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../context/AuthContext";
import { getCurrentSeason } from "../utils/season";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";

const SUGGESTIONS = [
  "When should I harvest my wheat?",
  "How to treat powdery mildew?",
  "Best fertilizer for tomatoes?",
  "PM-Kisan scheme eligibility?",
  "My tomato leaves are turning yellow",
];

const GREETING = (name) =>
  `Namaste ${name || ""} ji! I'm your AI farming assistant. Ask me anything about crops, weather, pests, or government schemes — in Hindi, Marathi, or English!`;

export default function Chatbot() {
  const { user, token } = useAuth();
  const [cropNames, setCropNames] = useState([]);
  const [messages, setMessages] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${API}/farm/crops`)
      .then((res) => setCropNames(res.data.map((c) => c.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/ai/history`)
      .then((res) => {
        if (res.data.length > 0) {
          setMessages(res.data);
        } else {
          setMessages([
            { role: "assistant", content: GREETING(user?.name?.split(" ")[0]) },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          { role: "assistant", content: GREETING(user?.name?.split(" ")[0]) },
        ]);
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg = { role: "user", content: msg };
    const updated = [...messages, userMsg];

    // Create an empty assistant message immediately.
    // Streaming chunks will be added to this message.
    const assistantMsg = { role: "assistant", content: "" };

    setMessages([...updated, assistantMsg]);
    setLoading(true);

    try {
      const context = {
        crops: cropNames,
        location: `${user?.location?.district || ""}, ${user?.location?.state || "India"}`,
        season: getCurrentSeason(),
      };
      // Send only last 10 messages to keep context window reasonable
      const recentMsgs = updated
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API}/ai/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: recentMsgs,
          context,
          saveToHistory: true,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to connect to AI");
      }

      if (!response.body) {
        throw new Error("Streaming is not supported");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let finished = false;

      while (!finished) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");

        // Keep the last incomplete line in the buffer.
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (parsed.done) {
              finished = true;
              break;
            }

            if (parsed.text) {
              setMessages((prev) => {
                const updatedMessages = [...prev];
                const lastIndex = updatedMessages.length - 1;

                updatedMessages[lastIndex] = {
                  ...updatedMessages[lastIndex],
                  content: updatedMessages[lastIndex].content + parsed.text,
                };

                return updatedMessages;
              });
            }
          } catch {
            // Ignore incomplete JSON and wait for the next chunk.
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updatedMessages = [...prev];

        const lastIndex = updatedMessages.length - 1;

        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          content: "Sorry, I had trouble connecting. Please try again.",
        };

        return updatedMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        variant="bordered"
        title="AI Farm Assistant"
        subtitle="Powered by Claude AI · Hindi, Marathi & English"
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 max-w-3xl w-full mx-auto">
        {historyLoading ? (
          <div className="flex flex-col gap-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <Skeleton
                  className={`h-10 rounded-2xl ${i % 2 === 0 ? "bg-green-100 w-48" : "bg-gray-100 w-64"}`}
                />
              </div>
            ))}
          </div>
        ) : null}
        {!historyLoading &&
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "max-w-[75%] bg-green-500 text-white rounded-br-md"
                    : "max-w-[92%] bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                }`}
              >
                {/* {msg.content} */}
                {msg.role === "assistant" ? (
                  <div
                    className="prose prose-sm max-w-none
                  prose-p:my-2
                  prose-headings:mt-4
                  prose-headings:mb-2
                  prose-ul:my-2
                  prose-ol:my-2
                  prose-li:my-1
                  prose-strong:text-gray-900"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
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
      {!historyLoading && !hasUserMessages && (
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
          <Button onClick={() => send()} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
