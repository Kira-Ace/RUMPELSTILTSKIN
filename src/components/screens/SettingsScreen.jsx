import { useState, useEffect } from 'react';
import { Moon, Volume2, BookOpen, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import Toggle from '../common/Toggle.jsx';
import AboutScreen from './AboutScreen.jsx';
import { auth } from '../../utils/firebaseClient';

export default function SettingsScreen({ darkMode, setDarkMode, onSignOut }) {
  const [sounds, setSounds] = useState(true);
  const [user, setUser] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  const profileDropdownItems = [
    { label: "Dark Mode", Icon: Moon, toggle: true, val: darkMode, set: setDarkMode },
    { label: "Sound Effects", Icon: Volume2, toggle: true, val: sounds, set: setSounds },
    { label: "About Rumpel", Icon: BookOpen, onClick: () => setShowAbout(true) },
  ];

  if (showAbout) {
    return <AboutScreen onBack={() => setShowAbout(false)} />;
  }

  return (
    <>
      <TopBar />
      <div className="scroll-content">
        <div className="settings-wrap">
          {/* Profile Row - Dropdown */}
          <div className={`settings-profile-dropdown ${profileOpen ? 'open' : ''}`}>
            <div className="settings-profile-row" onClick={() => setProfileOpen(v => !v)}>
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
              <ChevronDown size={18} className={`settings-row-chevron settings-profile-chevron ${profileOpen ? 'rotated' : ''}`} />
            </div>
            <div className="settings-profile-dropdown-body">
              {profileDropdownItems.map(({ label: rowLabel, Icon, toggle, val, set, onClick }, i) => (
                <div
                  key={rowLabel}
                  className="settings-row"
                  onClick={onClick}
                >
                  <div className="settings-row-icon"><Icon size={18} /></div>
                  <div className="settings-row-label">{rowLabel}</div>
                  {toggle ? (
                    <Toggle on={val} toggle={() => set(v => !v)} />
                  ) : (
                    <ChevronRight size={16} className="settings-row-chevron" />
                  )}
                  {i < profileDropdownItems.length - 1 && <div className="settings-row-divider" />}
                </div>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <div className="settings-group">
            <div className="settings-group-card">
              <div className="settings-row settings-row-danger" onClick={onSignOut}>
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
