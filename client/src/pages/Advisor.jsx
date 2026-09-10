import { useState } from "react";
import axios from "axios";
import { API } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Advisor() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Don't send an empty question
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    try {
      const response = await axios.post(`${API}/ai/advisor`, { question });
      setAnswer(response.data.answer);
    } catch (error) {
      setAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-serif font-medium text-gray-900">
          Planting Advisor
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Ask about timing, weather, prices, and soil fit — all in one answer
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 max-w-3xl w-full mx-auto">
        {/* Input */}
        <div className="flex gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
            placeholder="e.g. Is it a good time to plant onions on my land near Pune?"
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Ask
          </button>
        </div>

        {/* Loading state — worth a more specific message than a bare
            spinner, since this request can take a few sequential round
            trips (tool calls) before anything comes back. */}
        {loading && (
          <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-500 shadow-sm">
            Checking weather, prices, and your farm data...
          </div>
        )}

        {/* Answer */}
        {!loading && answer && (
          <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
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
                {answer}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
