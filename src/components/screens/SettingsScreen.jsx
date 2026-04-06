import { useState, useEffect } from 'react';
import { User, Bell, Moon, Volume2, BookOpen, Shield, LogOut, ChevronRight, Palette, Globe } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import Toggle from '../common/Toggle.jsx';
import AboutScreen from './AboutScreen.jsx';
import PreferencesScreen from './PreferencesScreen.jsx';
import PreferencesPage from './PreferencesPage.jsx';
import { auth } from '../../utils/firebaseClient';

export default function SettingsScreen({ darkMode, setDarkMode }) {
  const [notifs, setNotifs] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [user, setUser] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showPreferencesScreen, setShowPreferencesScreen] = useState(false);
  const [showPreferencesPage, setShowPreferencesPage] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        name: currentUser.displayName || 'My App',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL,
      });
    }
  }, []);

  const initial = (user?.name || 'R').charAt(0).toUpperCase();

  const accountItems = [
    { label: "Appearance", Icon: Palette, toggle: true, val: darkMode, set: setDarkMode },
    { label: "Notifications", Icon: Bell, toggle: true, val: notifs, set: setNotifs },
    { label: "Sound Effects", Icon: Volume2, toggle: true, val: sounds, set: setSounds },
  ];

  const aboutItems = [
    { label: "About Rumpel", Icon: BookOpen, onClick: () => setShowAbout(true) },
    { label: "Language", Icon: Globe },
  ];

  const renderGroup = (label, items) => (
    <div className="settings-group">
      <div className="settings-group-label">{label}</div>
      <div className="settings-group-card">
        {items.map(({ label: rowLabel, Icon, toggle, val, set, danger, onClick }, i) => (
          <div 
            key={rowLabel} 
            className={`settings-row${danger ? ' settings-row-danger' : ''}`}
            onClick={onClick}
          >
            <div className="settings-row-icon"><Icon size={18} /></div>
            <div className="settings-row-label">{rowLabel}</div>
            {toggle ? (
              <Toggle on={val} toggle={() => set(v => !v)} />
            ) : (
              <ChevronRight size={16} className="settings-row-chevron" />
            )}
            {i < items.length - 1 && <div className="settings-row-divider" />}
          </div>
        ))}
      </div>
    </div>
  );

  if (showAbout) {
    return <AboutScreen onBack={() => setShowAbout(false)} />;
  }

  if (showPreferencesPage) {
    return <PreferencesPage onBack={() => setShowPreferencesPage(false)} />;
  }

  if (showPreferencesScreen) {
    return <PreferencesScreen onBack={() => setShowPreferencesScreen(false)} />;
  }

  return (
    <>
      <TopBar />
      <div className="scroll-content">
        <div className="settings-wrap">
          {/* Profile Section - Combined */}
          <div className={`settings-profile-wrapper${profileExpanded ? ' expanded' : ''}`}>
            <div className="settings-profile-row" onClick={() => setProfileExpanded(!profileExpanded)}>
              <div className="settings-profile-avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <span className="settings-profile-initial">{initial}</span>
                )}
              </div>
              <div className="settings-profile-info">
                <div className="settings-profile-name">{user?.name || 'My App'}</div>
                {user?.email && <div className="settings-profile-email">{user.email}</div>}
              </div>
              <ChevronRight size={18} className={`settings-row-chevron${profileExpanded ? ' expanded' : ''}`} />
            </div>

            {/* Edit Profile Button */}
            {profileExpanded && (
              <button 
                onClick={() => setShowPreferencesScreen(true)}
                className="settings-edit-profile-btn-divider"
              >
                Edit your profile
              </button>
            )}

            {/* Profile Dropdown Content - Inside wrapper */}
            {profileExpanded && (
              <div className="settings-profile-dropdown">
                {accountItems.map(({ label: rowLabel, Icon, toggle, val, set, onClick }, i) => (
                  <div 
                    key={rowLabel} 
                    className="settings-row"
                    onClick={onClick ? onClick : () => {}}
                  >
                    <div className="settings-row-icon"><Icon size={18} /></div>
                    <div className="settings-row-label">{rowLabel}</div>
                    {toggle ? (
                      <Toggle on={val} toggle={() => set(v => !v)} />
                    ) : (
                      <ChevronRight size={16} className="settings-row-chevron" />
                    )}
                    {i < accountItems.length - 1 && <div className="settings-row-divider" />}
                  </div>
                ))}
              </div>
            )}
          </div>
          {renderGroup("About & More", aboutItems)}

          {/* Sign Out */}
          <div className="settings-group">
            <div className="settings-group-card">
              <div className="settings-row settings-row-danger" onClick={() => auth.signOut()}>
                <div className="settings-row-icon"><LogOut size={18} /></div>
                <div className="settings-row-label">Sign Out</div>
              </div>
            </div>
          </div>

          <div className="settings-version">Rumpel v2.4.1</div>
        </div>
      </div>
    </>
  );
}
