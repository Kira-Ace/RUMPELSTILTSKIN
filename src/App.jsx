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
import { auth } from './utils/firebaseClient';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [done, setDone] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState("home");
  const [tasks, setTasks] = useState(initialTasks);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useDarkMode();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clear all local storage and cookies
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });
      setTasks(initialTasks);
      setTab('home');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className={`phone ${darkMode ? 'dark-mode' : ''}`}>
      {!done || !authChecked ? (
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
            <SettingsScreen darkMode={darkMode} setDarkMode={setDarkMode} onSignOut={handleSignOut}/>
          </div>
          <BottomNav active={tab} setActive={setTab} setChatModalOpen={setChatModalOpen}/>
          <ChatModal isOpen={chatModalOpen} onClose={() => setChatModalOpen(false)} tasks={tasks} setTasks={setTasks}/>
        </>
      )}
    </div>
  );
}
