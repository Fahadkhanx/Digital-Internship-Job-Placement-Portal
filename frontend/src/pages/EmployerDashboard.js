import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const EmployerDashboard = () => {
  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Employer Dashboard</h1>
          <p>Manage your job postings, applications, and company profile.</p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📥</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Applications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Shortlisted</p>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="action-btn">
                ➕ Post New Job
              </button>
              <button className="action-btn">
                🔍 Search Students
              </button>
              <button className="action-btn">
                ✏️ Edit Company Profile
              </button>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Recent Job Postings</h2>
            <div className="empty-state">
              <p>You haven't posted any jobs yet.</p>
              <button className="btn-primary">Post Your First Job</button>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Recent Applications</h2>
            <div className="empty-state">
              <p>No applications yet. Start posting jobs to receive applications.</p>
              <button className="btn-primary">Post a Job</button>
            </div>
          </div>
        </div>

        <div className="dashboard-note">
          <p><strong>Note:</strong> Week 6 - Full dashboard functionality including job posting, application management, and student search will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;

