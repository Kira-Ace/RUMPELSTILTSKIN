import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import rumpelIcon from '../assets/rumpel.png';
import rumpelText from '../assets/rumpeltext.png';
import googleLogo from '../assets/google.svg';
import facebookLogo from '../assets/facebook.svg';
import appleLogo from '../assets/apple.svg';
import '../../styles/login.css';

const playButtonSound = () => {
  const audio = new Audio('/RUMPELSTILTSKIN/assets/button.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState(null); // null, 'signup', or 'login'
  const [step, setStep] = useState(0); // 0: age, 1: name, 2: email, 3: password
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const welcomePhrases = [
    'Welcome Back',
    'Great to see you!',
    'Ready to get organized?',
    'Let\'s do this!',
    'Welcome, friend!'
  ];

  useEffect(() => {
    if (mode === 'login') {
      const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % welcomePhrases.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [mode, welcomePhrases.length]);

  const steps = ['age', 'name', 'email', 'password'];
  const currentStep = mode === 'signup' ? steps[step] : null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onLogin();
    }
  };

  const handleSubmit = () => {
    if (mode === 'login') {
      if (email.trim() && password.trim()) {
        onLogin();
      }
    } else if (mode === 'signup' && step === 3 && password.trim()) {
      onLogin();
    }
  };

  const isNextDisabled = () => {
    if (step === 0) return !age.trim();
    if (step === 1) return false; // name is optional
    if (step === 2) return !email.trim();
    if (step === 3) return !password.trim();
    return true;
  };

  // Initial login choice screen
  if (!mode) {
    return (
      <div className="login-screen">
        <div className="login-container">
          {/* Logo */}
          <div className="login-logo">
            <img src={rumpelIcon} alt="Rumpel" />
          </div>

          {/* Title */}
          <img src={rumpelText} alt="Rumpel" className="login-title-img" />
          <p className="login-subtitle">Your personal task manager & AI companion. Get organized and stay focused.</p>

          {/* Buttons */}
          <button
            className="login-btn primary"
            onClick={() => {
              playButtonSound();
              setIsTransitioning(true);
              setTimeout(() => {
                setMode('signup');
                setStep(0);
                setIsTransitioning(false);
              }, 1000);
            }}
            disabled={isTransitioning}
          >
            GET STARTED
          </button>

          <button
            className="login-btn secondary"
            onClick={() => {
              playButtonSound();
              setIsTransitioning(true);
              setTimeout(() => {
                setMode('login');
                setIsTransitioning(false);
              }, 1000);
            }}
            disabled={isTransitioning}
          >
            SIGN IN
          </button>

          <button
            className="login-btn tertiary"
            onClick={() => {
              playButtonSound();
              setIsTransitioning(true);
              setTimeout(() => {
                onLogin();
              }, 1000);
            }}
            disabled={isTransitioning}
          >
            CONTINUE AS GUEST
          </button>
        </div>
      </div>
    );
  }

  // Login form
  if (mode === 'login') {
    return (
      <div className="login-screen">
        <div className="login-container">
          {/* Back button */}
          <button className="login-back" onClick={() => {
            playButtonSound();
            setMode(null);
          }}>
            <X size={24} />
          </button>

          {/* Title */}
          <h1 className="login-form-title rotating-text" key={phraseIndex}>
            {welcomePhrases[phraseIndex]}
          </h1>

          {/* Form */}
          <div className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="login-input"
                placeholder="email@address.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  className="login-password-toggle"
                  onClick={() => {
                    playButtonSound();
                    setShowPassword(!showPassword);
                  }}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="login-btn primary"
            onClick={() => {
              playButtonSound();
              handleSubmit();
            }}
            disabled={!email.trim() || !password.trim()}
          >
            SIGN IN
          </button>

          {/* Forgot Password Link */}
          <button className="login-forgot-btn" onClick={playButtonSound}>
            FORGOT PASSWORD?
          </button>

          {/* Divider */}
          <div className="login-divider">OR</div>

          {/* Social Login Buttons */}
          <button className="login-social-btn google" onClick={playButtonSound}>
            <img src={googleLogo} alt="Google" width="20" height="20" />
            <span>Continue with Google</span>
          </button>
          <button className="login-social-btn facebook" onClick={playButtonSound}>
            <img src={facebookLogo} alt="Facebook" width="20" height="20" />
            <span>Continue with Facebook</span>
          </button>
          <button className="login-social-btn apple" onClick={playButtonSound}>
            <img src={appleLogo} alt="Apple" width="20" height="20" />
            <span>Continue with Apple</span>
          </button>

          {/* Terms & Privacy */}
          <p className="login-terms">
            By signing in to Rumpel, you agree to our{' '}
            <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    );
  }

  // Signup step-by-step form
  const stepQuestions = {
    age: 'How old are you?',
    name: 'What should we call you?',
    email: 'What\'s your email?',
    password: 'Create a password'
  };

  const stepPlaceholders = {
    age: 'e.g., 25',
    name: 'Your magical name',
    email: 'your.email@example.com',
    password: 'Make it strong!'
  };

  return (
    <div className="login-screen signup-step">
      <button className="signup-close" onClick={() => {
        playButtonSound();
        setMode(null);
      }}>
        <X size={24} />
      </button>

      {/* Progress bar */}
      <div className="signup-progress-container">
        <div className="signup-progress-bar">
          <div className="signup-progress-fill" style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>
      </div>

      <div className="login-container signup-step-container">
        {/* Question */}
        <h1 className="signup-step-title">{stepQuestions[currentStep]}</h1>

        {/* Input */}
        <div className="signup-step-form">
          <input
            type={currentStep === 'age' ? 'number' : currentStep === 'password' ? (showPassword ? 'text' : 'password') : 'text'}
            className="login-input signup-step-input"
            placeholder={stepPlaceholders[currentStep]}
            value={
              currentStep === 'age' ? age :
              currentStep === 'name' ? name :
              currentStep === 'email' ? email :
              currentStep === 'password' ? password : ''
            }
            onChange={(e) => {
              if (currentStep === 'age') setAge(e.target.value);
              else if (currentStep === 'name') setName(e.target.value);
              else if (currentStep === 'email') setEmail(e.target.value);
              else if (currentStep === 'password') setPassword(e.target.value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && !isNextDisabled() && handleNext()}
            autoFocus
          />
          {currentStep === 'password' && (
            <button
              className="login-password-toggle"
              onClick={() => {
                playButtonSound();
                setShowPassword(!showPassword);
              }}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* Next button */}
        <button
          className="login-btn primary signup-step-btn"
          onClick={() => {
            playButtonSound();
            handleNext();
          }}
          disabled={isNextDisabled()}
        >
          NEXT
        </button>

        {/* Spacer for social buttons at bottom */}
        <div className="signup-step-spacer" />

        {/* Social Login Buttons */}
        <div className="signup-step-social">
          <button className="login-social-btn google" onClick={playButtonSound}>
            <img src={googleLogo} alt="Google" width="20" height="20" />
            <span>Continue with Google</span>
          </button>
          <button className="login-social-btn facebook" onClick={playButtonSound}>
            <img src={facebookLogo} alt="Facebook" width="20" height="20" />
            <span>Continue with Facebook</span>
          </button>
          <button className="login-social-btn apple" onClick={playButtonSound}>
            <img src={appleLogo} alt="Apple" width="20" height="20" />
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Terms & Privacy */}
        <p className="login-terms">
          By signing in to Rumpel, you agree to our{' '}
          <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
