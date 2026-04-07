import { useState } from 'react';
import { Plus } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import homegroundGif from '../assets/homeground.gif';
import { TODAY } from '../../utils/constants.js';
import { formatDateKey } from '../../utils/dateUtils.js';
import { WIDGET_ICON_MAP } from '../assets/widgetIcons.js';

const APP_WIDGETS = [
  {
    id: 'spotify',
    label: 'Spotify',
    accent: '#1DB954',
    bg: '#edfbf2',
    emoji: '🎵',
    notif: {
      title: 'New Release',
      body: 'Arctic Monkeys just dropped a new single — "Body Paint (Live)"',
      time: '12 min ago',
    },
    stats: [
      { label: 'Listening', value: '2h 13m' },
      { label: 'Liked', value: '847' },
    ],
  },
  {
    id: 'carousell',
    label: 'Carousell',
    accent: '#EE3D3D',
    bg: '#fff0f0',
    emoji: '🏷️',
    notif: {
      title: 'Sold Out',
      body: 'The Nike Dunk Low you saved was just purchased by someone else',
      time: '3 min ago',
    },
    stats: [
      { label: 'Listings', value: '5' },
      { label: 'Offers', value: '3 new' },
    ],
  },
  {
    id: 'lms',
    label: 'LMS',
    accent: '#5B8DEE',
    bg: '#eef3ff',
    emoji: '📚',
    notif: {
      title: 'New Activity',
      body: 'Linear Algebra — Problem Set 4 was just posted. Due Apr 12.',
      time: 'Just now',
    },
    stats: [
      { label: 'Pending', value: '3' },
      { label: 'This week', value: '2 due' },
    ],
  },
];

export default function HomeScreen({ tasks, openChatModal }) {
  const todayTasks = tasks[formatDateKey(TODAY.y, TODAY.m, TODAY.d)] || [];

  return (
    <>
      <TopBar/>
      <div className="scroll-content">
        <div className="home-wrap">

          {/* Hero section */}
          <div className="home-hero-section" style={{ backgroundImage: `url(${homegroundGif})`, backgroundSize: 'cover', backgroundPosition: 'center bottom' }}>

          </div>

          {/* Main content cards */}
          <div className="home-cards-section">

            {/* App widgets row */}
            <div className="home-widgets-scroll">
              {APP_WIDGETS.map((w) => (
                <button
                  key={w.id}
                  className="app-widget-card"
                  style={{ '--widget-accent': w.accent, '--widget-bg': w.bg }}
                  onClick={openChatModal}
                >
                  {/* Header: emoji + app name + live dot */}
                  <div className="app-widget-header" style={{ justifyContent: 'space-between' }}>
                    {WIDGET_ICON_MAP[w.id] ? (
                      <img src={WIDGET_ICON_MAP[w.id]} alt={w.label} style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.32))' }} />
                    ) : (
                      <span className="app-widget-emoji">{w.emoji}</span>
                    )}
                    <span className="app-widget-live-dot" style={{ background: w.accent, marginLeft: 'auto', alignSelf: 'flex-start' }} />
                  </div>

                  {/* Notification alert */}
                  <div className="app-widget-notif">
                    <span className="app-widget-notif-title" style={{ color: 'rgba(255,255,255,0.92)' }}>{w.notif.title}</span>
                    <span className="app-widget-notif-body" style={{ color: '#fff' }}>{w.notif.body}</span>
                    <span className="app-widget-notif-time" style={{ color: 'rgba(255,255,255,0.7)' }}>{w.notif.time}</span>
                  </div>

                  {/* Quick stats */}
                  <div className="app-widget-stats">
                    {w.stats.map((s, i) => (
                      <div key={i} className="app-widget-stat">
                        <span className="app-widget-stat-value" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>{s.value}</span>
                        <span className="app-widget-stat-label" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}

              {/* Add widget card */}
              <button className="app-widget-card app-widget-add">
                <Plus size={28} strokeWidth={1.5} />
                <span>Add Widget</span>
              </button>
            </div>

            {/* Tasks Preview */}
            {todayTasks.length > 0 && (
              <div className="home-tasks-preview">
                <div className="preview-title">Your Tasks</div>
                <div className="preview-list">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="preview-task-item">
                      <div
                        className="preview-task-dot"
                        style={{ backgroundColor: task.color || '#FF7B20' }}
                      />
                      <div className="preview-task-info">
                        <div className="preview-task-title">{task.title}</div>
                        {task.time && <div className="preview-task-time">{task.time}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="home-section-title" />

          </div>
        </div>
      </div>
    </>
  );
}

