import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import rumpelIcon from '../assets/rumpel.png';
import rumpelText from '../assets/rumpeltext.png';
import googleLogo from '../assets/google.svg';
import facebookLogo from '../assets/facebook.svg';
import discordLogo from '../assets/discord.svg';
import '../../styles/login.css';
import { supabase } from '../../utils/supabaseClient';

const playButtonSound = () => {
  const audio = new Audio('/RUMPELSTILTSKIN/assets/button.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState(null); // null, 'signup', or 'login'
  const [step, setStep] = useState(0); // 0: age, 1: name, 2: email, 3: password
  const [previousStep, setPreviousStep] = useState(null); // for animation
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);

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
      setIsStepTransitioning(true);
      setPreviousStep(step);
      setStep(step + 1);
      setTimeout(() => setIsStepTransitioning(false), 300);
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

  // OAuth handlers
  const handleOAuthLogin = async (provider) => {
    try {
      playButtonSound();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        alert(`${provider} login failed. Please try again.`);
      }
    } catch (err) {
      console.error('OAuth error:', err);
      alert('An error occurred during login. Please try again.');
    }
  };

  const handleGoogleLogin = () => handleOAuthLogin('google');
  const handleFacebookLogin = () => handleOAuthLogin('facebook');
  const handleDiscordLogin = () => handleOAuthLogin('discord');

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
              setMode('signup');
              setStep(0);
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
          <button className="login-social-btn google" onClick={handleGoogleLogin}>
            <img src={googleLogo} alt="Google" width="20" height="20" />
            <span>Continue with Google</span>
          </button>
          <button className="login-social-btn facebook" onClick={handleFacebookLogin}>
            <img src={facebookLogo} alt="Facebook" width="20" height="20" />
            <span>Continue with Facebook</span>
          </button>
          <button className="login-social-btn discord" onClick={handleDiscordLogin}>
            <img src={discordLogo} alt="Discord" width="20" height="20" />
            <span>Continue with Discord</span>
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
      {/* Navigation Header with Progress Dashes */}
      <div className="signup-nav-header">
        <button className="signup-nav-btn" onClick={() => {
          playButtonSound();
          if (step > 0) {
            setIsStepTransitioning(true);
            setPreviousStep(step);
            setStep(step - 1);
            setTimeout(() => setIsStepTransitioning(false), 300);
          } else {
            setMode(null);
          }
        }}>
          ‹
        </button>
        
        {/* Progress Dashes */}
        <div className="signup-progress-dashes">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`progress-dash ${i === step ? 'active' : i < step ? 'completed' : ''}`}
            ></div>
          ))}
        </div>
        
        <button className="signup-nav-btn" onClick={() => {
          playButtonSound();
          setMode(null);
        }}>
          <X size={24} />
        </button>
      </div>

      <div className="login-container signup-step-container">
        {/* Question - ALWAYS use wrapper to prevent layout shift */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '85px', margin: '0 0 40px 0' }}>
          <h1 
            className={`signup-step-title ${isStepTransitioning && previousStep !== null ? 'slide-out' : ''}`}
            style={{ 
              margin: 0, 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0
            }}
          >
            {isStepTransitioning && previousStep !== null ? stepQuestions[steps[previousStep]] : stepQuestions[currentStep]}
          </h1>
          {isStepTransitioning && previousStep !== null && (
            <h1 
              className="signup-step-title slide-in"
              style={{ 
                margin: 0, 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0
              }}
            >
              {stepQuestions[currentStep]}
            </h1>
          )}
        </div>

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
          <button className="login-social-btn google" onClick={handleGoogleLogin}>
            <img src={googleLogo} alt="Google" width="20" height="20" />
            <span>Continue with Google</span>
          </button>
          <button className="login-social-btn facebook" onClick={handleFacebookLogin}>
            <img src={facebookLogo} alt="Facebook" width="20" height="20" />
            <span>Continue with Facebook</span>
          </button>
          <button className="login-social-btn discord" onClick={handleDiscordLogin}>
            <img src={discordLogo} alt="Discord" width="20" height="20" />
            <span>Continue with Discord</span>
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
