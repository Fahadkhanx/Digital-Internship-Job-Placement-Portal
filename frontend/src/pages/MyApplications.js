import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      if (response.data.success) {
        setApplications(response.data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'reviewed': return 'status-reviewed';
      case 'shortlisted': return 'status-shortlisted';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading applications..." />;
  }

  return (
    <div className="my-applications">
      <div className="container">
        <div className="page-header">
          <h1>My Applications</h1>
          <p>Track all your job applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app.applicationId} className="application-card">
                <div className="application-header">
                  <div className="application-info">
                    <h3>
                      <Link to={`/jobs/${app.job?.jobId}`}>
                        {app.job?.title}
                      </Link>
                    </h3>
                    <p className="company-name">{app.job?.employer?.companyName}</p>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <div className="application-details">
                  <div className="detail-item">
                    <span className="label">Applied on:</span>
                    <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                  {app.reviewedAt && (
                    <div className="detail-item">
                      <span className="label">Reviewed on:</span>
                      <span>{new Date(app.reviewedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {app.feedback && (
                    <div className="detail-item">
                      <span className="label">Feedback:</span>
                      <span>{app.feedback}</span>
                    </div>
                  )}
                </div>
                {app.coverLetter && (
                  <div className="cover-letter">
                    <strong>Cover Letter:</strong>
                    <p>{app.coverLetter}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;

