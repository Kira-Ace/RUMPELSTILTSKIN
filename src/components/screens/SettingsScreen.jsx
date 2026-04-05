import { useState, useEffect } from 'react';
import { BookOpen, Shield, Send, LogOut, Bell, Moon, Volume2, Edit3, ChevronRight } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import Toggle from '../common/Toggle.jsx';
import { auth } from '../../utils/firebaseClient';

export default function SettingsScreen({ darkMode, setDarkMode }) {
  const [notifs,setNotifs] = useState(true);
  const [sounds,setSounds] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user data from Firebase
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        name: currentUser.displayName || 'My App',
        photoURL: currentUser.photoURL,
      });
    }
  }, []);

  const prefs = [
    { label:"Notifications", sub:"Scholarly alerts and reminders",       Icon:Bell,    val:notifs, set:setNotifs, bg:"#fff1e9", color:"var(--orange-m)" },
    { label:"Dark Mode",     sub:"Midnight study session aesthetics",     Icon:Moon,    val:darkMode, set:setDarkMode, bg:"#fff1e9", color:"var(--orange-m)" },
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
          {/* Profile - TEMPLATE: Customize user data below */}
          <div className="profile-card">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{fontSize:32,color:"var(--brown-m)",opacity:.5}}>!</span>
                )}
              </div>
              <div className="profile-edit-btn"><Edit3 size={11} color="white"/></div>
            </div>
            <div className="profile-name">{user?.name || 'My App'}</div>
            <div className="profile-role">User · Level 1</div>
            <div className="profile-bio">Welcome to your personal study companion.</div>
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
