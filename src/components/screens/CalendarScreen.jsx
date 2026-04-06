import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit3, Trash2, Inbox, X, Calendar, Flag, ChevronDown, MoreVertical } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import { TODAY, MONTHS, DAYS } from '../../utils/constants.js';
import { 
  buildMonthGrid, 
  getWeekCells, 
  addDays, 
  dowName, 
  selDow, 
  formatDateKey 
} from '../../utils/dateUtils.js';

export default function CalendarScreen({ tasks, setTasks }) {
  const [sel, setSel] = useState({...TODAY});
  const [view, setView] = useState({y:TODAY.y, m:TODAY.m});
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTask, setNewTask] = useState({title:"", time:"", desc:"", tag:"Other"});
  const [selectedInbox, setSelectedInbox] = useState("Inbox");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [dateNameEdited, setDateNameEdited] = useState(false);
  const [editingDateName, setEditingDateName] = useState(false);
  const [customDateName, setCustomDateName] = useState("");
  const [pillY, setPillY] = useState(null);
  const [pillDelta, setPillDelta] = useState(0);
  const [anim, setAnim] = useState("");
  
  const swipeX = useRef(null);
  const animT = useRef(null);

  const isPill = pillY !== null;
  const trigAnim = d => { 
    clearTimeout(animT.current); 
    setAnim(d > 0 ? "anim-r" : "anim-l"); 
    animT.current = setTimeout(() => setAnim(""), 280); 
  };

  const navigate = dir => {
    trigAnim(dir);
    if(expanded){
      let nm = view.m + dir, ny = view.y;
      if(nm < 0){ nm = 11; ny--; } 
      if(nm > 11){ nm = 0; ny++; }
      setView({y:ny, m:nm});
    } else {
      const n = addDays(sel, dir * 7); 
      setSel(n); 
      setView({y:n.y, m:n.m});
    }
  };

  useEffect(() => { 
    if(expanded) setView({y:sel.y, m:sel.m}); 
  }, [expanded]);

  const taskKey = formatDateKey(sel.y, sel.m, sel.d);
  const selTasks = tasks[taskKey] || [];
  
  const addTask = () => {
    if(!newTask.title) return;
    
    if(editingId) {
      // Update existing task
      setTasks(p => ({
        ...p, 
        [taskKey]: p[taskKey].map(t => t.id === editingId ? {...newTask, id:editingId} : t)
      }));
      setEditingId(null);
    } else {
      // Add new task
      setTasks(p => ({
        ...p, 
        [taskKey]: [...(p[taskKey] || []), {...newTask, id:Date.now()}]
      }));
    }
    setNewTask({title:"", time:"", desc:"", tag:"Other"}); 
    setShowModal(false);
  };

  const deleteTask = (taskId) => {
    setTasks(p => ({
      ...p,
      [taskKey]: p[taskKey].filter(t => t.id !== taskId)
    }));
  };

  const startEdit = (task) => {
    setNewTask(task);
    setEditingId(task.id);
    setShowModal(true);
  };

  const grid = buildMonthGrid(view.y, view.m);
  // Pad grid to always have 6 rows (42 cells)
  while(grid.length < 42) {
    const lastCell = grid[grid.length - 1];
    const nextDay = addDays(lastCell, 1);
    grid.push({...nextDay, type: "next"});
  }
  const rows = [];
  for(let r = 0; r < grid.length / 7; r++) {
    rows.push(grid.slice(r * 7, r * 7 + 7));
  }
  
  const weekCells = getWeekCells(sel.y, sel.m, sel.d);
  const selDowIdx = selDow(sel);
  const visibleCells = expanded ? rows.flat() : weekCells;

  const CELL = 36, GAP = 2;
  const expH = rows.length * (CELL + GAP);
  const colH = CELL + GAP;
  const liveH = expanded ? expH : isPill ? Math.min(expH, colH + Math.max(0, pillDelta)) : colH;
  const prog = Math.min(1, Math.max(0, (liveH - colH) / (expH - colH)));

  const DayCell = ({ cell }) => {
    const cur = cell.type === "current";
    const isVisible = visibleCells.some(c => c.d === cell.d && c.m === cell.m && c.y === cell.y);
    const isSel = isVisible && cell.d === sel.d && cell.m === sel.m && cell.y === sel.y;
    const isTod = cur && cell.d === TODAY.d && cell.m === TODAY.m && cell.y === TODAY.y;
    const ck = formatDateKey(cell.y, cell.m, cell.d);
    const dots = cur && (tasks[ck] || []).length > 0;

    return (
      <div className="day-cell" onClick={() => {
        if(!cur){
          trigAnim(cell.type === "next" ? 1 : -1);
          setSel({y:cell.y, m:cell.m, d:cell.d});
          setView({y:cell.y, m:cell.m});
          if(expanded) setExpanded(false);
          return;
        }
        setSel({y:cell.y, m:cell.m, d:cell.d});
      }}>
        <div className={`day-num ${isSel ? "sel" : ""} ${isTod && !isSel ? "today" : ""} ${!cur ? "muted" : ""}`} style={{fontSize:15}}>
          {cell.d}
        </div>
        <div className="day-dots">
          {dots && Array.from({length: Math.min((tasks[ck] || []).length, 3)}).map((_, i) => (
            <div key={i} className={`day-dot ${isSel ? "sel" : ""}`}/>
          ))}
        </div>
      </div>
    );
  };

  const isToday = sel.d === TODAY.d && sel.m === TODAY.m && sel.y === TODAY.y;

  return (
    <>
      <TopBar/>
      <div style={{display:"flex", flexDirection:"column", flex:1, overflow:"hidden", padding:"0 20px"}}>

        {/* Month + arrows - Month on left, arrows on sides */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px", marginTop:"8px"}}>
          <button className="cal-arrow" onClick={() => navigate(-1)}><ChevronLeft size={18}/></button>
          <div className={`cal-month-name ${anim}`} key={`${view.y}-${view.m}`}>
            {MONTHS[expanded ? view.m : sel.m]}
          </div>
          <button className="cal-arrow" onClick={() => navigate(1)}><ChevronRight size={18}/></button>
        </div>

        {/* Day names */}
        <div className="day-names-row" style={{height:"auto", alignItems:"center", marginBottom:0}}>
          {DAYS.map((d, i) => {
            const isSelDay = !expanded && i === selDowIdx;
            return (
              <div key={d} className={`day-name ${isSelDay ? "active-col" : ""}`}>
                {d}
              </div>
            );
          })}
        </div>

        {/* Grid (animated height) */}
        <div
          style={{marginTop:"12px", height:liveH, overflow:"hidden", flexShrink:0, transition:isPill ? "none" : "height .36s cubic-bezier(.4,0,.2,1)", userSelect:"none"}}
          onMouseDown={e => { swipeX.current = e.clientX; }}
          onMouseUp={e => { 
            if(swipeX.current !== null){
              const d = e.clientX - swipeX.current; 
              if(Math.abs(d) > 32) navigate(d > 0 ? -1 : 1); 
              swipeX.current = null;
            } 
          }}
          onMouseLeave={() => { swipeX.current = null; }}
          onTouchStart={e => { swipeX.current = e.touches[0].clientX; }}
          onTouchEnd={e => { 
            if(swipeX.current !== null){
              const d = e.changedTouches[0].clientX - swipeX.current; 
              if(Math.abs(d) > 32) navigate(d > 0 ? -1 : 1); 
              swipeX.current = null;
            } 
          }}
        >
          <div className={anim} key={`${view.y}-${view.m}-${expanded ? 1 : 0}`} style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", justifyItems:"center", gap:GAP, overflow:"hidden", transition:isPill ? "none" : "all .36s cubic-bezier(.4,0,.2,1)"}}>
            {expanded ? (
              rows.flat().map((c, i) => <DayCell key={i} cell={c}/>)
            ) : (
              weekCells.map((c, i) => <DayCell key={i} cell={c}/>)
            )}
          </div>
        </div>

        {/* Pill handle */}
        <div className="cal-divider"
          onMouseDown={e => { setPillY(e.clientY); setPillDelta(0); }}
          onMouseMove={e => { if(pillY !== null) setPillDelta(e.clientY - pillY); }}
          onMouseUp={() => { if(pillDelta > 44) setExpanded(true); if(pillDelta < -44) setExpanded(false); setPillY(null); setPillDelta(0); }}
          onMouseLeave={() => { setPillY(null); setPillDelta(0); }}
          onTouchStart={e => { setPillY(e.touches[0].clientY); setPillDelta(0); }}
          onTouchMove={e => { if(pillY !== null) setPillDelta(e.touches[0].clientY - pillY); }}
          onTouchEnd={() => { if(pillDelta > 44) setExpanded(true); if(pillDelta < -44) setExpanded(false); setPillY(null); setPillDelta(0); }}
          onClick={() => { if(Math.abs(pillDelta) < 5) setExpanded(v => !v); }}
        >
          <div className="cal-divider-line"/>
          <div className="cal-pill" style={{transform:expanded ? "rotate(180deg)" : "none"}}>
            <ChevronLeft size={12} style={{transform:"rotate(-90deg)"}}/>
          </div>
        </div>

        {/* Selected date header */}
        <div className="sel-date-header">
          <div className="sel-date-left">
            <span className="sel-day-num">{sel.d}</span>
            {editingDateName ? (
              <input 
                type="text"
                className="sel-day-name-input"
                value={customDateName}
                onChange={e => setCustomDateName(e.target.value)}
                onBlur={() => {
                  setEditingDateName(false);
                  if(customDateName) setDateNameEdited(true);
                }}
                autoFocus
              />
            ) : (
              <span className="sel-day-name">{customDateName || dowName(sel)}</span>
            )}
            {dateNameEdited && <div className="sel-date-divider"/>}
          </div>
          <div className="sel-date-horizontal-line"/>
          <div style={{position: "relative"}}>
            <button 
              className="sel-date-menu-btn"
              onClick={() => setShowDateMenu(!showDateMenu)}
            >
              <MoreVertical size={20}/>
            </button>
            {showDateMenu && (
              <div className="sel-date-menu-popover">
                <button className="sel-date-menu-item" onClick={() => {setShowModal(true); setShowDateMenu(false);}}>
                  Create task
                </button>
                <button className="sel-date-menu-item" onClick={() => {setEditingDateName(true); setShowDateMenu(false);}}>
                  Edit datename
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="tasks-scroll">
          {selTasks.map((t, i) => (
            <div key={t.id} className={`task-card ${i === 1 ? "accent" : ""}`}>
              <div className="task-time">
                <span>{t.time}</span>
                <div style={{display:"flex", gap:6}}>
                  <button onClick={() => startEdit(t)} style={{background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <Edit3 size={16} style={{color:"var(--brown-m)"}}/>
                  </button>
                  <button onClick={() => deleteTask(t.id)} style={{background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <Trash2 size={16} style={{color:"var(--outline)", opacity:0.6}}/>
                  </button>
                </div>
              </div>
              <div className="task-title">{t.title}</div>
              {t.desc && <div className="task-desc">{t.desc}</div>}
              <div className="task-footer">
                <span className="task-tag-badge">{t.tag}</span>
              </div>
            </div>
          ))}
          <button className="add-task-btn" onClick={() => {setEditingId(null); setNewTask({title:"", time:"", desc:"", tag:"Other"}); setShowModal(true);}}>
            <Plus size={15}/> Add task
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="new-task-modal">
            {/* Top Row: Inbox selector + Close button */}
            <div className="modal-top-row">
              <div className="inbox-selector">
                <Inbox size={20} style={{color: "var(--brown)"}}/>
                <span>{selectedInbox}</span>
                <ChevronDown size={18} style={{color: "var(--brown-m)"}}/>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20}/>
              </button>
            </div>

            {/* Middle: Large text input */}
            <input 
              className="modal-task-title-input"
              type="text"
              placeholder="New Task"
              value={newTask.title}
              onChange={e => setNewTask(p => ({...p, title: e.target.value}))}
            />

            {/* Bottom Row: Date + Flag + Create button */}
            <div className="modal-bottom-row">
              <div className="modal-date-info">
                <Calendar size={18} style={{color: "var(--brown)"}}/>
                <span>{sel.d} {MONTHS[sel.m].slice(0,3)}</span>
              </div>
              <button className="modal-flag-btn">
                <Flag size={18} style={{color: "var(--brown-m)"}}/>
              </button>
              <button 
                className="modal-create-btn"
                onClick={() => {addTask(); setShowModal(false);}}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
