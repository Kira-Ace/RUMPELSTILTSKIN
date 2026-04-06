import { useState, useEffect } from 'react';
import './styles/index.css';
import TopBar from './components/common/TopBar.jsx';
import BottomNav from './components/common/BottomNav.jsx';
import ChatModal from './components/common/ChatModal.jsx';
import SplashScreen from './components/screens/SplashScreen.jsx';
import LoginScreen from './components/screens/LoginScreen.jsx';
import HomeScreen from './components/screens/HomeScreen.jsx';
import CalendarScreen from './components/screens/CalendarScreen.jsx';
import SettingsScreen from './components/screens/SettingsScreen.jsx';
import { initialTasks, TODAY } from './utils/constants.js';
import { useDarkMode } from './hooks/useDarkMode.js';

export default function App() {
  const [done, setDone] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("home");
  const [tasks, setTasks] = useState(initialTasks);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <div className={`phone ${darkMode ? 'dark-mode' : ''}`}>
      {!done ? (
        <SplashScreen onDone={() => setDone(true)}/>
      ) : !loggedIn ? (
        <LoginScreen onLogin={() => setLoggedIn(true)}/>
      ) : (
        <>
          <div className={`screen ${tab === "home" ? "" : "hidden"}`}>
            <HomeScreen tasks={tasks}/>
          </div>
          <div className={`screen ${tab === "calendar" ? "" : "hidden"}`}>
            <CalendarScreen tasks={tasks} setTasks={setTasks}/>
          </div>
          <div className={`screen ${tab === "settings" ? "" : "hidden"}`}>
            <SettingsScreen darkMode={darkMode} setDarkMode={setDarkMode}/>
          </div>
          <BottomNav active={tab} setActive={setTab} setChatModalOpen={setChatModalOpen}/>
          <ChatModal isOpen={chatModalOpen} onClose={() => setChatModalOpen(false)}/>
        </>
      )}
    </div>
  );
}
