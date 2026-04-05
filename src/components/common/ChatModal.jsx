import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, Send } from "lucide-react";
import rumpelIcon from "../assets/rumpel.png";
import { callGeminiChat } from "../../utils/geminiApi.js";
import "../../styles/chatmodal.css";

/**
 * Chat Modal component for talking to Rumpel AI.
 * TEMPLATE: Customize AI personality and system prompts in callGeminiChat()
 * Full-screen modal that manages conversation history with Gemini API.
 */
export default function ChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 0);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const responseText = await callGeminiChat(messages, userMessage);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: responseText },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Error: ${err.message || "Failed to connect"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        {/* Header */}
        <div className="chat-modal-header">
          <div className="chat-modal-title">
            <img src={rumpelIcon} alt="Rumpel" className="chat-modal-icon" />
            <h2>Rumpel</h2>
          </div>
          <button className="chat-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-modal-messages" ref={messagesContainerRef}>
          {messages.length === 0 && (
            <div className="chat-modal-empty">
              <img src={rumpelIcon} alt="Rumpel" className="chat-modal-welcome-icon" />
              <h3>Hey! I'm Rumpel 🧙</h3>
              <p>Ask me anything about your study plans, notes, or anything else!</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message chat-message-${msg.role}`}>
              {msg.role === "assistant" && (
                <img src={rumpelIcon} alt="Rumpel" className="chat-avatar" />
              )}
              <div className={`chat-bubble chat-bubble-${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message chat-message-assistant">
              <img src={rumpelIcon} alt="Rumpel" className="chat-avatar" />
              <div className="chat-bubble chat-bubble-assistant chat-bubble-loading">
                <Loader2 size={18} className="spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chat-modal-input-area">
          <div className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask Rumpel…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && send()}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={send}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
