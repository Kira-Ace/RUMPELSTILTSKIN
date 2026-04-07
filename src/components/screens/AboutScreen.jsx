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
              Rumpel is an AI-powered customer support auto-responder, helping businesses resolve tickets faster, manage interactions, and deliver great service.
            </p>
          </div>

          {/* Citations Section */}
          <div className="about-section">
            <h2 className="about-section-title">Citations</h2>
            <div className="about-credits">
              <div className="about-credit-item">
                <div className="about-credit-name">Development</div>
                <div className="about-credit-value" style={{textAlign:"right"}}>
                  <div>Michael C. Baterna</div>
                  <div>Nimeesha D. De Guzman</div>
                  <div>Jazztinn Kyle G. Legaspi</div>
                </div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">Design</div>
                <div className="about-credit-value" style={{textAlign:"right"}}>
                  <div>Jazztinn Kyle G. Legaspi</div>
                  <div>Nimeesha D. De Guzman</div>
                </div>
              </div>
            </div>
          </div>

          {/* Google AI */}
          <div className="about-section">
            <h2 className="about-section-title">Google AI Cloud — APIs Used</h2>
            <div className="about-credits">
              <div className="about-credit-item">
                <div className="about-credit-name">Chat & Reasoning</div>
                <div className="about-credit-value">Gemini 2.0 Flash</div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">Fast Responses</div>
                <div className="about-credit-value">Gemini 2.0 Flash-Lite</div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">Calendar Sync</div>
                <div className="about-credit-value">Google Calendar API</div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">Authentication</div>
                <div className="about-credit-value">Firebase Auth</div>
              </div>
            </div>
          </div>

          {/* External Services */}
          <div className="about-section">
            <h2 className="about-section-title">External Services</h2>
            <div className="about-credits">
              <div className="about-credit-item">
                <div className="about-credit-name">Sign-in Provider</div>
                <div className="about-credit-value">Google OAuth 2.0</div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">Sign-in Provider</div>
                <div className="about-credit-value">Facebook Login</div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">Sign-in Provider</div>
                <div className="about-credit-value">Microsoft Identity</div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">UI Icons</div>
                <div className="about-credit-value">Lucide React</div>
              </div>
              <div className="about-credit-item">
                <div className="about-credit-name">Fonts</div>
                <div className="about-credit-value">Google Fonts</div>
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

          {/* Footer */}
          <div className="about-footer">
            <p>Built for teams that care about their customers</p>
            <p className="about-copyright">© 2026 Rumpel. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}
