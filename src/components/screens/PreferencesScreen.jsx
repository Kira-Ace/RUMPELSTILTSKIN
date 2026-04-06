import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Mail, LogOut, Camera } from 'lucide-react';
import TopBar from '../common/TopBar.jsx';
import { auth } from '../../utils/firebaseClient';
import '../../styles/preferences.css';

export default function PreferencesScreen({ onBack }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setUsername(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setProfileImage(currentUser.photoURL || '');
      
      // Get age from localStorage
      const savedAge = localStorage.getItem(`user_age_${currentUser.uid}`);
      if (savedAge) {
        setAge(savedAge);
      }
      
      // Get full name from localStorage if available
      const savedFullName = localStorage.getItem(`user_fullname_${currentUser.uid}`);
      if (savedFullName) {
        setFullName(savedFullName);
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      if (user) {
        await user.updateProfile({
          displayName: username,
          photoURL: profileImage,
        });
        localStorage.setItem(`user_fullname_${user.uid}`, fullName);
        setUser({ ...user, displayName: username, photoURL: profileImage });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const initial = (username || user?.displayName || 'U').charAt(0).toUpperCase();

  return (
    <>
      <TopBar />
      <div className="scroll-content">
        <div className="preferences-wrap">
          {/* Back Button */}
          <button className="preferences-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>

          {/* Header */}
          <div className="preferences-header">
            <h1 className="preferences-title">Preferences</h1>
          </div>

          {/* Profile Section */}
          <div className="account-section">
            <div className="preferences-profile-card">
              <div className="account-avatar-wrapper">
                <div className="account-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <span className="account-avatar-initial">{initial}</span>
                  )}
                </div>
                {isEditing && (
                  <button 
                    className="account-avatar-edit-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={16} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="account-profile-info">
                <div className="account-profile-name">{username || 'User'}</div>
                <div className="account-profile-email">{email}</div>
                {age && <div className="account-profile-age">Age: {age}</div>}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="account-section">
            <h2 className="preferences-section-title">Account Details</h2>
            <div className="preferences-details">
              {!isEditing ? (
                <>
                  <div className="account-detail-row">
                    <div className="account-detail-icon"><User size={18} /></div>
                    <div>
                      <div className="account-detail-label">Username</div>
                      <div className="account-detail-value">{username || 'Not set'}</div>
                    </div>
                  </div>
                  {fullName && (
                    <div className="account-detail-row">
                      <div className="account-detail-icon"><User size={18} /></div>
                      <div>
                        <div className="account-detail-label">Full Name</div>
                        <div className="account-detail-value">{fullName}</div>
                      </div>
                    </div>
                  )}
                  <div className="account-detail-row">
                    <div className="account-detail-icon"><Mail size={18} /></div>
                    <div>
                      <div className="account-detail-label">Email</div>
                      <div className="account-detail-value">{email}</div>
                    </div>
                  </div>
                  {age && (
                    <div className="account-detail-row">
                      <div className="account-detail-icon"><User size={18} /></div>
                      <div>
                        <div className="account-detail-label">Age</div>
                        <div className="account-detail-value">{age}</div>
                      </div>
                    </div>
                  )}
                  <button 
                    className="login-btn primary account-edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <>
                  <div className="account-input-group">
                    <label className="account-input-label">Username</label>
                    <input
                      type="text"
                      className="login-input account-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="account-input-group">
                    <label className="account-input-label">Full Name</label>
                    <input
                      type="text"
                      className="login-input account-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="account-input-group">
                    <label className="account-input-label">Email</label>
                    <input
                      type="email"
                      className="login-input account-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                  {age && (
                    <div className="account-input-group">
                      <label className="account-input-label">Age</label>
                      <input
                        type="number"
                        className="login-input account-input"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Age"
                      />
                    </div>
                  )}
                  <div className="account-button-group">
                    <button 
                      className="login-btn primary"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                    <button 
                      className="login-btn secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="account-section">
            <button 
              className="login-btn primary account-logout-btn"
              onClick={() => auth.signOut()}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
