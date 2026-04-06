import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Menu, ChevronDown, Plus, Zap, Circle, Loader2, Send, FileText, Search, LayoutGrid, Paperclip, Image as ImageIcon, XCircle, MessageSquare, Trash2, Pencil, Check } from "lucide-react";
import rumpelIcon from "../assets/rumpel.png";
import { callGeminiChat } from "../../utils/geminiApi.js";
import "../../styles/chatmodal.css";

const SUGGESTIONS = [
  { icon: FileText, label: "Research a Topic" },
  { icon: Search, label: "Semantic Search" },
  { icon: LayoutGrid, label: "Get an Overview" },
  { icon: FileText, label: "Summarize Notes" },
  { icon: Search, label: "Find a Study Plan" },
];

/* Snap points as % of parent height */
const SNAP_MIN = 0.38;   // collapsed
const SNAP_MID = 0.62;   // default
const SNAP_MAX = 0.92;   // expanded

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

let nextChatId = 1;
function makeChat() {
  return { id: nextChatId++, title: "New Chat", messages: [] };
}

/** Ask Gemini to generate a short title for the conversation */
async function generateTitle(messages) {
  try {
    const snippet = messages.slice(0, 4).map((m) => `${m.role}: ${m.text?.slice(0, 120)}`).join("\n");
    const title = await callGeminiChat(
      [],
      `Below is the start of a conversation. Generate a short title (max 5 words, no quotes, no punctuation at the end) that captures the topic.\n\n${snippet}`,
      { mode: "fast", maxOutputTokens: 20, temperature: 0.3 }
    );
    const cleaned = title.replace(/^["']|["']$/g, "").replace(/[.!?]+$/, "").trim();
    return cleaned || "New Chat";
  } catch {
    return "New Chat";
  }
}

export default function ChatModal({ isOpen, onClose }) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [chats, setChats] = useState(() => [makeChat()]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [mode, setMode] = useState("fast");
  const [attachments, setAttachments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const fileInputRef = useRef(null);

  /* derived */
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];

  const setMessages = (updater) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
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
    const userMessage = text || input.trim();
    if (!userMessage && attachments.length === 0) return;
    setInput("");
    const currentAttachments = [...attachments];
    setAttachments([]);

    // Build file parts for Gemini inline_data
    const fileParts = currentAttachments.map((a) => ({
      inline_data: { mime_type: a.mime, data: a.data },
    }));

    // Build display parts for the message bubble
    const userParts = [{ text: userMessage || "(attached files)" }];
    if (currentAttachments.length > 0) {
      userParts.push(...currentAttachments.map((a) => ({
        inline_data: { mime_type: a.mime, data: a.data },
      })));
    }

    setMessages((prev) => [...prev, {
      role: "user",
      text: userMessage || `📎 ${currentAttachments.map((a) => a.name).join(", ")}`,
      attachments: currentAttachments,
      parts: userParts,
    }]);
    setLoading(true);
    if (sheetHeight < SNAP_MID) setSheetHeight(SNAP_MID);
    try {
      const responseText = await callGeminiChat(messages, userMessage || "Describe the attached file(s).", {
        mode,
        fileParts: fileParts.length > 0 ? fileParts : undefined,
      });
      setMessages((prev) => {
        const updated = [...prev, { role: "assistant", text: responseText }];
        // Auto-generate title after first assistant reply
        if (activeChat.title === "New Chat" && updated.filter((m) => m.role === "assistant").length === 1) {
          const chatId = activeChatId;
          generateTitle(updated).then((t) => setChatTitle(chatId, t));
        }
        return updated;
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message || "Failed to connect"}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const fresh = makeChat();
    setChats((prev) => [fresh, ...prev]);
    setActiveChatId(fresh.id);
    setInput("");
    setAttachments([]);
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
        const fresh = makeChat();
        return [fresh];
      }
      return remaining;
    });
    if (id === activeChatId) {
      setChats((prev) => {
        setActiveChatId(prev[0].id);
        return prev;
      });
    }
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
            <div key={idx} className={`chat-message chat-message-${msg.role}`}>
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

        {/* Suggestions accordion */}
        {messages.length === 0 && (
          <div className="chat-suggestions">
            <h3 className="chat-suggestions-title">Suggestions</h3>
            {visibleSuggestions.map(({ icon: Icon, label }, i) => (
              <button key={i} className="chat-suggestion-row" onClick={() => send(label)}>
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
