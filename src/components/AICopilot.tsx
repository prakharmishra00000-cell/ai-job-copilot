"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  actions?: Array<{ label: string; href: string }>;
  filters?: Record<string, string | number | boolean>;
}

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "👋 Hi! I'm your AI Career Copilot. I can help you find jobs, understand your matches, and optimize your applications.\n\nTry asking me something like:\n• \"Find me the best jobs today\"\n• \"Why is this job a good match?\"\n• \"Which skills should I learn?\"",
          suggestions: [
            "Find remote AI jobs",
            "Show top matches",
            "What skills am I missing?",
          ],
        },
      ]);
    }
  }, [isOpen, messages.length]);

  async function handleSend(query: string) {
    if (!query.trim()) return;

    const userMessage: CopilotMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      const assistantMessage: CopilotMessage = {
        role: "assistant",
        content: data.answer,
        suggestions: data.suggestions,
        actions: data.actions,
        filters: data.filters,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If there are filters, we could navigate to jobs page
      if (data.filters && Object.keys(data.filters).length > 0) {
        // Store filters for the jobs page to pick up
        sessionStorage.setItem("copilotFilters", JSON.stringify(data.filters));
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAction(href: string) {
    router.push(href);
    setIsOpen(false);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform"
        title="AI Career Copilot"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 w-[calc(100%-2rem)] md:w-96 h-[500px] glass-card z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm">
              🤖
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Career Copilot</h3>
              <p className="text-[10px] text-slate-400">Ask me anything about your job search</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {msg.suggestions.map((s, j) => (
                        <button
                          key={j}
                          onClick={() => handleSend(s)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-700/50 text-blue-300 hover:bg-slate-600/50 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map((a, j) => (
                        <button
                          key={j}
                          onClick={() => handleAction(a.href)}
                          className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-200 rounded-2xl px-4 py-2.5">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="input-field text-sm py-2.5 flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary px-4 py-2.5 disabled:opacity-50"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
