import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../utils/UserContext';
import axios from 'axios';
import '../styles/profile.css';

function ProfilePage() {
  const { user, updateUser } = useContext(UserContext);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    github_url: '',
    leetcode_url: '',
    linkedin_url: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access your profile');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://127.0.0.1:8000/api/profile/', profile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setProfile(response.data);
      updateUser(response.data);
      setMessage('Profile updated successfully!');
      setSaving(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-root">
        <aside className="profile-sidebar">
          <div className="profile-logo">CodeTrackr</div>
          <nav className="profile-nav">
            <ul>
              <li className="active">
                <a href="/profile">
                  <span className="profile-icon">👤</span>
                  Profile
                </a>
              </li>
              <li>
                <a href="/dashboard">
                  <span className="profile-icon">🏠</span>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/questions">
                  <span className="profile-icon">❓</span>
                  Track Questions
                </a>
              </li>
              <li>
                <a href="/projects">
                  <span className="profile-icon">📁</span>
                  Track Projects
                </a>
              </li>
            </ul>
          </nav>
          <div className="profile-logout">
            <a href="/logout">
              <span className="profile-icon">➲</span>
              Logout
            </a>
          </div>
        </aside>
        <main className="profile-main">
          <div className="profile-loading">Loading profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-root">
      <aside className="profile-sidebar">
        <div className="profile-logo">CodeTrackr</div>
        <nav className="profile-nav">
          <ul>
            <li className="active">
              <a href="/profile">
                <span className="profile-icon">👤</span>
                Profile
              </a>
            </li>
            <li>
              <a href="/dashboard">
                <span className="profile-icon">🏠</span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/questions">
                <span className="profile-icon">❓</span>
                Track Questions
              </a>
            </li>
            <li>
              <a href="/projects">
                <span className="profile-icon">📁</span>
                Track Projects
              </a>
            </li>
          </ul>
        </nav>
        <div className="profile-logout">
          <a href="/logout">
            <span className="profile-icon">➲</span>
            Logout
          </a>
        </div>
      </aside>
      <main className="profile-main">
        <h1 className="profile-heading">Profile Settings</h1>
        
        {message && <div className="profile-message success">{message}</div>}
        {error && <div className="profile-message error">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-section">
            <h2 className="profile-section-title">Personal Information</h2>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profile.username}
                  disabled
                  className="profile-input disabled"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className="profile-input"
                  required
                />
              </div>
            </div>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              </div>
              <div className="profile-form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">Coding Profiles</h2>
            <div className="profile-form-group">
              <label htmlFor="github_url">GitHub Profile URL</label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={profile.github_url}
                onChange={handleInputChange}
                className="profile-input"
                placeholder="https://github.com/username"
              />
            </div>
            <div className="profile-form-group">
              <label htmlFor="leetcode_url">LeetCode Profile URL</label>
              <input
                type="url"
                id="leetcode_url"
                name="leetcode_url"
                value={profile.leetcode_url}
                onChange={handleInputChange}
                className="profile-input"
                placeholder="https://leetcode.com/username"
              />
            </div>
            <div className="profile-form-group">
              <label htmlFor="linkedin_url">LinkedIn Profile URL</label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={profile.linkedin_url}
                onChange={handleInputChange}
                className="profile-input"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">About</h2>
            <div className="profile-form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                className="profile-textarea"
                rows="4"
                placeholder="Tell us about yourself, your coding journey, goals..."
              />
            </div>
          </div>

          <div className="profile-actions">
            <button 
              type="submit" 
              className="profile-save-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ProfilePage;