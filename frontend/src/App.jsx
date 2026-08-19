import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const STARTER_QUESTIONS = [
  "What are you working on right now?",
  "Why did you get into AI/software?",
  "What's your favorite project you've built?",
  "What are you like to work with?",
];

function Message({ role, content }) {
  return (
    <div className={`message ${role}`}>
      <div className="bubble">{content}</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message assistant">
      <div className="bubble typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(0, -1),
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setError("Something went wrong reaching Oskar. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Ask Oskar Anything</h1>
        <p>
          A curious recruiter? Ask away — this is an AI chat trained on real facts about me,
          my work, and how I like to build things.
        </p>
      </header>

      <main className="chat">
        <div className="messages">
          {messages.length === 0 && (
            <div className="starters">
              {STARTER_QUESTIONS.map((q) => (
                <button key={q} className="chip" onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <Message key={i} role={m.role} content={m.content} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={scrollRef} />
        </div>

        {error && <div className="error">{error}</div>}

        <form className="composer" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            maxLength={500}
            placeholder="Ask me something..."
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
