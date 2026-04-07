import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Menu, ChevronDown, Plus, Zap, Circle, Loader2, Send, FileText, Search, LayoutGrid, Paperclip, Image as ImageIcon, XCircle, MessageSquare, Trash2, Pencil, Check } from "lucide-react";
import rumpelIcon from "../assets/rumpel.png";
import { callGeminiChat } from "../../utils/geminiApi.js";
import "../../styles/chatmodal.css";

const SUGGESTIONS = [
  { icon: FileText, label: "Research a Topic", prompt: "Help me research a topic. Start by asking what subject I want to explore and what depth I need." },
  { icon: Search, label: "Semantic Search", prompt: "Help me do a semantic search. Ask what I am looking for and what context I already have." },
  { icon: LayoutGrid, label: "Get an Overview", prompt: "Give me a clear overview of this topic and break it into the main parts I should understand first." },
  { icon: FileText, label: "Summarize Notes", prompt: "Help me summarize my notes into the most important takeaways and action items." },
  { icon: Search, label: "Find a Study Plan", prompt: "Build me a practical study plan. Ask what I am learning, my deadline, and how much time I have each day." },
];

/* Snap points as % of parent height */
const SNAP_MIN = 0.38;   // collapsed
const SNAP_MID = 0.62;   // default
const SNAP_MAX = 0.92;   // expanded

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** Ask Gemini to generate a short title for the conversation */
async function generateTitle(messages) {
  try {
    const snippet = messages.slice(0, 4).map((m) => `${m.role}: ${m.text?.slice(0, 120)}`).join("\n");
    const title = await callGeminiChat(
      [],
      `Below is the start of a conversation. Generate a short title (max 5 words, no quotes, no punctuation at the end) that captures the topic.\n\n${snippet}`,
      { mode: "fast", purpose: "title" }
    );
    const cleaned = title.replace(/^["']|["']$/g, "").replace(/[.!?]+$/, "").trim();
    return cleaned || "New Chat";
  } catch {
    return "New Chat";
  }
}

export default function ChatModal({ isOpen, onClose }) {
  const nextChatIdRef = useRef(1);
  const nextMessageIdRef = useRef(1);

  const createChat = () => ({ id: nextChatIdRef.current++, title: "New Chat", messages: [] });
  const createMessageId = (prefix = "msg") => `${prefix}-${nextMessageIdRef.current++}`;

  const initialChatRef = useRef(null);
  if (!initialChatRef.current) {
    initialChatRef.current = createChat();
  }

  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [chats, setChats] = useState(() => [initialChatRef.current]);
  const [activeChatId, setActiveChatId] = useState(() => initialChatRef.current.id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [mode, setMode] = useState("fast");
  const [attachments, setAttachments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [suggestionsSliding, setSuggestionsSliding] = useState(false);
  const fileInputRef = useRef(null);

  /* derived */
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];

  const setMessages = (updater, chatId = activeChatId) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: typeof updater === "function" ? updater(c.messages) : updater }
          : c
      )
    );
  };

  const setChatTitle = (id, title) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  /* drag state */
  const [sheetHeight, setSheetHeight] = useState(SNAP_MID); // fraction 0-1
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(SNAP_MID);
  const containerRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (isClosing) return;
    clearTimeout(closeTimerRef.current);
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      onClose();
    }, 260);
  }, [isClosing, onClose]);

  /* reset height when modal opens */
  useEffect(() => {
    if (isOpen) {
      clearTimeout(closeTimerRef.current);
      setIsRendered(true);
      setIsClosing(false);
      setSheetHeight(SNAP_MID);
    }
  }, [isOpen]);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 0);
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  /* ---- drag handlers ---- */
  const getY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

  const onDragStart = useCallback((e) => {
    setIsDragging(true);
    dragStartY.current = getY(e);
    dragStartH.current = sheetHeight;
  }, [sheetHeight]);

  const onDragMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const parentH = containerRef.current.parentElement.clientHeight;
    const dy = dragStartY.current - getY(e);
    const newH = clamp(dragStartH.current + dy / parentH, 0.25, 0.95);
    setSheetHeight(newH);
  }, [isDragging]);

  const snapTo = useCallback((h) => {
    const snaps = [SNAP_MIN, SNAP_MID, SNAP_MAX];
    // if dragged below minimum, close
    if (h < 0.28) { requestClose(); return; }
    // find nearest snap
    let best = snaps[0];
    for (const s of snaps) if (Math.abs(s - h) < Math.abs(best - h)) best = s;
    setSheetHeight(best);
  }, [requestClose]);

  const onDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    snapTo(sheetHeight);
  }, [isDragging, sheetHeight, snapTo]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => onDragMove(e);
    const onUp = () => onDragEnd();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, onDragMove, onDragEnd]);

  useEffect(() => {
    if (!chats.some((chat) => chat.id === activeChatId) && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  /* ---- file attachment ---- */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            mime: file.type,
            data: base64,
            preview: file.type.startsWith("image/") ? reader.result : null,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ---- chat logic ---- */
  const send = async (text) => {
    if (loading) return;

    const userMessage = text || input.trim();
    if (!userMessage && attachments.length === 0) return;

    setInput("");
    const currentAttachments = [...attachments];
    setAttachments([]);
    setSuggestionsSliding(false);

    const requestText = userMessage || "Describe the attached file(s).";
    const chatIdAtSend = activeChatId;
    const chatAtSend = chats.find((c) => c.id === chatIdAtSend);
    const userEntry = {
      id: createMessageId("user"),
      role: "user",
      text: userMessage || `📎 ${currentAttachments.map((a) => a.name).join(", ")}`,
      attachments: currentAttachments,
    };
    const pendingId = createMessageId("assistant-pending");
    const pendingEntry = {
      id: pendingId,
      role: "assistant",
      text: "",
      pending: true,
    };

    // Build history including the new user message for the API call
    // (React state `messages` is stale inside this closure)
    const historyForApi = [...(chatAtSend?.messages || []), userEntry];

    setMessages((prev) => [...prev, userEntry, pendingEntry], chatIdAtSend);
    setLoading(true);
    if (sheetHeight < SNAP_MID) setSheetHeight(SNAP_MID);

    try {
      const responseText = await callGeminiChat(historyForApi, requestText, {
        mode,
        attachments: currentAttachments,
      });

      setMessages((prev) => {
        const updated = prev.map((message) => (
          message.id === pendingId
            ? { ...message, role: "assistant", text: responseText, pending: false }
            : message
        ));
        return updated;
      }, chatIdAtSend);

      const messagesForTitle = [...historyForApi, { id: pendingId, role: "assistant", text: responseText }];
      if ((chatAtSend?.title || "New Chat") === "New Chat" && messagesForTitle.filter((m) => m.role === "assistant").length === 1) {
        generateTitle(messagesForTitle).then((t) => setChatTitle(chatIdAtSend, t));
      }
    } catch (err) {
      console.error(err);
      let errorMsg = err.message || "Failed to connect";
      
      // Better error messages
      if (errorMsg.includes("Failed to fetch")) {
        errorMsg = "Backend not running. Start proxy: cd server && npm run dev";
      } else if (errorMsg.includes("API request failed")) {
        errorMsg = "API Error: Check console. Backend proxy may not have valid API key.";
      }
      
      setMessages((prev) => prev.map((message) => (
        message.id === pendingId
          ? { ...message, role: "assistant", text: `Error: ${errorMsg}`, pending: false }
          : message
      )), chatIdAtSend);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const fresh = createChat();
    setChats((prev) => [fresh, ...prev]);
    setActiveChatId(fresh.id);
    setInput("");
    setAttachments([]);
    setSuggestionsSliding(false);
    setShowHistory(false);
  };

  const switchChat = (id) => {
    setActiveChatId(id);
    setInput("");
    setAttachments([]);
    setShowHistory(false);
  };

  const deleteChat = (id) => {
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh = createChat();
        return [fresh];
      }
      return remaining;
    });
  };

  const handleSuggestion = (label) => {
    if (loading) return;
    const suggestion = SUGGESTIONS.find((item) => item.label === label);
    setSuggestionsSliding(true);
    send(suggestion?.prompt || label);
  };

  const visibleSuggestions = showAllSuggestions ? SUGGESTIONS : SUGGESTIONS.slice(0, 3);

  if (!isRendered) return null;

  return (
    <div className={`chat-sheet-overlay ${isClosing ? "closing" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) requestClose(); }}>
      <div
        ref={containerRef}
        className={`chat-sheet ${isDragging ? "dragging" : ""} ${isClosing ? "closing" : ""}`}
        style={{ height: `${sheetHeight * 100}%` }}
      >
        {/* Drag handle */}
        <div
          className="chat-sheet-handle"
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
        >
          <div className="chat-sheet-pill" />
        </div>

        {/* Header */}
        <div className="chat-modal-header">
          <button className="chat-header-btn" onClick={() => setShowHistory((v) => !v)}>
            <Menu size={20} />
          </button>
          <button className="chat-new-btn" onClick={handleNewChat}>
            {activeChat?.title || "New Chat"}
          </button>
          <button className="chat-header-btn" onClick={requestClose}>
            <X size={20} />
          </button>
        </div>

        {/* History panel (full-width, replaces chat content) */}
        {showHistory ? (
          <div className="chat-history-panel">
            <div className="chat-history-top">
              <span className="chat-history-title">Your Chats</span>
            </div>
            <div className="chat-history-list">
              {chats.map((c) => (
                <div
                  key={c.id}
                  className={`chat-history-item ${c.id === activeChatId ? "active" : ""}`}
                  onClick={() => { if (editingChatId !== c.id) switchChat(c.id); }}
                >
                  <MessageSquare size={15} className="chat-history-item-icon" />
                  <div className="chat-history-item-info">
                    {editingChatId === c.id ? (
                      <input
                        className="chat-history-item-edit"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setChatTitle(c.id, editingTitle.trim() || "New Chat");
                            setEditingChatId(null);
                          }
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="chat-history-item-title">{c.title}</span>
                        <span className="chat-history-item-preview">
                          {c.messages.length === 0 ? "No messages yet" : `${c.messages.length} message${c.messages.length === 1 ? "" : "s"}`}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="chat-history-item-actions">
                    {editingChatId === c.id ? (
                      <span
                        className="chat-history-item-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatTitle(c.id, editingTitle.trim() || "New Chat");
                          setEditingChatId(null);
                        }}
                      >
                        <Check size={14} />
                      </span>
                    ) : (
                      <span
                        className="chat-history-item-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(c.id);
                          setEditingTitle(c.title);
                        }}
                      >
                        <Pencil size={13} />
                      </span>
                    )}
                    {chats.length > 1 && editingChatId !== c.id && (
                      <span
                        className="chat-history-item-action chat-history-item-delete"
                        onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                      >
                        <Trash2 size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <>
        {/* Messages */}
        <div className="chat-modal-messages" ref={messagesContainerRef}>
          {messages.map((msg, idx) => (
            <div key={msg.id || `legacy-${idx}`} className={`chat-message chat-message-${msg.role}`}>
              {msg.role === "assistant" && (
                <img src={rumpelIcon} alt="Rumpel" className="chat-avatar" />
              )}
              <div className={`chat-bubble chat-bubble-${msg.role}`}>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="chat-bubble-attachments">
                    {msg.attachments.map((a, i) => (
                      a.preview
                        ? <img key={i} src={a.preview} alt={a.name} className="chat-attach-thumb" />
                        : <span key={i} className="chat-attach-file">📎 {a.name}</span>
                    ))}
                  </div>
                )}
                {msg.pending ? <Loader2 size={18} className="spin" /> : msg.text}
              </div>
            </div>
          ))}
          {loading && !messages.some((msg) => msg.pending) && (
            <div className="chat-message chat-message-assistant">
              <img src={rumpelIcon} alt="Rumpel" className="chat-avatar" />
              <div className="chat-bubble chat-bubble-assistant chat-bubble-loading">
                <Loader2 size={18} className="spin" />
              </div>
            </div>
          )}
        </div>

        {/* Suggestions accordion */}
        {messages.length === 0 && (
          <div className={`chat-suggestions${suggestionsSliding ? ' suggestions-slide-out' : ''}`}>
            <h3 className="chat-suggestions-title">Suggestions</h3>
            {visibleSuggestions.map(({ icon: Icon, label }, i) => (
              <button key={i} className="chat-suggestion-row" onClick={() => handleSuggestion(label)} disabled={loading}>
                <Icon size={16} className="chat-suggestion-icon" />
                <span>{label}</span>
              </button>
            ))}
            {SUGGESTIONS.length > 3 && (
              <button
                className="chat-suggestion-row chat-suggestion-more"
                onClick={() => setShowAllSuggestions((v) => !v)}
              >
                <ChevronDown
                  size={16}
                  className="chat-suggestion-icon"
                  style={{ transform: showAllSuggestions ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                />
                <span>{showAllSuggestions ? "Show Less" : `Show ${SUGGESTIONS.length - 3} More`}</span>
              </button>
            )}
          </div>
        )}

        {/* Input */}
        <div className="chat-modal-input-area">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="chat-attach-preview-row">
              {attachments.map((a, i) => (
                <div key={i} className="chat-attach-preview">
                  {a.preview
                    ? <img src={a.preview} alt={a.name} className="chat-attach-preview-img" />
                    : <span className="chat-attach-preview-name">📎 {a.name}</span>
                  }
                  <button className="chat-attach-remove" onClick={() => removeAttachment(i)}>
                    <XCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Message Rumpel…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && send()}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={() => send()}
              disabled={loading || (!input.trim() && attachments.length === 0)}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            </button>
          </div>
          <div className="chat-input-tags">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.md,.csv,.json"
              multiple
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <button className="chat-tag-btn" onClick={() => fileInputRef.current?.click()}>
              <Plus size={14} />
            </button>
            <button
              className={`chat-tag-btn ${mode === "fast" ? "chat-tag-active" : ""}`}
              onClick={() => setMode("fast")}
            >
              <Zap size={14} /> Fast
            </button>
            <button
              className={`chat-tag-btn ${mode === "auto" ? "chat-tag-active" : ""}`}
              onClick={() => setMode("auto")}
            >
              <Circle size={14} /> Auto
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
