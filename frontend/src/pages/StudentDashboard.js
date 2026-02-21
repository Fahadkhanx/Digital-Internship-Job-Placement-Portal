import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ applications: 0, bookmarks: 0 });
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', jobType: '', location: '' });

  useEffect(() => {
    fetchStats();
    fetchRecentApplications();
    fetchJobs();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const fetchStats = async () => {
    try {
      const [appsRes, bookmarksRes] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/bookmarks')
      ]);
      setStats({
        applications: appsRes.data.applications?.length || 0,
        bookmarks: bookmarksRes.data.bookmarks?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      if (response.data.success) {
        setApplications(response.data.applications?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.location) params.append('location', filters.location);
      params.append('page', '1');
      params.append('limit', '6');

      const response = await api.get(`/jobs?${params.toString()}`);
      if (response.data.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <h3>{stats.applications}</h3>
              <p>Applications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💾</div>
            <div className="stat-info">
              <h3>{stats.bookmarks}</h3>
              <p>Saved Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-info">
              <h3>{jobs.length}</h3>
              <p>Available Jobs</p>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/jobs" className="action-btn">🔍 Browse Jobs</Link>
              <Link to="/student/profile" className="action-btn">✏️ Edit Profile</Link>
              <Link to="/student/applications" className="action-btn">📋 My Applications</Link>
              <Link to="/student/saved-jobs" className="action-btn">💾 Saved Jobs</Link>
              <Link to="/messages" className="action-btn">💬 Messages</Link>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/student/applications" className="view-all">View All →</Link>
            </div>
            {applications.length === 0 ? (
              <div className="empty-state">
                <p>You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
              </div>
            ) : (
              <div className="applications-preview">
                {applications.map((app) => (
                  <div key={app.applicationId} className="application-item">
                    <Link to={`/jobs/${app.job?.jobId}`}>
                      <h4>{app.job?.title}</h4>
                    </Link>
                    <p>{app.job?.employer?.companyName}</p>
                    <span className={`status-badge status-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Available Jobs</h2>
              <Link to="/jobs" className="view-all">View All →</Link>
            </div>
            <div className="filters">
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="filter-input"
              />
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="Internship">Internship</option>
                <option value="FullTime">Full Time</option>
                <option value="PartTime">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="filter-input"
              />
            </div>
            {loading ? (
              <LoadingSpinner message="Loading jobs..." />
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <p>No jobs found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <div key={job.jobId} className="job-card">
                    <h3><Link to={`/jobs/${job.jobId}`}>{job.title}</Link></h3>
                    <p className="company-name">{job.companyName}</p>
                    <div className="job-meta">
                      <span className="job-type">{job.jobType}</span>
                      <span className="location">📍 {job.location || 'Remote'}</span>
                    </div>
                    <Link to={`/jobs/${job.jobId}`} className="btn-view">View Details</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
