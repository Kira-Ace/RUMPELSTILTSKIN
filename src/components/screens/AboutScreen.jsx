import { ArrowLeft } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import '../../styles/about.css';

export default function AboutScreen({ onBack }) {
  return (
    <>
      <TopBar />
      <div className="scroll-content">
        <div className="about-wrap">
          {/* Back Button */}
          <button className="about-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>

          {/* Header */}
          <div className="about-header">
            <h1 className="about-title">About Rumpel</h1>
            <p className="about-version">v2.4.1</p>
          </div>

          {/* Description */}
          <div className="about-section">
            <p className="about-description">
              Rumpel is your personal study companion, helping you organize tasks, manage your time, and achieve your goals with AI-powered insights.
            </p>
          </div>

          {/* Credits Section */}
          <div className="about-section">
            <h2 className="about-section-title">Credits</h2>
            <div className="about-credits">
              <div className="about-credit-item">
                <div className="about-credit-name">Development</div>
                <div className="about-credit-value">Charlie Kirk</div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">Design</div>
                <div className="about-credit-value">Charlie Kirk</div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="about-section">
            <h2 className="about-section-title">Built With</h2>
            <div className="about-tech-stack">
              <div className="about-tech-item">React</div>
              <div className="about-tech-item">Vite</div>
              <div className="about-tech-item">Firebase</div>
              <div className="about-tech-item">Google Gemini API</div>
            </div>
          </div>

          {/* Links Section */}
          <div className="about-section">
            <h2 className="about-section-title">Links</h2>
            <div className="about-links">
              <a href="#" className="about-link-item">Privacy Policy</a>
              <a href="#" className="about-link-item">Terms of Service</a>
              <a href="#" className="about-link-item">Contact Us</a>
            </div>
          </div>

          {/* Footer */}
          <div className="about-footer">
            <p>Made with ❤️ for students everywhere</p>
            <p className="about-copyright">© 2026 Rumpel. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}
