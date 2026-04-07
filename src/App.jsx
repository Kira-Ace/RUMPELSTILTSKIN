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
import { auth, googleProvider } from './utils/firebaseClient';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function App() {
  const [done, setDone] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState("home");
  const [tasks, setTasks] = useState(initialTasks);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useDarkMode();
  const [googleToken, setGoogleToken] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setAuthChecked(true);
      if (user) {
        const stored = localStorage.getItem('google_access_token');
        const expiry = localStorage.getItem('google_token_expiry');
        if (stored && expiry && Date.now() < Number(expiry)) {
          setGoogleToken(stored);
        } else {
          // Check if this is a Google user and try to refresh token
          const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
          if (isGoogleUser) {
            localStorage.removeItem('google_access_token');
            localStorage.removeItem('google_token_expiry');
            // Silently re-authenticate to get fresh access token
            signInWithPopup(auth, googleProvider).then(result => {
              const credential = GoogleAuthProvider.credentialFromResult(result);
              if (credential?.accessToken) {
                setGoogleToken(credential.accessToken);
                localStorage.setItem('google_access_token', credential.accessToken);
                localStorage.setItem('google_token_expiry', String(Date.now() + 3600000));
              }
            }).catch(() => {
              // Popup blocked or user dismissed — calendar events just won't load
            });
          }
        }
      }
    });
    return unsub;
  }, []);

  const handleLogin = (accessToken) => {
    if (accessToken) {
      setGoogleToken(accessToken);
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_token_expiry', String(Date.now() + 3600000));
    }
    setLoggedIn(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clear all local storage and cookies
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });
      setGoogleToken(null);
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
        <LoginScreen onLogin={handleLogin}/>
      ) : (
        <>
          <div className={`screen ${tab === "home" ? "" : "hidden"}`}>
            <HomeScreen tasks={tasks}/>
          </div>
          <div className={`screen ${tab === "calendar" ? "" : "hidden"}`}>
            <CalendarScreen tasks={tasks} setTasks={setTasks} googleToken={googleToken} onTokenExpired={() => { setGoogleToken(null); localStorage.removeItem('google_access_token'); localStorage.removeItem('google_token_expiry'); }}/>
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
