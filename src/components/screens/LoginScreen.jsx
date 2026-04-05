import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import rumpelIcon from '../assets/rumpel.png';
import rumpelText from '../assets/rumpeltext.png';
import googleLogo from '../assets/google.svg';
import facebookLogo from '../assets/facebook.svg';
import microsoftLogo from '../assets/microsoft.svg';
import '../../styles/login.css';
import {
  auth,
  googleProvider,
  facebookProvider,
  microsoftProvider,
} from '../../utils/firebaseClient';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';

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
  const [validationError, setValidationError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, feedback: '' });
  const [attemptedPasswordSubmit, setAttemptedPasswordSubmit] = useState(false);

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
      setAttemptedPasswordSubmit(false); // Reset when moving to next step
    } else {
      // On final step, submit the signup
      // Check if password is valid before submitting
      if (!passwordStrength.isValid) {
        setAttemptedPasswordSubmit(true);
        return;
      }
      handleSignup();
    }
  };

  // Signup handler - create user in Firebase
  const handleSignup = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        alert('Email and password are required');
        return;
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      if (userCredential.user) {
        // Update user profile with name
        if (name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          });
        }
        // User created successfully
        onLogin();
      }
    } catch (err) {
      console.error('Signup error:', err);
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      alert(errorMessage);
    }
  };

  const isNextDisabled = () => {
    if (step === 0) return !age.trim();
    if (step === 1) return false; // name is optional
    if (step === 2) {
      // Email is optional - always allow next
      return false;
    }
    if (step === 3) {
      // Password is optional - user can use OAuth instead
      // But if they enter a password, email becomes required
      if (password.trim() && !email.trim()) return true;
      return false;
    }
    return true;
  };

  // Email validation (optional)
  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // If empty, that's OK since email is optional
    if (!emailValue.trim()) {
      setValidationError('');
      return true;
    }
    // If provided, must be valid
    if (!emailRegex.test(emailValue.trim())) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    setValidationError('');
    return true;
  };

  // Password strength validation
  const validatePassword = (passwordValue) => {
    // Reset the attempted submit flag when user types
    setAttemptedPasswordSubmit(false);
    
    const feedback = [];
    let isValid = true;

    if (!passwordValue) {
      setPasswordStrength({ isValid: false, feedback: '' });
      return;
    }

    if (passwordValue.length < 8) {
      feedback.push('• At least 8 characters');
      isValid = false;
    }
    if (!/[A-Z]/.test(passwordValue)) {
      feedback.push('• At least one uppercase letter');
      isValid = false;
    }
    if (!/[a-z]/.test(passwordValue)) {
      feedback.push('• At least one lowercase letter');
      isValid = false;
    }
    if (!/[0-9]/.test(passwordValue)) {
      feedback.push('• At least one number');
      isValid = false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) {
      feedback.push('• At least one special character (!@#$%^&*, etc.)');
      isValid = false;
    }

    setPasswordStrength({
      isValid,
      feedback: feedback.length > 0 ? feedback.join('\n') : '✓ Strong password!',
    });
  };

  // Handle login for signing in with email/password
  const handleSubmit = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        alert('Email and password are required');
        return;
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      if (userCredential.user) {
        // User signed in successfully
        onLogin();
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      let errorMessage = 'Sign-in failed. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }
      
      alert(errorMessage);
    }
  };

  // OAuth handlers
  const handleOAuthLogin = async (provider) => {
    try {
      playButtonSound();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        // Update user profile with the name from signup if provided
        // (OAuth displayName might be set, but override with our collected name if available)
        if (name.trim()) {
          await updateProfile(result.user, {
            displayName: name.trim(),
          });
        }
        // Store age in localStorage for later use
        if (age.trim()) {
          localStorage.setItem(`user_age_${result.user.uid}`, age);
        }
        // Profile picture and email are automatically available from OAuth providers
        onLogin();
      }
    } catch (err) {
      console.error('OAuth error:', err);
      let errorMessage = 'Sign-in failed. Please try again.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup - don't show error
        return;
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      alert(errorMessage);
    }
  };

  const handleGoogleLogin = () => handleOAuthLogin(googleProvider);
  const handleFacebookLogin = () => handleOAuthLogin(facebookProvider);
  const handleMicrosoftLogin = () => handleOAuthLogin(microsoftProvider);

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
      <div className="login-screen signup-step">
        {/* Navigation Header */}
        <div className="signup-nav-header">
          <button className="signup-nav-btn" onClick={() => {
            playButtonSound();
            setMode(null);
          }}>
            ‹
          </button>
          
          <div style={{ flex: 1 }}></div>
          
          <button className="signup-nav-btn" onClick={() => {
            playButtonSound();
            setMode(null);
          }}>
            <X size={24} />
          </button>
        </div>

        <div className="login-container signup-step-container">
          {/* Question */}
          <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '85px', margin: '0 0 -24px 0' }}>
            <h1 
              className="signup-step-title"
              style={{ 
                margin: 0, 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0
              }}
            >
              {welcomePhrases[phraseIndex]}
            </h1>
          </div>

          {/* Form */}
          <div className="signup-step-form">
            <div>
              <input
                type="email"
                className="login-input signup-step-input"
                placeholder="email@address.com"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  validateEmail(value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && !(!email.trim() || !password.trim()) && handleSubmit()}
                autoFocus
              />
              <div className={`validation-error ${validationError ? 'show' : 'hide'}`}>
                {validationError || '\u200b'}
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="signup-step-form">
            <div>
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input signup-step-input"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !(!email.trim() || !password.trim()) && handleSubmit()}
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
            className="login-btn primary signup-step-btn"
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

          {/* Spacer for social buttons at bottom */}
          <div className="signup-step-spacer" />

          {/* Divider */}
          <div className="login-divider signup-divider">OR</div>

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
            <button className="login-social-btn microsoft" onClick={handleMicrosoftLogin}>
              <img src={microsoftLogo} alt="Microsoft" width="20" height="20" />
              <span>Continue with Microsoft</span>
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

  // Signup step-by-step form
  const stepQuestions = {
    age: 'How old are you?',
    name: 'What do you go by?',
    email: 'What\'s your email?',
    password: 'Create a password'
  };

  const stepPlaceholders = {
    age: 'e.g., 25',
    name: 'Name goes here',
    email: 'your.email@example.com (optional)',
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
            setAttemptedPasswordSubmit(false); // Reset when going back
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
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '85px', margin: '0 0 -24px 0' }}>
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
          {currentStep === 'password' ? (
            <div>
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input signup-step-input"
                  placeholder={stepPlaceholders[currentStep]}
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    validatePassword(value);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !isNextDisabled() && handleNext()}
                  autoFocus
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
              <div className={`password-strength-feedback ${attemptedPasswordSubmit && !passwordStrength.isValid ? 'invalid' : 'empty'}`}>
                {attemptedPasswordSubmit && !passwordStrength.isValid ? (
                  passwordStrength.feedback.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))
                ) : (
                  <div style={{ opacity: 0, pointerEvents: 'none' }}>•</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <input
                type={currentStep === 'age' ? 'number' : 'text'}
                className="login-input signup-step-input"
                placeholder={stepPlaceholders[currentStep]}
                value={
                  currentStep === 'age' ? age :
                  currentStep === 'name' ? name :
                  currentStep === 'email' ? email : ''
                }
                onChange={(e) => {
                  if (currentStep === 'age') setAge(e.target.value);
                  else if (currentStep === 'name') setName(e.target.value);
                  else if (currentStep === 'email') {
                    const value = e.target.value;
                    setEmail(value);
                    validateEmail(value);
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && !isNextDisabled() && handleNext()}
                autoFocus
              />
              <div className={`validation-error ${validationError ? 'show' : 'hide'}`}>
                {validationError || '\u200b'}
              </div>
            </div>
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

        {/* Divider */}
        <div className="login-divider signup-divider">OR</div>

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
          <button className="login-social-btn microsoft" onClick={handleMicrosoftLogin}>
            <img src={microsoftLogo} alt="Microsoft" width="20" height="20" />
            <span>Continue with Microsoft</span>
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
