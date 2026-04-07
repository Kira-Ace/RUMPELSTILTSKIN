import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import rumpelIcon from '../assets/rumpel.png';
import rumpelText from '../assets/rumpeltext.png';
import googleLogo from '../assets/google.svg';
import facebookLogo from '../assets/facebook.svg';
import microsoftLogo from '../assets/microsoft.svg';
import buttonSound from '../assets/button.mp3';
import buttonSound2 from '../assets/button2.mp3';
import buttonSound3 from '../assets/button3.mp3';
import buttonSound4 from '../assets/button4.mp3';
import '../../styles/login.css';
import {
  auth,
  googleProvider,
  facebookProvider,
  microsoftProvider,
} from '../../utils/firebaseClient';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

const buttonSounds = [
  new Audio(buttonSound),
  new Audio(buttonSound2),
  new Audio(buttonSound3),
  new Audio(buttonSound4),
];

buttonSounds.forEach(audio => {
  audio.volume = 0.3;
  audio.preload = 'auto';
});

let lastSoundIndex = -1;

const playButtonSound = () => {
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * buttonSounds.length);
  } while (nextIndex === lastSoundIndex);
  
  lastSoundIndex = nextIndex;
  buttonSounds[nextIndex].currentTime = 0;
  buttonSounds[nextIndex].play().catch(() => {});
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
  const [syncedEmail, setSyncedEmail] = useState('');

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
  const hasSyncedEmail = Boolean(syncedEmail.trim());
  const resolvedEmail = email.trim() || syncedEmail.trim();

  const resetSignupState = () => {
    setStep(0);
    setPreviousStep(null);
    setShowPassword(false);
    setEmail('');
    setPassword('');
    setName('');
    setAge('');
    setIsTransitioning(false);
    setIsStepTransitioning(false);
    setValidationError('');
    setPasswordStrength({ isValid: false, feedback: '' });
    setAttemptedPasswordSubmit(false);
    setSyncedEmail('');
  };

  const abandonSignup = async () => {
    const shouldSignOutPendingOAuthUser = mode === 'signup' && hasSyncedEmail && auth.currentUser;

    resetSignupState();
    setMode(null);

    if (shouldSignOutPendingOAuthUser) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Failed to clear pending OAuth signup:', err);
      }
    }
  };

  const isPasswordRequired = !hasSyncedEmail;

  const handleNext = () => {
    if (step < 3) {
      setIsStepTransitioning(true);
      setPreviousStep(step);
      setStep(step + 1);
      setTimeout(() => setIsStepTransitioning(false), 300);
      setAttemptedPasswordSubmit(false); // Reset when moving to next step
    } else {
      // On final step, submit the signup
      const needsPassword = isPasswordRequired && !password.trim();
      const hasInvalidPassword = Boolean(password.trim()) && !passwordStrength.isValid;

      if (needsPassword || hasInvalidPassword) {
        setAttemptedPasswordSubmit(true);
        return;
      }
      handleSignup();
    }
  };

  // Signup handler - create user in Firebase
  const handleSignup = async () => {
    try {
      if (!age.trim() || !name.trim()) {
        alert('Age and name are required');
        return;
      }

      if (!hasSyncedEmail) {
        if (!email.trim() || !password.trim()) {
          alert('Age, name, email, and password are required');
          return;
        }

        if (!validateEmail(email)) {
          return;
        }

        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password.trim()
        );

        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          });

          localStorage.setItem(`user_age_${userCredential.user.uid}`, age.trim());
          onLogin();
        }

        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Please sync your email again before continuing.');
        return;
      }

      if (email.trim() && !validateEmail(email)) {
        return;
      }

      if (!resolvedEmail) {
        alert('A synced email is required to finish signup.');
        return;
      }

      if (password.trim()) {
        const credential = EmailAuthProvider.credential(resolvedEmail, password.trim());
        await linkWithCredential(currentUser, credential);
      }

      await updateProfile(currentUser, {
        displayName: name.trim(),
      });

      localStorage.setItem(`user_age_${currentUser.uid}`, age.trim());
      onLogin();
    } catch (err) {
      console.error('Signup error:', err);
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/provider-already-linked') {
        errorMessage = 'This account already has an email sign-in method linked.';
      } else if (err.code === 'auth/credential-already-in-use') {
        errorMessage = 'That email/password combination is already linked to another account.';
      }
      
      alert(errorMessage);
    }
  };

  // Email validation
  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = emailValue.trim();

    if (!trimmedEmail) {
      if (hasSyncedEmail) {
        setValidationError('');
        return true;
      }

      setValidationError('Email is required');
      return false;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    setValidationError('');
    return true;
  };

  const isNextDisabled = () => {
    if (step === 0) return !age.trim();
    if (step === 1) return !name.trim();
    if (step === 2) {
      if (hasSyncedEmail && !email.trim()) return false;
      return !email.trim() || Boolean(validationError);
    }
    if (step === 3) {
      if (!password.trim()) {
        return isPasswordRequired;
      }

      return false;
    }

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
      feedback.push('At least 8 characters');
      isValid = false;
    }
    if (!/[A-Z]/.test(passwordValue)) {
      feedback.push('At least one uppercase letter');
      isValid = false;
    }
    if (!/[a-z]/.test(passwordValue)) {
      feedback.push('At least one lowercase letter');
      isValid = false;
    }
    if (!/[0-9]/.test(passwordValue)) {
      feedback.push('At least one number');
      isValid = false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) {
      feedback.push('At least one special character (!@#$%^&*, etc.)');
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
        if (mode === 'signup') {
          const providerEmail = result.user.email || '';

          setSyncedEmail(providerEmail);
          setEmail((currentEmail) => currentEmail.trim() || providerEmail);
          setName((currentName) => currentName.trim() || result.user.displayName || '');
          setValidationError('');
          return;
        }

        if (name.trim()) {
          await updateProfile(result.user, {
            displayName: name.trim(),
          });
        }

        if (age.trim()) {
          localStorage.setItem(`user_age_${result.user.uid}`, age);
        }

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
            className="login-btn primary get-started-btn"
            onClick={() => {
              playButtonSound();
              resetSignupState();
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
          <button className="signup-nav-btn" onClick={async () => {
            playButtonSound();
            await abandonSignup();
          }}>
            ‹
          </button>
          
          <div style={{ flex: 1 }}></div>
          
          <button className="signup-nav-btn" onClick={async () => {
            playButtonSound();
            await abandonSignup();
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
    name: 'Who do you go by?',
    email: 'What\'s your email?',
    password: 'Create a password'
  };

  const stepPlaceholders = {
    age: 'e.g., 25',
    name: 'Name goes here',
    email: hasSyncedEmail ? syncedEmail || 'Email already synced' : 'your.email@example.com',
    password: hasSyncedEmail ? 'Optional: add a password for email sign-in' : 'Make it strong!'
  };

  return (
    <div className="login-screen signup-step">
      {/* Navigation Header with Progress Dashes */}
      <div className="signup-nav-header">
        <button className="signup-nav-btn" onClick={async () => {
          playButtonSound();
          if (step > 0) {
            setIsStepTransitioning(true);
            setPreviousStep(step);
            setStep(step - 1);
            setTimeout(() => setIsStepTransitioning(false), 300);
            setAttemptedPasswordSubmit(false); // Reset when going back
          } else {
            await abandonSignup();
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
        
        <button className="signup-nav-btn" onClick={async () => {
          playButtonSound();
          await abandonSignup();
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
                    <div key={i} className="pw-feedback-item">{line}</div>
                  ))
                ) : (
                  <div style={{ opacity: 0, pointerEvents: 'none' }}>•</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <input
                type={currentStep === 'age' ? 'number' : currentStep === 'email' ? 'email' : 'text'}
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
