/**
 * TaskCalendarPlacement.jsx
 * Interactive calendar for assigning tasks to dates
 * Shows AI's recommended distribution, allows user to reassign
 */

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

export default function TaskCalendarPlacement({ plan, onTaskMove }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate] = useState(new Date()); // Today

  // Sort topics by priority (ascending = highest priority first)
  const sortedTopics = useMemo(() => {
    return [...(plan.topics || [])].sort((a, b) => 
      (a.priority || 999) - (b.priority || 999)
    );
  }, [plan.topics]);

  // Generate date range from today to deadline
  const deadlineDate = useMemo(() => {
    const parts = plan.deadline?.split(" ") || [];
    if (parts.length === 3) {
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const monthIdx = months.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
      return new Date(parts[2], monthIdx, parseInt(parts[1]));
    }
    return new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000); // Default 3 weeks
  }, [plan.deadline, startDate]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(startDate);
    while (current <= deadlineDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [startDate, deadlineDate]);

  // Group topics by assigned day
  const tasksByDay = useMemo(() => {
    const map = {};
    sortedTopics.forEach(topic => {
      const dayOffset = topic.dayOffset || 0;
      const dateStr = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(topic);
    });
    return map;
  }, [sortedTopics, startDate]);

  const getPriorityColor = (priority) => {
    if (priority <= 3) return "#2d6a4f"; // Green - high priority
    if (priority <= 6) return "#f47b20"; // Orange - medium
    return "#8b7265"; // Brown - low
  };

  const getPriorityLabel = (priority) => {
    if (priority <= 3) return "High";
    if (priority <= 6) return "Medium";
    return "Low";
  };

  return (
    <div style={{ padding: "14px", background: "#fff8f5" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Newsreader',serif", fontSize: 16, fontWeight: 700, color: "var(--brown)", marginBottom: 4 }}>
          📅 Assign to Calendar
        </div>
        <div style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 11, color: "var(--outline)" }}>
          Click a task to move it to a different date
        </div>
      </div>

      {/* Priority Legend */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "High Priority", color: "#2d6a4f" },
          { label: "Medium Priority", color: "#f47b20" },
          { label: "Low Priority", color: "#8b7265" }
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
            <span style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 10, color: "var(--brown)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(calendarDays.length, 7)}, 1fr)`, gap: 8, minWidth: "100%" }}>
          {calendarDays.slice(0, 28).map((date, idx) => {
            const dateStr = date.toISOString().split("T")[0];
            const dayTasks = tasksByDay[dateStr] || [];
            const isToday = idx === 0;

            return (
              <div
                key={dateStr}
                style={{
                  border: isToday ? "2px solid var(--orange-m)" : "1.5px solid var(--outline-v)",
                  borderRadius: 10,
                  padding: 10,
                  minHeight: 180,
                  background: isToday ? "#fff1e9" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"}
                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Date Header */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 9, fontWeight: 700, color: "var(--orange-m)", textTransform: "uppercase" }}>
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div style={{ fontFamily: "'Newsreader',serif", fontSize: 14, fontWeight: 700, color: "var(--brown)" }}>
                    {date.getDate()}
                  </div>
                </div>

                {/* Tasks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedDate(dateStr)}
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        background: getPriorityColor(task.priority),
                        color: "white",
                        cursor: "pointer",
                        fontSize: 9,
                        fontWeight: 600,
                        fontFamily: "'Work Sans',sans-serif",
                        transition: "all 0.15s",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        opacity: 0.85
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.opacity = "0.85";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task List by Priority */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: "'Newsreader',serif", fontSize: 14, fontWeight: 700, color: "var(--brown)", marginBottom: 12 }}>
          Tasks by Priority
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sortedTopics.map(task => (
            <div
              key={task.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: 10,
                background: "white",
                borderRadius: 8,
                border: `2px solid ${getPriorityColor(task.priority)}80`,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "#ffeadd"}
              onMouseOut={e => e.currentTarget.style.background = "white"}
            >
              <div style={{ width: 24, height: 24, borderRadius: 50, background: getPriorityColor(task.priority), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                {task.priority}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Newsreader',serif", fontSize: 12, fontWeight: 700, color: "var(--brown)", marginBottom: 2 }}>
                  {task.title}
                </div>
                <div style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 10, color: "var(--outline)", lineHeight: 1.4 }}>
                  {task.description}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 9, fontWeight: 700, color: "var(--orange-m)", marginBottom: 2 }}>
                  {task.estimatedHours}h
                </div>
                <div style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 8, color: "var(--outline)" }}>
                  {getPriorityLabel(task.priority)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
