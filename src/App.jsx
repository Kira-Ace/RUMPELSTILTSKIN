import { useState } from 'react';
import './styles/index.css';
import TopBar from './components/common/TopBar.jsx';
import BottomNav from './components/common/BottomNav.jsx';
import ChatModal from './components/common/ChatModal.jsx';
import SplashScreen from './components/screens/SplashScreen.jsx';
import HomeScreen from './components/screens/HomeScreen.jsx';
import CalendarScreen from './components/screens/CalendarScreen.jsx';
import PlannerScreen from './components/screens/PlannerScreen.jsx';
import SettingsScreen from './components/screens/SettingsScreen.jsx';
import { initialTasks, TODAY } from './utils/constants.js';
import { addDays, formatDateKey } from './utils/dateUtils.js';

export default function App() {
  const [done, setDone] = useState(false);
  const [tab, setTab] = useState("home");
  const [tasks, setTasks] = useState(initialTasks);
  const [bgPlan, setBgPlan] = useState(null); // Shared background processing plan
  const [chatModalOpen, setChatModalOpen] = useState(false); // Chat modal state

  /* Parse deadline string to date object */
  const parseDeadline = (deadlineStr) => {
    // Try parsing "May 15 2026" format
    const parts = deadlineStr.trim().split(/\s+/);
    if (parts.length >= 3) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIdx = months.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      if (monthIdx >= 0 && day >= 1 && day <= 31 && year > 0) {
        return { y: year, m: monthIdx, d: day };
      }
    }
    return null;
  };

  /* Import plan from NotesScreen */
  const handleImportPlan = (plan) => {
    if (!plan || !plan.topics || plan.topics.length === 0) return;

    const deadline = parseDeadline(plan.deadline);
    const endDate = deadline || addDays(TODAY, 21); // Default 3 weeks if can't parse
    
    // Calculate days available
    let currentDate = { ...TODAY };
    const daysAvailable = [];
    while (
      currentDate.y < endDate.y ||
      (currentDate.y === endDate.y && currentDate.m < endDate.m) ||
      (currentDate.y === endDate.y && currentDate.m === endDate.m && currentDate.d <= endDate.d)
    ) {
      daysAvailable.push({ ...currentDate });
      currentDate = addDays(currentDate, 1);
    }

    if (daysAvailable.length === 0) return;

    // Distribute topics across days
    const newTasks = { ...tasks };
    let taskId = Math.max(
      ...Object.values(tasks)
        .flat()
        .map(t => typeof t.id === 'number' ? t.id : 0),
      0
    ) + 1;

    plan.topics.forEach((topic, topicIdx) => {
      const subtasks = topic.subtasks || [topic.title];
      const numDays = Math.max(1, Math.ceil(daysAvailable.length / plan.topics.length));
      
      subtasks.forEach((subtask, subtaskIdx) => {
        const dayIdx = Math.min(
          topicIdx * numDays + subtaskIdx,
          daysAvailable.length - 1
        );
        const date = daysAvailable[dayIdx];
        const dateKey = formatDateKey(date.y, date.m, date.d);

        if (!newTasks[dateKey]) {
          newTasks[dateKey] = [];
        }

        newTasks[dateKey].push({
          id: taskId++,
          title: subtask || topic.title,
          time: '09:00',
          desc: topic.description || '',
          tag: topic.tag || 'Study'
        });
      });
    });

    setTasks(newTasks);
  };

  return (
    <>
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#111"}}>
        <div className="phone">
          {!done ? (
            <SplashScreen onDone={() => setDone(true)}/>
          ) : (
            <>
              <div className={`screen ${tab === "home" ? "" : "hidden"}`}>
                <HomeScreen tasks={tasks}/>
              </div>
              <div className={`screen ${tab === "calendar" ? "" : "hidden"}`}>
                <CalendarScreen tasks={tasks} setTasks={setTasks}/>
              </div>
              <div className={`screen ${tab === "planner" ? "" : "hidden"}`}>
                <PlannerScreen onImport={handleImportPlan} bgPlan={bgPlan} setBgPlan={setBgPlan}/>
              </div>
              <div className={`screen ${tab === "settings" ? "" : "hidden"}`}>
                <SettingsScreen/>
              </div>
              <BottomNav active={tab} setActive={setTab} bgPlan={bgPlan} setChatModalOpen={setChatModalOpen}/>
              <ChatModal isOpen={chatModalOpen} onClose={() => setChatModalOpen(false)}/>
            </>
          )}
        </div>
      </div>
    </>
  );
}
