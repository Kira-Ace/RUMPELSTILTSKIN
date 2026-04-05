import React, { useState } from "react";
import { Home, CalendarDays, BookMarked, Settings } from "lucide-react";
import rumpelIcon from "../assets/rumpel.png";

/**
 * Bottom Navigation component for the Rumpel app.
 * Features a pill-shaped nav container and interactive Rumpel FAB.
 */
export default function BottomNav({ active, setActive, bgPlan, setChatModalOpen }) {
  const tabs = [
    { id: "home", Icon: Home },
    { id: "calendar", Icon: CalendarDays },
    { id: "planner", Icon: BookMarked },
    { id: "settings", Icon: Settings },
  ];

  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");

  const send = () => {
    if (!msg.trim()) return;
    const responses = [
      "Got it! Added to your schedule.",
      "Great idea! Reminder set?",
      "Done! You've got this! 🎯",
      "Added to your study list.",
    ];
    setReply(responses[Math.floor(Math.random() * responses.length)]);
    setMsg("");
    setTimeout(() => setReply(""), 3500);
  };

  return (
    <div className="bottom-nav">
      <div className="nav-pill">
        {tabs.map(({ id, Icon }) => (
          <button
            key={id}
            className={`nav-btn ${active === id ? "active" : ""}`}
            onClick={() => setActive(id)}
          >
            <Icon size={21} />
          </button>
        ))}
      </div>

      <div className="nav-fab-wrap">
        <div className="fab-chat">
          {reply && <div className="fab-chat-msg">🧙 {reply}</div>}
          <div className="fab-chat-row">
            <input
              className="fab-chat-input"
              placeholder="Ask Rumpel…"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="fab-chat-send" onClick={send}>
              <img src={rumpelIcon} alt="Send" style={{width: "16px", height: "16px", filter: "drop-shadow(0.5px 1px 1px rgba(205, 75, 35, 0.75))"}} />
            </button>
          </div>
        </div>
        <button className="nav-fab" onClick={() => setChatModalOpen(true)}>
          <img src={rumpelIcon} alt="Rumpel" style={{width: "32px", height: "32px", filter: "drop-shadow(1px 2px 2px rgba(183, 81, 47, 0.75))"}} />
        </button>
      </div>
    </div>
  );
}
