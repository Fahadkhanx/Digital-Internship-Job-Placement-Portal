import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const StudentDashboard = () => {
  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p>Welcome to your dashboard. Manage your profile, applications, and more.</p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Applications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💾</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Saved Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📧</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Messages</p>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/jobs" className="action-btn">
                🔍 Browse Jobs
              </Link>
              <button className="action-btn">
                ✏️ Edit Profile
              </button>
              <button className="action-btn">
                📄 Upload Resume
              </button>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Recent Applications</h2>
            <div className="empty-state">
              <p>You haven't applied to any jobs yet.</p>
              <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Recommended Jobs</h2>
            <div className="empty-state">
              <p>Complete your profile to get job recommendations.</p>
              <button className="btn-primary">Complete Profile</button>
            </div>
          </div>
        </div>

        <div className="dashboard-note">
          <p><strong>Note:</strong> Week 6 - Full dashboard functionality including profile management, application tracking, and messaging will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

