import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCIN5A1CMFhJXRZsBjaT-mrwhuYtTfpFss",
  authDomain: "rumpel-spin.firebaseapp.com",
  projectId: "rumpel-spin",
  storageBucket: "rumpel-spin.firebasestorage.app",
  messagingSenderId: "1035083578608",
  appId: "1:1035083578608:web:c33c91009aa55794b19635",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize OAuth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');

// Set custom parameters for Microsoft
microsoftProvider.addScope('openid');
microsoftProvider.addScope('profile');
microsoftProvider.addScope('email');
