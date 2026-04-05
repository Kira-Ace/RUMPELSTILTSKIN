import { BookMarked, Edit3, Hash, CheckCircle2, Flame, Timer } from 'lucide-react';
import { useState } from 'react';
import TopBar from '../common/TopBar.jsx';
import Greeting from '../common/Greeting.jsx';
import FocusTimer from '../common/FocusTimer.jsx';
import { TODAY, initialTasks } from '../../utils/constants.js';
import { formatDateKey } from '../../utils/dateUtils.js';

export default function HomeScreen({ tasks }) {
  const [showTimer, setShowTimer] = useState(false);
  const todayTasks = tasks[formatDateKey(TODAY.y, TODAY.m, TODAY.d)] || [];
  const taskIcons = [BookMarked, Edit3, Hash];

  return (
    <>
      <TopBar/>
      <FocusTimer isOpen={showTimer} onClose={() => setShowTimer(false)} />
      <div className="scroll-content">
        <div className="home-wrap">
          <Greeting userName="Rumpel" />

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
            <button className="focus-cta" onClick={() => setShowTimer(true)}><Timer size={16}/> Start Focus Timer</button>
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
