import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../utils/UserContext";
import "../styles/dashboard.css";

function DashboardPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">CodeTrackr</div>
        <nav className="dashboard-nav">
          <ul>
            <li>
              <a href="/profile">
                <span className="dashboard-icon">&#128100;</span>
                Profile
              </a>
            </li>
            <li className="active">
              <a href="/dashboard">
                <span className="dashboard-icon">&#127968;</span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/questions">
                <span className="dashboard-icon">&#10067;</span>
                Track Questions
              </a>
            </li>
            <li>
              <a href="/projects">
                <span className="dashboard-icon">&#128193;</span>
                Track Projects
              </a>
            </li>
          </ul>
        </nav>
        <div className="dashboard-logout">
          <a href="/logout">
            <span className="dashboard-icon">&#10162;</span>
            Logout
          </a>
        </div>
      </aside>
      <main className="dashboard-main">
        <div className="dashboard-welcome-top">
  Welcome, logged in user: <span className="dashboard-welcome-username">{user?.username || "User"}</span>!
</div>

        <h1 className="dashboard-heading">User Dashboard</h1>
        
        <div className="dashboard-info-box">
          <span className="dashboard-info-icon">&#8505;</span>
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
        <div className="dashboard-tracking-row">
          <div className="dashboard-card">
            <div className="dashboard-card-icon">&#10067;</div>
            <h2 className="dashboard-card-title">Questions Tracking</h2>
            <p className="dashboard-card-empty">No Questions Tracked</p>
            <p className="dashboard-card-msg">Complete your profile to start tracking.</p>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">&#128193;</div>
            <h2 className="dashboard-card-title">Project Tracking</h2>
            <p className="dashboard-card-empty">No Projects Tracked</p>
            <p className="dashboard-card-msg">Complete your profile to start tracking.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;