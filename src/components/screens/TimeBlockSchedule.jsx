/**
 * TimeBlockSchedule.jsx
 * Simple Cal Newport-style time block scheduler
 * Shows: Date | Time Block | Topic | Hours
 */

import React from "react";
import { Clock, AlertCircle } from "lucide-react";

export default function TimeBlockSchedule({ plan }) {
  if (!plan?.schedule) {
    return <div>No schedule available</div>;
  }

  // Group schedule by date
  const byDate = {};
  plan.schedule.forEach(block => {
    if (!byDate[block.date]) byDate[block.date] = [];
    byDate[block.date].push(block);
  });

  const dates = Object.keys(byDate).sort();

  return (
    <div style={{ padding: "14px", background: "#fff8f5" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Newsreader',serif", fontSize: 16, fontWeight: 700, color: "var(--brown)", marginBottom: 4 }}>
          📅 Your Study Schedule
        </div>
        <div style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 11, color: "var(--outline)" }}>
          {plan.daysAvailable} days • {plan.totalHours}h total • Work-ahead approach
        </div>
      </div>

      {/* Daily Schedule */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dates.map((date, dayIdx) => (
          <div key={date} style={{
            background: "white",
            borderRadius: 12,
            border: "1.5px solid var(--outline-v)",
            overflow: "hidden"
          }}>
            {/* Day Header */}
            <div style={{
              padding: "10px 12px",
              background: "var(--bg-dim)",
              borderBottom: "1px solid var(--outline-v)",
              fontFamily: "'Work Sans',sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--orange-m)",
              textTransform: "uppercase"
            }}>
              Day {dayIdx + 1} • {date}
            </div>

            {/* Time Blocks */}
            <div style={{ padding: "12px" }}>
              {byDate[date].map((block, idx) => (
                <div
                  key={block.id}
                  style={{
                    marginBottom: idx < byDate[date].length - 1 ? 10 : 0,
                    padding: "10px",
                    borderRadius: 8,
                    background: "var(--bg-low)",
                    border: "1px solid var(--outline-v)"
                  }}
                >
                  {/* Time + Duration */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6
                  }}>
                    <Clock size={14} style={{ color: "var(--orange-m)", flexShrink: 0 }} />
                    <div style={{
                      fontFamily: "'Work Sans',sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--orange-m)"
                    }}>
                      {block.startTime} – {block.endTime}
                    </div>
                    <div style={{
                      fontFamily: "'Work Sans',sans-serif",
                      fontSize: 10,
                      color: "var(--outline)",
                      marginLeft: "auto"
                    }}>
                      {block.duration}h
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{
                    fontFamily: "'Newsreader',serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--brown)",
                    marginBottom: 3
                  }}>
                    {block.title}
                  </div>

                  {/* Description */}
                  <div style={{
                    fontFamily: "'Work Sans',sans-serif",
                    fontSize: 9,
                    color: "var(--outline)",
                    lineHeight: 1.4,
                    marginBottom: 6
                  }}>
                    {block.description}
                  </div>

                  {/* Subtasks */}
                  {block.subtasks?.length > 0 && (
                    <div style={{
                      fontFamily: "'Work Sans',sans-serif",
                      fontSize: 9,
                      color: "var(--brown-m)",
                      paddingTop: 6,
                      borderTop: "1px solid var(--outline-v)"
                    }}>
                      {block.subtasks.map((task, i) => (
                        <div key={i} style={{ marginTop: 4 }}>
                          ✓ {task}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      {plan.plannerNote && (
        <div style={{
          marginTop: 16,
          padding: "10px 12px",
          borderRadius: 8,
          background: "#dff0dd",
          border: "1px solid #2d6a4f",
          fontFamily: "'Work Sans',sans-serif",
          fontSize: 10,
          color: "#2d6a4f",
          display: "flex",
          alignItems: "flex-start",
          gap: 8
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{plan.plannerNote}</div>
        </div>
      )}
    </div>
  );
}
