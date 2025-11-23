import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './SavedJobs.css';

const SavedJobs = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/bookmarks');
      if (response.data.success) {
        setBookmarks(response.data.bookmarks || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (jobId) => {
    try {
      await api.delete(`/bookmarks/${jobId}`);
      toast.success('Job removed from saved');
      fetchBookmarks();
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading saved jobs..." />;
  }

  return (
    <div className="saved-jobs">
      <div className="container">
        <div className="page-header">
          <h1>Saved Jobs</h1>
          <p>Your bookmarked jobs</p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <p>You haven't saved any jobs yet.</p>
            <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          <div className="jobs-grid">
            {bookmarks.map((bookmark) => {
              const job = bookmark.job;
              if (!job) return null;
              
              return (
                <div key={bookmark.bookmarkId} className="job-card">
                  <div className="job-card-header">
                    <h3>
                      <Link to={`/jobs/${job.jobId}`}>{job.title}</Link>
                    </h3>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveBookmark(job.jobId)}
                      title="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="company-name">{job.employer?.companyName}</p>
                  <div className="job-meta">
                    <span className="job-type">{job.jobType}</span>
                    <span className="location">📍 {job.location || 'Remote'}</span>
                  </div>
                  <div className="job-description">
                    {job.description?.substring(0, 150)}...
                  </div>
                  <div className="job-card-footer">
                    <Link to={`/jobs/${job.jobId}`} className="btn-view">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;

