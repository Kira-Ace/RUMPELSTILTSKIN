import { ArrowLeft, Palette, Bell, Volume2, ChevronRight } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import Toggle from '../common/Toggle.jsx';
import '../../styles/preferences.css';

export default function PreferencesPage({ 
  onBack, 
  darkMode, 
  setDarkMode, 
  notifs, 
  setNotifs, 
  sounds, 
  setSounds 
}) {
  const generalItems = [
    { label: "Appearance", Icon: Palette, toggle: true, val: darkMode, set: setDarkMode },
    { label: "Notifications", Icon: Bell, toggle: true, val: notifs, set: setNotifs },
    { label: "Sound Effects", Icon: Volume2, toggle: true, val: sounds, set: setSounds },
  ];

  const renderGroup = (label, items) => (
    <div className="settings-group">
      <div className="settings-group-card" style={{ margin: '0 16px' }}>
        {items.map(({ label: rowLabel, Icon, toggle, val, set }, i) => (
          <div 
            key={rowLabel} 
            className="settings-row"
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

  return (
    <>
      <TopBar />
      <div className="scroll-content">
        <div className="preferences-page-wrap">
          {/* Back Button */}
          <button className="preferences-page-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="preferences-header">
            <h1 className="preferences-title">Preferences</h1>
          </div>

          {/* General Settings */}
          {renderGroup("General Settings", generalItems)}
        </div>
      </div>
    </>
  );
}
