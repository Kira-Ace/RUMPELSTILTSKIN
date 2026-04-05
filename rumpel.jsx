import { useState, useEffect, useRef } from "react";
import {
  Home, CalendarDays, NotebookText, Settings, Zap,
  ChevronLeft, ChevronRight, Plus, Bell, Moon, Volume2,
  BookOpen, Shield, Send, LogOut, Search, Timer,
  BookMarked, Edit3, Hash, Flame, CheckCircle2,
} from "lucide-react";

// ── CSS ───────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Noto+Serif:wght@400;600;700&family=Work+Sans:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #111; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Noto Serif', serif; }

    :root {
      --bg:          #fff8f5;
      --bg-dim:      #ffeadd;
      --bg-low:      #fff1e9;
      --surface:     #ffdbc8;
      --surface-hi:  #ffe3d1;
      --surface-hhi: #fcddc9;
      --orange:      #994700;
      --orange-m:    #f47b20;
      --orange-l:    #ffb68b;
      --yellow:      #fdcf49;
      --yellow-d:    #755b00;
      --brown:       #28180c;
      --brown-m:     #574237;
      --outline:     #8b7265;
      --outline-v:   #dec1b1;
    }

    .phone {
      width: 390px; height: 844px; border-radius: 48px;
      overflow: hidden; position: relative;
      box-shadow: 0 40px 80px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.06);
      background: var(--bg);
    }

    /* ── SCREENS ── */
    .screen { position: absolute; inset: 0; display: flex; flex-direction: column; transition: opacity 0.3s ease, transform 0.3s ease; }
    .screen.hidden { opacity: 0; pointer-events: none; transform: translateY(10px); }

    /* ── SPLASH ── */
    .splash { background: var(--orange-m); justify-content: center; align-items: center; }
    .splash-inner { display: flex; flex-direction: column; align-items: center; gap: 18px; animation: sIn 0.7s ease both; }
    @keyframes sIn { from { opacity:0; transform:scale(.88) translateY(16px); } to { opacity:1; transform:none; } }
    .splash-logo { width:96px; height:96px; border-radius:50%; background:var(--brown); display:flex; align-items:center; justify-content:center; }
    .splash-excl { font-family:'Newsreader',serif; font-size:52px; font-weight:700; color:var(--orange-m); line-height:1; }
    .splash-name { font-family:'Newsreader',serif; font-style:italic; font-size:48px; font-weight:700; color:var(--bg); }

    /* ── TOP BAR ── */
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:18px 20px 10px; flex-shrink:0; background:var(--bg); }
    .topbar-left { display:flex; align-items:center; gap:10px; }
    .topbar-logo { width:38px; height:38px; border-radius:50%; background:var(--orange); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .topbar-logo span { font-family:'Newsreader',serif; font-size:20px; font-weight:700; color:white; line-height:1; }
    .topbar-wordmark { font-family:'Newsreader',serif; font-size:22px; font-weight:700; color:var(--orange); letter-spacing:-.3px; }
    .topbar-right { display:flex; align-items:center; gap:10px; }
    .topbar-icon { width:36px; height:36px; border-radius:50%; background:transparent; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--brown-m); transition:background .15s; }
    .topbar-icon:hover { background:var(--bg-dim); }
    .topbar-avatar { width:36px; height:36px; border-radius:50%; background:var(--surface-hhi); display:flex; align-items:center; justify-content:center; overflow:hidden; border:2px solid var(--outline-v); }

    /* ── SCROLLABLE CONTENT ── */
    .scroll-content { flex:1; overflow-y:auto; }
    .scroll-content::-webkit-scrollbar { display:none; }

    /* ── HOME SCREEN ── */
    .home-wrap { padding:0 20px 100px; display:flex; flex-direction:column; gap:0; }
    .home-alert-badge { display:flex; align-items:center; gap:6px; margin-bottom:10px; }
    .home-alert-dot { width:18px; height:18px; border-radius:50%; border:1.5px solid var(--orange-m); display:flex; align-items:center; justify-content:center; }
    .home-alert-dot span { font-size:9px; font-weight:900; color:var(--orange-m); }
    .home-alert-text { font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--orange-m); }
    .home-headline { font-family:'Newsreader',serif; font-style:italic; font-size:46px; font-weight:700; color:var(--brown); line-height:1.05; letter-spacing:-.5px; margin-bottom:28px; }
    .focus-card { background:var(--orange-m); border-radius:20px; padding:24px; margin-bottom:20px; position:relative; overflow:hidden; }
    .focus-card::before { content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px; background:rgba(255,255,255,.07); border-radius:50%; pointer-events:none; }
    .focus-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
    .focus-title { font-family:'Newsreader',serif; font-style:italic; font-size:28px; font-weight:700; color:white; line-height:1.1; }
    .focus-badge { background:rgba(255,255,255,.18); border-radius:30px; padding:5px 12px; font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:rgba(255,255,255,.9); }
    .focus-task-row { background:rgba(255,255,255,.12); border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px; margin-bottom:10px; cursor:pointer; transition:background .2s; }
    .focus-task-row:last-of-type { margin-bottom:0; }
    .focus-task-row:hover { background:rgba(255,255,255,.2); }
    .focus-task-icon { width:32px; height:32px; flex-shrink:0; color:rgba(255,255,255,.7); display:flex; align-items:center; justify-content:center; }
    .focus-task-info { flex:1; }
    .focus-task-name { font-family:'Work Sans',sans-serif; font-size:15px; font-weight:600; color:white; }
    .focus-task-sub  { font-family:'Work Sans',sans-serif; font-size:11px; color:rgba(255,255,255,.6); margin-top:1px; }
    .focus-task-time { font-family:'Work Sans',sans-serif; font-size:12px; font-weight:700; color:rgba(255,255,255,.85); background:rgba(0,0,0,.15); padding:3px 9px; border-radius:6px; }
    .focus-cta { margin-top:20px; background:var(--brown); color:var(--bg); border:none; border-radius:12px; padding:13px 22px; font-family:'Work Sans',sans-serif; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; transition:transform .15s,opacity .15s; }
    .focus-cta:hover { opacity:.88; transform:scale(1.02); }
    .stats-row { display:grid; grid-template-columns:1fr; gap:14px; }
    .progress-card { background:var(--bg-low); border-radius:16px; padding:20px; position:relative; overflow:hidden; }
    .progress-label { font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--outline); margin-bottom:10px; }
    .progress-num { font-family:'Newsreader',serif; font-size:48px; font-weight:700; color:var(--brown); line-height:1; display:flex; align-items:flex-end; gap:4px; }
    .progress-pct { font-family:'Newsreader',serif; font-style:italic; font-size:28px; color:var(--orange); margin-bottom:4px; }
    .progress-bar-outer { height:8px; background:var(--surface); border-radius:4px; margin-top:14px; overflow:hidden; }
    .progress-bar-fill  { height:100%; background:var(--orange); border-radius:4px; transition:width 1s ease; }
    .mini-stats { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .mini-card { border-radius:16px; padding:18px 14px; display:flex; flex-direction:column; align-items:center; gap:6px; }
    .mini-card.yellow { background:var(--yellow); }
    .mini-card.peach  { background:var(--surface-hi); }
    .mini-card-num { font-family:'Newsreader',serif; font-size:38px; font-weight:700; color:var(--brown); line-height:1; }
    .mini-card-label { font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--brown-m); }
    .quote-section { border-top:1px solid var(--outline-v); margin-top:24px; padding-top:24px; }
    .quote-text { font-family:'Newsreader',serif; font-style:italic; font-size:22px; color:rgba(40,24,12,.75); line-height:1.55; }
    .quote-attr { font-family:'Work Sans',sans-serif; font-size:13px; font-weight:700; color:var(--orange); margin-top:12px; }

    /* ── CALENDAR SCREEN ── */
    .cal-wrap { padding:0 20px; display:flex; flex-direction:column; flex:1; overflow:hidden; }
    .cal-month-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; flex-shrink:0; }
    .cal-month-name { font-family:'Newsreader',serif; font-style:italic; font-size:52px; font-weight:700; color:var(--brown); line-height:1; }
    .cal-arrow { width:34px; height:34px; border-radius:50%; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--brown-m); transition:background .15s; }
    .cal-arrow:hover { background:var(--bg-dim); color:var(--orange); }
    .day-names-row { display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:4px; flex-shrink:0; }
    .day-name { text-align:center; font-family:'Work Sans',sans-serif; font-size:11px; font-weight:600; color:var(--outline); letter-spacing:.3px; }
    .day-name.active-col { font-weight:700; color:var(--orange); }
    @keyframes calR { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:none} }
    @keyframes calL { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:none} }
    .anim-r { animation:calR .24s ease both; }
    .anim-l { animation:calL .24s ease both; }
    .day-cell { display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:2px 0; }
    .day-num { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Newsreader',serif; font-size:16px; font-weight:600; transition:background .18s,color .18s; }
    .day-num.sel { background:var(--orange-m); color:white; }
    .day-num.today:not(.sel) { color:var(--orange); font-weight:700; }
    .day-num.muted { color:rgba(87,66,55,.3); }
    .day-dots { display:flex; gap:2.5px; height:5px; align-items:center; }
    .day-dot { width:3.5px; height:3.5px; border-radius:50%; background:var(--orange-m); }
    .day-dot.sel { background:rgba(255,255,255,.7); }
    /* divider pill */
    .cal-divider { position:relative; height:30px; display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer; touch-action:none; user-select:none; }
    .cal-divider-line { position:absolute; left:0; right:0; top:50%; height:1.5px; background:var(--outline-v); transform:translateY(-50%); }
    .cal-pill { position:relative; z-index:2; background:var(--bg); border:1.5px solid var(--outline-v); border-radius:20px; width:50px; height:20px; display:flex; align-items:center; justify-content:center; transition:transform .35s,border-color .2s; }
    .cal-pill:hover { border-color:var(--orange-m); }
    .cal-pill svg { color:var(--outline); width:12px; height:12px; transition:color .2s; }
    .cal-pill:hover svg { color:var(--orange-m); }
    /* date header */
    .sel-date-header { display:flex; align-items:flex-end; justify-content:space-between; padding:10px 0 8px; flex-shrink:0; }
    .sel-date-left { display:flex; align-items:baseline; gap:8px; }
    .sel-day-num { font-family:'Newsreader',serif; font-size:48px; font-weight:700; color:var(--brown); line-height:1; }
    .sel-day-name { font-family:'Newsreader',serif; font-style:italic; font-size:22px; color:var(--brown-m); }
    .sel-date-right { text-align:right; }
    .sel-today-badge { background:var(--yellow); color:var(--brown); font-family:'Work Sans',sans-serif; font-size:12px; font-weight:700; padding:4px 12px; border-radius:20px; }
    .sel-task-count { font-family:'Work Sans',sans-serif; font-size:11px; color:var(--outline); margin-top:2px; }
    /* task cards */
    .task-card { background:var(--bg-low); border-radius:16px; padding:16px 18px; margin-bottom:10px; cursor:pointer; transition:transform .15s,box-shadow .15s; flex-shrink:0; }
    .task-card:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(40,24,12,.08); }
    .task-card.accent { background:var(--yellow); }
    .task-time { font-family:'Work Sans',sans-serif; font-size:13px; font-weight:700; color:var(--orange); margin-bottom:4px; display:flex; align-items:center; justify-content:space-between; }
    .task-title { font-family:'Newsreader',serif; font-size:18px; font-weight:700; color:var(--brown); margin-bottom:4px; }
    .task-card.accent .task-title { color:var(--brown); }
    .task-desc { font-family:'Noto Serif',serif; font-size:13px; color:var(--brown-m); line-height:1.5; }
    .task-footer { display:flex; align-items:center; gap:6px; margin-top:8px; }
    .task-tag-badge { font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; background:rgba(153,71,0,.12); color:var(--orange); }
    .task-card.accent .task-tag-badge { background:rgba(0,0,0,.1); color:var(--brown); }
    .add-task-btn { border:1.5px dashed var(--outline-v); border-radius:16px; padding:14px; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; color:var(--outline); font-family:'Work Sans',sans-serif; font-size:14px; font-weight:600; background:transparent; transition:border-color .2s,color .2s; flex-shrink:0; margin-bottom:10px; width:100%; }
    .add-task-btn:hover { border-color:var(--orange-m); color:var(--orange-m); }
    .tasks-scroll { flex:1; overflow-y:auto; padding-bottom:80px; }
    .tasks-scroll::-webkit-scrollbar { display:none; }

    /* ── NOTES SCREEN ── */
    .notes-wrap { padding:0 20px 100px; display:flex; flex-direction:column; gap:14px; }
    .section-title { font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; color:var(--outline); margin-top:4px; }
    .note-featured { background:var(--orange-m); border-radius:20px; padding:22px; cursor:pointer; transition:transform .15s; }
    .note-featured:hover { transform:translateY(-2px); }
    .note-featured-title { font-family:'Newsreader',serif; font-size:20px; font-weight:700; color:white; margin-bottom:6px; }
    .note-featured-preview { font-family:'Noto Serif',serif; font-size:12px; color:rgba(255,255,255,.7); line-height:1.55; }
    .note-featured-date { font-family:'Work Sans',sans-serif; font-size:10px; color:rgba(255,255,255,.45); margin-top:10px; font-weight:600; letter-spacing:.5px; }
    .notes-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .note-mini { background:var(--bg-low); border-radius:16px; padding:16px; cursor:pointer; border:1.5px solid transparent; transition:border-color .2s,transform .15s; }
    .note-mini:hover { border-color:var(--orange-m); transform:translateY(-1px); }
    .note-mini-title { font-family:'Newsreader',serif; font-size:15px; font-weight:700; color:var(--brown); margin-bottom:4px; }
    .note-mini-preview { font-size:11px; color:var(--brown-m); font-family:'Noto Serif',serif; line-height:1.45; }
    .note-mini-date { font-family:'Work Sans',sans-serif; font-size:10px; color:var(--outline); margin-top:8px; font-weight:600; }

    /* ── SETTINGS SCREEN ── */
    .settings-wrap { padding:0 20px 100px; display:flex; flex-direction:column; gap:0; }
    .profile-card { background:var(--bg-low); border-radius:20px; padding:28px 20px; display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:24px; position:relative; }
    .profile-avatar-wrap { position:relative; margin-bottom:14px; }
    .profile-avatar { width:80px; height:80px; border-radius:50%; background:var(--surface-hhi); border:3px solid var(--yellow); display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .profile-edit-btn { position:absolute; bottom:0; right:-4px; width:26px; height:26px; border-radius:50%; background:var(--orange-m); border:2px solid var(--bg); display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .profile-name { font-family:'Newsreader',serif; font-size:22px; font-weight:700; color:var(--orange); margin-bottom:4px; }
    .profile-role { font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--brown-m); margin-bottom:10px; }
    .profile-bio { font-family:'Noto Serif',serif; font-size:13px; color:var(--brown-m); line-height:1.55; }
    .settings-section-label { font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; color:var(--outline); margin-bottom:10px; margin-top:4px; }
    .settings-list { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
    .settings-row { background:white; border-radius:14px; padding:14px 16px; display:flex; align-items:center; gap:14px; }
    .settings-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .settings-row-info { flex:1; }
    .settings-row-title { font-family:'Work Sans',sans-serif; font-size:15px; font-weight:700; color:var(--brown); }
    .settings-row-sub { font-family:'Noto Serif',serif; font-size:12px; color:var(--brown-m); margin-top:1px; }
    /* toggle */
    .toggle { width:48px; height:28px; border-radius:14px; position:relative; cursor:pointer; flex-shrink:0; transition:background .25s; }
    .toggle.on  { background:var(--yellow); }
    .toggle.off { background:var(--surface-hhi); }
    .toggle-knob { position:absolute; top:3px; width:22px; height:22px; border-radius:50%; background:white; transition:left .25s; box-shadow:0 1px 4px rgba(0,0,0,.2); display:flex; align-items:center; justify-content:center; }
    .toggle.on  .toggle-knob { left:23px; }
    .toggle.off .toggle-knob { left:3px; }
    .check-icon { color:var(--yellow-d); }
    /* nav rows */
    .nav-row { background:var(--bg-low); border-radius:14px; padding:14px 16px; display:flex; align-items:center; gap:14px; cursor:pointer; transition:background .15s; }
    .nav-row:hover { background:var(--surface); }
    .nav-row-icon { width:36px; height:36px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--orange); }
    .nav-row-title { font-family:'Newsreader',serif; font-style:italic; font-size:17px; color:var(--brown); flex:1; }
    .nav-row-danger .nav-row-title { color:#ba1a1a; font-style:italic; }
    .nav-row-danger { border:1.5px dashed rgba(186,26,26,.25); }
    .nav-row-arrow { color:var(--outline); }
    .settings-version { text-align:center; font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--outline); padding:20px 0 10px; }

    /* ── BOTTOM NAV ── */
    .bottom-nav {
      position:absolute; bottom:0; left:0; right:0;
      height:78px; padding:8px 16px 20px;
      display:flex; align-items:center; gap:10px;
      background:rgba(255,248,245,.88);
      backdrop-filter:blur(16px);
      border-top:1px solid var(--outline-v);
      box-shadow:0 -6px 24px rgba(40,24,12,.06);
      border-radius:0 0 48px 48px;
      z-index:20;
    }
    .nav-tabs { flex:1; background:transparent; display:flex; align-items:center; justify-content:space-around; }
    .nav-tab { display:flex; flex-direction:column; align-items:center; gap:2px; cursor:pointer; padding:6px 10px; border-radius:12px; transition:background .15s; border:none; background:transparent; }
    .nav-tab.active { background:var(--yellow); }
    .nav-tab-icon { color:rgba(40,24,12,.4); }
    .nav-tab.active .nav-tab-icon { color:var(--brown); }
    .nav-tab-label { font-family:'Noto Serif',serif; font-size:9px; text-transform:uppercase; letter-spacing:1px; color:rgba(40,24,12,.4); }
    .nav-tab.active .nav-tab-label { color:var(--brown); font-weight:700; }
    /* FAB */
    .nav-fab-wrap { position:relative; flex-shrink:0; }
    .nav-fab { width:52px; height:52px; background:var(--orange); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; border:none; box-shadow:0 4px 16px rgba(153,71,0,.4); transition:transform .2s,box-shadow .2s; position:relative; z-index:2; }
    .nav-fab:hover { transform:scale(1.08); box-shadow:0 6px 22px rgba(153,71,0,.55); }
    .fab-chat { position:absolute; bottom:calc(100% + 12px); right:0; width:238px; background:white; border-radius:18px 18px 4px 18px; padding:12px 14px; box-shadow:0 8px 32px rgba(40,24,12,.18); display:flex; flex-direction:column; gap:8px; opacity:0; pointer-events:none; transform:translateY(6px) scale(.97); transition:opacity .2s,transform .2s; z-index:30; }
    .nav-fab-wrap:hover .fab-chat, .fab-chat:focus-within { opacity:1; pointer-events:auto; transform:none; }
    .fab-chat-reply { font-size:12px; color:var(--brown-m); font-family:'Noto Serif',serif; line-height:1.5; }
    .fab-chat-row { display:flex; gap:6px; align-items:center; }
    .fab-input { flex:1; border:1.5px solid var(--outline-v); border-radius:20px; padding:7px 12px; font-size:13px; font-family:'Noto Serif',serif; color:var(--brown); outline:none; background:var(--bg-low); }
    .fab-input:focus { border-color:var(--orange-m); }
    .fab-send { width:30px; height:30px; flex-shrink:0; background:var(--orange); border-radius:50%; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; color:white; }

    /* ── MODAL ── */
    .modal-overlay { position:absolute; inset:0; background:rgba(40,24,12,.45); z-index:50; display:flex; align-items:flex-end; animation:fadeIn .2s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .modal-sheet { background:var(--bg); border-radius:26px 26px 0 0; padding:22px 20px 34px; width:100%; animation:sheetUp .3s ease; display:flex; flex-direction:column; gap:12px; }
    @keyframes sheetUp { from{transform:translateY(100%)} to{transform:none} }
    .modal-handle { width:36px; height:4px; background:var(--outline-v); border-radius:2px; align-self:center; margin-bottom:2px; }
    .modal-title { font-family:'Newsreader',serif; font-style:italic; font-size:20px; font-weight:700; color:var(--brown); }
    .modal-input { border:1.5px solid var(--outline-v); border-radius:12px; padding:11px 14px; font-size:14px; font-family:'Noto Serif',serif; color:var(--brown); background:white; outline:none; width:100%; }
    .modal-input:focus { border-color:var(--orange-m); }
    .modal-btns { display:flex; gap:10px; }
    .modal-btn { flex:1; padding:12px; border-radius:12px; font-family:'Work Sans',sans-serif; font-size:14px; font-weight:700; cursor:pointer; border:none; transition:transform .12s; }
    .modal-btn:hover { transform:scale(.98); }
    .modal-btn.primary { background:var(--orange); color:white; }
    .modal-btn.secondary { background:var(--surface-hi); color:var(--brown); }
  `}</style>
);

// ── DATE UTILITIES ────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TODAY  = { y:2026, m:3, d:1 }; // April 1 2026 (month 0-indexed)
const dk = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const daysInMonth = (y,m) => new Date(y,m+1,0).getDate();

function buildMonthGrid(y,m) {
  const offset = (new Date(y,m,1).getDay()+6)%7;
  const total  = daysInMonth(y,m);
  const prev   = daysInMonth(m===0?y-1:y, m===0?11:m-1);
  const cells  = [];
  for(let i=0;i<offset;i++) cells.push({d:prev-(offset-1-i),m:m===0?11:m-1,y:m===0?y-1:y,type:"prev"});
  for(let d=1;d<=total;d++) cells.push({d,m,y,type:"current"});
  let nd=1;
  while(cells.length%7!==0) cells.push({d:nd++,m:m===11?0:m+1,y:m===11?y+1:y,type:"next"});
  return cells;
}
function getWeekCells(y,m,d) {
  const g=buildMonthGrid(y,m), idx=g.findIndex(c=>c.type==="current"&&c.d===d);
  return g.slice(Math.floor((idx<0?0:idx)/7)*7, Math.floor((idx<0?0:idx)/7)*7+7);
}
function addDays({y,m,d},n) {
  const dt=new Date(y,m,d+n);
  return {y:dt.getFullYear(),m:dt.getMonth(),d:dt.getDate()};
}
function dowName({y,m,d}) { return DAYS[(new Date(y,m,d).getDay()+6)%7]; }
function selDow({y,m,d})  { return (new Date(y,m,d).getDay()+6)%7; }

// ── TASKS & NOTES ────────────────────────────────────────────
const initialTasks = {
  [dk(2026,3,1)]:  [{id:1,title:"Physics Review",time:"12:30",desc:"Focus on thermodynamics and fluid dynamics.",tag:"Science"},{id:2,title:"Essay Draft",time:"15:00",desc:"Finalizing the introduction for the lit review.",tag:"English",accent:true}],
  [dk(2026,2,31)]: [{id:3,title:"Math Problem Set",time:"18:00",desc:"Linear Algebra III — chapter exercises.",tag:"Math"}],
  [dk(2026,2,30)]: [{id:5,title:"Chemistry Lab",time:"09:00",desc:"Titration results and analysis.",tag:"Science"},{id:6,title:"Vocab Quiz Prep",time:"16:00",desc:"Unit 5 — 30 words.",tag:"English"},{id:7,title:"Group Meeting",time:"18:30",desc:"Project sync.",tag:"Other"}],
  [dk(2026,3,7)]:  [{id:8,title:"History Essay",time:"10:00",desc:"French Revolution causes and effects.",tag:"History"}],
  [dk(2026,3,14)]: [{id:9,title:"Mid-term Review",time:"09:00",desc:"Chapters 1–8 comprehensive review.",tag:"Science"},{id:10,title:"Library Session",time:"14:00",desc:"Research for comparative lit essay.",tag:"English"}],
  [dk(2026,4,5)]:  [{id:11,title:"Calc Problem Set",time:"11:00",desc:"Differential equations, problem set 3.",tag:"Math"}],
};
const NOTES = [
  {id:1,title:"Physics Formulas",preview:"F = ma, v² = u² + 2as, s = ut + ½at²...",date:"Apr 1",featured:true},
  {id:2,title:"Essay Outline",preview:"Thesis: The industrial revolution fundamentally altered...",date:"Mar 31"},
  {id:3,title:"Vocab List",preview:"Ephemeral, ubiquitous, pernicious...",date:"Mar 30"},
  {id:4,title:"Study Schedule",preview:"Mon–Wed: Science. Thu–Fri: Humanities.",date:"Mar 29"},
  {id:5,title:"Math Shortcuts",preview:"Integration tricks & common integrals",date:"Mar 28"},
];

// ── TOPBAR ───────────────────────────────────────────────────
function TopBar({ extra }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo"><span>!</span></div>
        <span className="topbar-wordmark">Rumpel</span>
      </div>
      <div className="topbar-right">
        {extra}
        <button className="topbar-icon"><Search size={18}/></button>
        <div className="topbar-avatar">
          <span style={{fontSize:16,color:"var(--brown-m)"}}>!</span>
        </div>
      </div>
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────
function BottomNav({ active, setActive }) {
  const tabs = [{id:"home",Icon:Home,label:"Home"},{id:"calendar",Icon:CalendarDays,label:"Cal"},{id:"notes",Icon:NotebookText,label:"Notes"},{id:"settings",Icon:Settings,label:"Settings"}];
  const [msg,setMsg]=useState(""); const [reply,setReply]=useState("");
  const send=()=>{
    if(!msg.trim())return;
    const r=["Got it! Added to your schedule.","Great idea! Reminder set?","Done! You've got this 🎯","Added to your study list."];
    setReply(r[Math.floor(Math.random()*r.length)]); setMsg(""); setTimeout(()=>setReply(""),3500);
  };
  return (
    <div className="bottom-nav">
      <div className="nav-tabs">
        {tabs.map(({id,Icon,label})=>(
          <button key={id} className={`nav-tab ${active===id?"active":""}`} onClick={()=>setActive(id)}>
            <Icon size={20} className="nav-tab-icon"/>
            <span className="nav-tab-label">{label}</span>
          </button>
        ))}
      </div>
      <div className="nav-fab-wrap">
        <div className="fab-chat">
          {reply && <div className="fab-chat-reply">🧙 {reply}</div>}
          <div className="fab-chat-row">
            <input className="fab-input" placeholder="Ask Rumpel…" value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
            <button className="fab-send" onClick={send}><Zap size={13} fill="white"/></button>
          </div>
        </div>
        <button className="nav-fab"><Zap size={22} fill="white"/></button>
      </div>
    </div>
  );
}

// ── HOME SCREEN ───────────────────────────────────────────────
function HomeScreen({ tasks }) {
  const todayTasks = tasks[dk(TODAY.y,TODAY.m,TODAY.d)]||[];
  const taskIcons = [BookMarked, Edit3, Hash];
  return (
    <>
      <TopBar/>
      <div className="scroll-content">
        <div className="home-wrap">
          <div className="home-alert-badge">
            <div className="home-alert-dot"><span>!</span></div>
            <span className="home-alert-text">System Alert</span>
          </div>
          <h1 className="home-headline">What's kirking,<br/>User?</h1>

          {/* Today's Focus card */}
          <div className="focus-card">
            <div className="focus-header">
              <div className="focus-title">Today's<br/>Focus</div>
              <span className="focus-badge">Active Session</span>
            </div>
            {todayTasks.length===0 && (
              <div style={{color:"rgba(255,255,255,.6)",fontFamily:"'Noto Serif',serif",fontSize:13,padding:"8px 0"}}>No tasks today — enjoy the break! 🌿</div>
            )}
            {todayTasks.map((t,i)=>{
              const Icon = taskIcons[i%taskIcons.length];
              return (
                <div key={t.id} className="focus-task-row">
                  <div className="focus-task-icon"><Icon size={18}/></div>
                  <div className="focus-task-info">
                    <div className="focus-task-name">{t.title}</div>
                    <div className="focus-task-sub">{t.desc}</div>
                  </div>
                  <span className="focus-task-time">{t.time}</span>
                </div>
              );
            })}
            <button className="focus-cta"><Timer size={16}/> Start Focus Timer</button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="progress-card">
              <div className="progress-label">Weekly Progress</div>
              <div className="progress-num">68 <span className="progress-pct">%</span></div>
              <div className="progress-bar-outer"><div className="progress-bar-fill" style={{width:"68%"}}/></div>
            </div>
            <div className="mini-stats">
              <div className="mini-card yellow">
                <CheckCircle2 size={22} style={{color:"var(--yellow-d)"}}/>
                <div className="mini-card-num">{todayTasks.length}</div>
                <div className="mini-card-label">Today</div>
              </div>
              <div className="mini-card peach">
                <Flame size={22} style={{color:"var(--orange)"}}/>
                <div className="mini-card-num">5</div>
                <div className="mini-card-label">Streak</div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="quote-section">
            <p className="quote-text">"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."</p>
            <p className="quote-attr">— Brian Herbert</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── CALENDAR SCREEN ───────────────────────────────────────────
function CalendarScreen({ tasks, setTasks }) {
  const [sel,setSel]         = useState({...TODAY});
  const [view,setView]       = useState({y:TODAY.y,m:TODAY.m});
  const [expanded,setExpanded] = useState(false);
  const [showModal,setShowModal] = useState(false);
  const [newTask,setNewTask]   = useState({title:"",time:"",desc:"",tag:"Other"});
  const [pillY,setPillY]       = useState(null);
  const [pillDelta,setPillDelta] = useState(0);
  const swipeX = useRef(null);
  const [anim,setAnim]         = useState("");
  const animT = useRef(null);

  const isPill = pillY!==null;
  const trigAnim = d => { clearTimeout(animT.current); setAnim(d>0?"anim-r":"anim-l"); animT.current=setTimeout(()=>setAnim(""),280); };

  const navigate = dir => {
    trigAnim(dir);
    if(expanded){
      let nm=view.m+dir,ny=view.y;
      if(nm<0){nm=11;ny--;} if(nm>11){nm=0;ny++;}
      setView({y:ny,m:nm});
    } else {
      const n=addDays(sel,dir*7); setSel(n); setView({y:n.y,m:n.m});
    }
  };
  useEffect(()=>{ if(expanded) setView({y:sel.y,m:sel.m}); },[expanded]);

  const taskKey  = dk(sel.y,sel.m,sel.d);
  const selTasks = tasks[taskKey]||[];
  const addTask  = () => {
    if(!newTask.title)return;
    setTasks(p=>({...p,[taskKey]:[...(p[taskKey]||[]),{...newTask,id:Date.now()}]}));
    setNewTask({title:"",time:"",desc:"",tag:"Other"}); setShowModal(false);
  };

  const grid = buildMonthGrid(view.y,view.m);
  const rows = []; for(let r=0;r<grid.length/7;r++) rows.push(grid.slice(r*7,r*7+7));
  const weekCells = getWeekCells(sel.y,sel.m,sel.d);
  const selDowIdx = selDow(sel); // 0=Mon

  const CELL=36,HDR=18,GAP=5;
  const expH  = HDR+GAP+rows.length*(CELL+GAP)+4;
  const colH  = HDR+GAP+CELL+6;
  const liveH = expanded?expH : isPill?Math.min(expH,colH+Math.max(0,pillDelta)):colH;
  const prog  = Math.min(1,Math.max(0,(liveH-colH)/(expH-colH)));

  function DayCell({cell}) {
    const cur = cell.type==="current";
    const isSel = cur&&cell.d===sel.d&&cell.m===sel.m&&cell.y===sel.y;
    const isTod = cur&&cell.d===TODAY.d&&cell.m===TODAY.m&&cell.y===TODAY.y;
    const ck = dk(cell.y,cell.m,cell.d);
    const dots = cur&&(tasks[ck]||[]).length>0;
    return (
      <div className="day-cell" onClick={()=>{
        if(!cur){trigAnim(cell.type==="next"?1:-1);setSel({y:cell.y,m:cell.m,d:cell.d});setView({y:cell.y,m:cell.m});if(expanded)setExpanded(false);return;}
        setSel({y:cell.y,m:cell.m,d:cell.d}); if(expanded)setExpanded(false);
      }}>
        <div className={`day-num ${isSel?"sel":""} ${isTod&&!isSel?"today":""} ${!cur?"muted":""}`} style={{fontSize:15}}>{cell.d}</div>
        <div className="day-dots">
          {dots && Array.from({length:Math.min((tasks[ck]||[]).length,3)}).map((_,i)=>(
            <div key={i} className={`day-dot ${isSel?"sel":""}`}/>
          ))}
        </div>
      </div>
    );
  }

  const isToday = sel.d===TODAY.d&&sel.m===TODAY.m&&sel.y===TODAY.y;

  return (
    <>
      <TopBar/>
      <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",padding:"0 20px"}}>

        {/* Month + arrows */}
        <div className="cal-month-row">
          <button className="cal-arrow" onClick={()=>navigate(-1)}><ChevronLeft size={18}/></button>
          <div className={`cal-month-name ${anim}`} key={`${view.y}-${view.m}`}>{MONTHS[expanded?view.m:sel.m]}</div>
          <button className="cal-arrow" onClick={()=>navigate(1)}><ChevronRight size={18}/></button>
        </div>

        {/* Day names */}
        <div className="day-names-row" style={{height:HDR,alignItems:"center",marginBottom:GAP}}>
          {DAYS.map((d,i)=>(
            <div key={d} className={`day-name ${!expanded&&i===selDowIdx?"active-col":""}`}>{d}</div>
          ))}
        </div>

        {/* Grid (animated height) */}
        <div
          style={{height:liveH,overflow:"hidden",flexShrink:0,transition:isPill?"none":"height .36s cubic-bezier(.4,0,.2,1)",userSelect:"none"}}
          onMouseDown={e=>{ swipeX.current=e.clientX; }}
          onMouseUp={e=>{ if(swipeX.current!==null){const d=e.clientX-swipeX.current; if(Math.abs(d)>32)navigate(d>0?-1:1); swipeX.current=null;} }}
          onMouseLeave={()=>{ swipeX.current=null; }}
          onTouchStart={e=>{ swipeX.current=e.touches[0].clientX; }}
          onTouchEnd={e=>{ if(swipeX.current!==null){const d=e.changedTouches[0].clientX-swipeX.current; if(Math.abs(d)>32)navigate(d>0?-1:1); swipeX.current=null;} }}
        >
          <div className={anim} key={`${view.y}-${view.m}-${expanded?1:0}`}>
            {/* collapsed week */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",justifyItems:"center",opacity:1-prog,pointerEvents:prog>.5?"none":"auto",transition:isPill?"none":"opacity .18s"}}>
              {weekCells.map((c,i)=><DayCell key={i} cell={c}/>)}
            </div>
            {/* expanded month */}
            <div style={{marginTop:-(1-prog)*(CELL+GAP),opacity:prog,pointerEvents:prog<.5?"none":"auto",transition:isPill?"none":"opacity .18s,margin-top .36s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column",gap:GAP}}>
              {rows.map((row,ri)=>(
                <div key={ri} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",justifyItems:"center"}}>
                  {row.map((c,ci)=><DayCell key={ci} cell={c}/>)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pill handle */}
        <div className="cal-divider"
          onMouseDown={e=>{setPillY(e.clientY);setPillDelta(0);}}
          onMouseMove={e=>{if(pillY!==null)setPillDelta(e.clientY-pillY);}}
          onMouseUp={()=>{if(pillDelta>44)setExpanded(true);if(pillDelta<-44)setExpanded(false);setPillY(null);setPillDelta(0);}}
          onMouseLeave={()=>{setPillY(null);setPillDelta(0);}}
          onTouchStart={e=>{setPillY(e.touches[0].clientY);setPillDelta(0);}}
          onTouchMove={e=>{if(pillY!==null)setPillDelta(e.touches[0].clientY-pillY);}}
          onTouchEnd={()=>{if(pillDelta>44)setExpanded(true);if(pillDelta<-44)setExpanded(false);setPillY(null);setPillDelta(0);}}
          onClick={()=>{ if(Math.abs(pillDelta)<5)setExpanded(v=>!v); }}
        >
          <div className="cal-divider-line"/>
          <div className="cal-pill" style={{transform:expanded?"rotate(180deg)":"none"}}>
            <ChevronLeft size={12} style={{transform:"rotate(-90deg)"}}/>
          </div>
        </div>

        {/* Selected date header */}
        <div className="sel-date-header">
          <div className="sel-date-left">
            <span className="sel-day-num">{sel.d}</span>
            <span className="sel-day-name">{dowName(sel)}</span>
          </div>
          <div className="sel-date-right">
            {isToday
              ? <span className="sel-today-badge">Today {selTasks.length} tasks</span>
              : <span className="sel-today-badge" style={{background:"var(--surface-hi)"}}>{MONTHS[sel.m].slice(0,3)} {sel.d}</span>}
          </div>
        </div>

        {/* Tasks */}
        <div className="tasks-scroll">
          {selTasks.map((t,i)=>(
            <div key={t.id} className={`task-card ${i===1?"accent":""}`}>
              <div className="task-time">
                <span>{t.time}</span>
                {i===1 && <Edit3 size={16} style={{color:"var(--brown-m)"}}/>}
                {i!==1 && <div style={{width:8,height:8,borderRadius:"50%",background:"var(--brown-m)",opacity:.4}}/>}
              </div>
              <div className="task-title">{t.title}</div>
              {t.desc && <div className="task-desc">{t.desc}</div>}
              <div className="task-footer"><span className="task-tag-badge">{t.tag}</span></div>
            </div>
          ))}
          <button className="add-task-btn" onClick={()=>setShowModal(true)}>
            <Plus size={15}/> Add task
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal-sheet">
            <div className="modal-handle"/>
            <div className="modal-title">New Task — {dowName(sel)} {MONTHS[sel.m].slice(0,3)} {sel.d}</div>
            <input className="modal-input" placeholder="Task title…"           value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))}/>
            <input className="modal-input" placeholder="Time (e.g. 14:00)"     value={newTask.time}  onChange={e=>setNewTask(p=>({...p,time:e.target.value}))}/>
            <input className="modal-input" placeholder="Description (optional)" value={newTask.desc}  onChange={e=>setNewTask(p=>({...p,desc:e.target.value}))}/>
            <select className="modal-input" value={newTask.tag} onChange={e=>setNewTask(p=>({...p,tag:e.target.value}))}>
              {["Math","Science","English","History","Other"].map(t=><option key={t}>{t}</option>)}
            </select>
            <div className="modal-btns">
              <button className="modal-btn secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="modal-btn primary"   onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── NOTES SCREEN ──────────────────────────────────────────────
function NotesScreen() {
  const featured = NOTES.find(n=>n.featured);
  const rest = NOTES.filter(n=>!n.featured);
  return (
    <>
      <TopBar extra={<button className="topbar-icon"><Plus size={18}/></button>}/>
      <div className="scroll-content">
        <div className="notes-wrap">
          <div className="section-title">Pinned</div>
          {featured && (
            <div className="note-featured">
              <div className="note-featured-title">{featured.title}</div>
              <div className="note-featured-preview">{featured.preview}</div>
              <div className="note-featured-date">{featured.date}</div>
            </div>
          )}
          <div className="section-title">Recent</div>
          <div className="notes-grid">
            {rest.map(n=>(
              <div key={n.id} className="note-mini">
                <div className="note-mini-title">{n.title}</div>
                <div className="note-mini-preview">{n.preview}</div>
                <div className="note-mini-date">{n.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── SETTINGS SCREEN ───────────────────────────────────────────
function Toggle({ on, toggle }) {
  return (
    <div className={`toggle ${on?"on":"off"}`} onClick={toggle}>
      <div className="toggle-knob">
        {on && <CheckCircle2 size={12} className="check-icon"/>}
      </div>
    </div>
  );
}

function SettingsScreen() {
  const [notifs,setNotifs] = useState(true);
  const [dark,setDark]     = useState(false);
  const [sounds,setSounds] = useState(true);

  const prefs = [
    { label:"Notifications", sub:"Scholarly alerts and reminders",       Icon:Bell,    val:notifs, set:setNotifs, bg:"#fff1e9", color:"var(--orange-m)" },
    { label:"Dark Mode",     sub:"Midnight study session aesthetics",     Icon:Moon,    val:dark,   set:setDark,   bg:"#fff1e9", color:"var(--orange-m)" },
    { label:"Sound Effects", sub:"Tactile quill and parchment cues",      Icon:Volume2, val:sounds, set:setSounds, bg:"#fff1e9", color:"var(--orange-m)" },
  ];
  const navItems = [
    { label:"About Rumpel",   Icon:BookOpen, danger:false },
    { label:"Privacy Policy", Icon:Shield,   danger:false },
    { label:"Send Feedback",  Icon:Send,     danger:false },
    { label:"Sign Out",       Icon:LogOut,   danger:true  },
  ];

  return (
    <>
      <TopBar/>
      <div className="scroll-content">
        <div className="settings-wrap">
          {/* Profile */}
          <div className="profile-card">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                <span style={{fontSize:32,color:"var(--brown-m)",opacity:.5}}>!</span>
              </div>
              <div className="profile-edit-btn"><Edit3 size={11} color="white"/></div>
            </div>
            <div className="profile-name">Julian Vane</div>
            <div className="profile-role">Senior Researcher · Polymath Level 4</div>
            <div className="profile-bio">Dedicated to the pursuit of knowledge and the organization of the mind's library.</div>
          </div>

          {/* General Preferences */}
          <div className="settings-section-label">General Preferences</div>
          <div className="settings-list">
            {prefs.map(({label,sub,Icon,val,set,bg,color})=>(
              <div key={label} className="settings-row">
                <div className="settings-icon" style={{background:bg}}><Icon size={18} style={{color}}/></div>
                <div className="settings-row-info">
                  <div className="settings-row-title">{label}</div>
                  <div className="settings-row-sub">{sub}</div>
                </div>
                <Toggle on={val} toggle={()=>set(v=>!v)}/>
              </div>
            ))}
          </div>

          {/* Archive & Identity */}
          <div className="settings-section-label">Archive &amp; Identity</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {navItems.map(({label,Icon,danger})=>(
              <div key={label} className={`nav-row ${danger?"nav-row-danger":""}`}>
                <div className="nav-row-icon"><Icon size={18}/></div>
                <span className="nav-row-title">{label}</span>
                <ChevronRight size={16} className="nav-row-arrow"/>
              </div>
            ))}
          </div>

          <div className="settings-version">Rumpel Manuscript V2.4.1</div>
        </div>
      </div>
    </>
  );
}

// ── SPLASH ────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,1800); return()=>clearTimeout(t); },[onDone]);
  return (
    <div className="screen splash">
      <div className="splash-inner">
        <div className="splash-logo"><span className="splash-excl">!</span></div>
        <div className="splash-name">Rumpel</div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────
export default function App() {
  const [done,  setDone]  = useState(false);
  const [tab,   setTab]   = useState("home");
  const [tasks, setTasks] = useState(initialTasks);

  return (
    <>
      <Styles/>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#111"}}>
        <div className="phone">
          {!done ? <SplashScreen onDone={()=>setDone(true)}/> : (
            <>
              <div className={`screen ${tab==="home"    ?"":"hidden"}`}><HomeScreen     tasks={tasks}/></div>
              <div className={`screen ${tab==="calendar"?"":"hidden"}`}><CalendarScreen tasks={tasks} setTasks={setTasks}/></div>
              <div className={`screen ${tab==="notes"   ?"":"hidden"}`}><NotesScreen/></div>
              <div className={`screen ${tab==="settings"?"":"hidden"}`}><SettingsScreen/></div>
              <BottomNav active={tab} setActive={setTab}/>
            </>
          )}
        </div>
      </div>
    </>
  );
}