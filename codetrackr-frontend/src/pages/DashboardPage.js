import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../utils/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';

function DashboardPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch stats and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/dashboard/stats/', { headers }),
        axios.get('http://127.0.0.1:8000/api/activities/', { headers })
      ]);

      setStats(statsResponse.data);
      setActivities(activitiesResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'question_created': return '❓';
      case 'question_updated': return '✏️';
      case 'question_completed': return '✅';
      case 'project_created': return '📁';
      case 'project_updated': return '🔄';
      case 'project_completed': return '🎉';
      case 'profile_updated': return '👤';
      default: return '📝';
    }
  };

  const formatActivityTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now - activityTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return activityTime.toLocaleDateString();
  };

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">CodeTrackr</div>
        <nav className="dashboard-nav">
          <ul>
            <li>
              <a href="/profile">
                <span className="dashboard-icon">👤</span>
                Profile
              </a>
            </li>
            <li className="active">
              <a href="/dashboard">
                <span className="dashboard-icon">🏠</span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/questions">
                <span className="dashboard-icon">❓</span>
                Track Questions
              </a>
            </li>
            <li>
              <a href="/projects">
                <span className="dashboard-icon">📁</span>
                Track Projects
              </a>
            </li>
          </ul>
        </nav>
        <div className="dashboard-logout">
          <a href="/logout">
            <span className="dashboard-icon">➲</span>
            Logout
          </a>
        </div>
      </aside>
      <main className="dashboard-main">
        <div className="dashboard-welcome-top">
          Welcome back, <span className="dashboard-welcome-username">{user?.username || "User"}</span>!
        </div>

        <h1 className="dashboard-heading">Dashboard</h1>
        
        {error && (
          <div className="dashboard-error">
            <span className="dashboard-error-icon">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading">
            <div className="dashboard-loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        ) : !localStorage.getItem('token') ? (
          <div className="dashboard-info-box">
            <span className="dashboard-info-icon">ℹ️</span>
            <div>
              <strong>Please Log In</strong>
              <div>
                Log in to access your dashboard and start tracking your coding progress.
              </div>
              <button
                className="dashboard-info-btn"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Overview */}
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon">❓</div>
                <div className="dashboard-stat-content">
                  <div className="dashboard-stat-number">{stats.total_questions}</div>
                  <div className="dashboard-stat-label">Total Questions</div>
                  <div className="dashboard-stat-progress">
                    <div className="dashboard-progress-bar">
                      <div 
                        className="dashboard-progress-fill"
                        style={{ width: `${stats.completion_rate_questions}%` }}
                      ></div>
                    </div>
                    <span className="dashboard-progress-text">{stats.completion_rate_questions}% completed</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon">📁</div>
                <div className="dashboard-stat-content">
                  <div className="dashboard-stat-number">{stats.total_projects}</div>
                  <div className="dashboard-stat-label">Total Projects</div>
                  <div className="dashboard-stat-progress">
                    <div className="dashboard-progress-bar">
                      <div 
                        className="dashboard-progress-fill"
                        style={{ width: `${stats.completion_rate_projects}%` }}
                      ></div>
                    </div>
                    <span className="dashboard-progress-text">{stats.completion_rate_projects}% completed</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon">✅</div>
                <div className="dashboard-stat-content">
                  <div className="dashboard-stat-number">{stats.completed_questions}</div>
                  <div className="dashboard-stat-label">Completed Questions</div>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon">🎉</div>
                <div className="dashboard-stat-content">
                  <div className="dashboard-stat-number">{stats.completed_projects}</div>
                  <div className="dashboard-stat-label">Completed Projects</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-activity-section">
              <h2 className="dashboard-section-title">Recent Activity</h2>
              {activities.length === 0 ? (
                <div className="dashboard-activity-empty">
                  <div className="dashboard-activity-empty-icon">📝</div>
                  <p>No recent activity. Start tracking questions or projects to see your progress here!</p>
                  <div className="dashboard-activity-actions">
                    <button 
                      className="dashboard-activity-btn"
                      onClick={() => navigate("/questions")}
                    >
                      Add Question
                    </button>
                    <button 
                      className="dashboard-activity-btn"
                      onClick={() => navigate("/projects")}
                    >
                      Add Project
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dashboard-activity-list">
                  {activities.slice(0, 10).map(activity => (
                    <div key={activity.id} className="dashboard-activity-item">
                      <div className="dashboard-activity-icon">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="dashboard-activity-content">
                        <div className="dashboard-activity-description">
                          {activity.description}
                        </div>
                        <div className="dashboard-activity-time">
                          {formatActivityTime(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-quick-actions">
              <h2 className="dashboard-section-title">Quick Actions</h2>
              <div className="dashboard-actions-grid">
                <button 
                  className="dashboard-action-card"
                  onClick={() => navigate("/questions")}
                >
                  <div className="dashboard-action-icon">❓</div>
                  <div className="dashboard-action-title">Add Question</div>
                  <div className="dashboard-action-desc">Track a new coding problem</div>
                </button>
                <button 
                  className="dashboard-action-card"
                  onClick={() => navigate("/projects")}
                >
                  <div className="dashboard-action-icon">📁</div>
                  <div className="dashboard-action-title">Add Project</div>
                  <div className="dashboard-action-desc">Start tracking a new project</div>
                </button>
                <button 
                  className="dashboard-action-card"
                  onClick={() => navigate("/profile")}
                >
                  <div className="dashboard-action-icon">👤</div>
                  <div className="dashboard-action-title">Update Profile</div>
                  <div className="dashboard-action-desc">Manage your account settings</div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="dashboard-info-box">
            <span className="dashboard-info-icon">ℹ️</span>
            <div>
              <strong>Complete Your Profile</strong>
              <div>
                Please complete your profile to unlock all features and start tracking your coding progress.
                Once your profile is complete, your dashboard will populate with your data.
              </div>
              <button
                className="dashboard-info-btn"
                onClick={() => navigate("/profile")}
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;