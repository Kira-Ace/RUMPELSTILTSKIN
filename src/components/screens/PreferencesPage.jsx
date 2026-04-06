import { ArrowLeft } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import '../../styles/preferences.css';

export default function PreferencesPage({ onBack }) {
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

          {/* Content Area */}
          <div className="preferences-page-content">
            {/* Add preference options here */}
          </div>
        </div>
      </div>
    </>
  );
}
