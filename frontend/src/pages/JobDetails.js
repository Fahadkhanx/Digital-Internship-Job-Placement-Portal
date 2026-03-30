import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { authService } from '../services/authService';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJob();
    if (authService.isAuthenticated() && authService.getUserType() === 'Student') {
      checkApplicationStatus();
      checkBookmarkStatus();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      if (response.data.success) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get(`/applications/check/${id}`);
      if (response.data.success) {
        setHasApplied(response.data.hasApplied);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const response = await api.get(`/bookmarks/check/${id}`);
      if (response.data.success) {
        setIsBookmarked(response.data.isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleApply = () => {
    if (!authService.isAuthenticated()) {
      toast.info('Please login to apply for this job');
      navigate('/login');
      return;
    }
    if (authService.getUserType() !== 'Student') {
      toast.error('Only students can apply for jobs');
      return;
    }
    if (hasApplied) {
      toast.info('You have already applied for this job');
      return;
    }
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    setApplying(true);
    try {
      const response = await api.post('/applications/apply', {
        jobId: parseInt(id),
        coverLetter: coverLetter
      });
      if (response.data.success) {
        toast.success('Application submitted successfully!');
        setHasApplied(true);
        setShowApplyModal(false);
        setCoverLetter('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    if (!authService.isAuthenticated()) {
      toast.info('Please login to bookmark jobs');
      navigate('/login');
      return;
    }
    if (authService.getUserType() !== 'Student') {
      return;
    }
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        await api.post(`/bookmarks/${id}`);
        setIsBookmarked(true);
        toast.success('Job bookmarked');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bookmark');
    }
  };

  if (loading) {
    return (
      <div className="job-details">
        <LoadingSpinner message="Loading job details..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details">
        <div className="container">
          <div className="error-message">
            <h2>Job Not Found</h2>
            <p>The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/jobs" className="btn-back">Browse Other Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details">
      <div className="container">
        <Link to="/jobs" className="back-link">← Back to Jobs</Link>
        
        <div className="job-header">
          <div className="job-title-section">
            <h1>{job.title}</h1>
            <div className="job-meta-info">
              <span className="company-name">{job.companyName}</span>
              <span className="separator">•</span>
              <span className="location">📍 {job.location || 'Remote'}</span>
              {job.remoteOption && <span className="remote-badge">Remote Available</span>}
            </div>
          </div>
          <div className="job-type-badge-large">
            {job.jobType}
          </div>
        </div>

        <div className="job-content-grid">
          <div className="job-main-content">
            <div className="job-section">
              <h2>Job Description</h2>
              <div className="job-description-text">
                {job.description?.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {job.requiredSkills && (
              <div className="job-section">
                <h2>Required Skills</h2>
                <div className="skills-list">
                  {job.requiredSkills.split(',').map((skill, index) => (
                    <span key={index} className="skill-tag">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {job.requiredEducation && (
              <div className="job-section">
                <h2>Required Education</h2>
                <p>{job.requiredEducation}</p>
              </div>
            )}

            {job.experienceLevel && (
              <div className="job-section">
                <h2>Experience Level</h2>
                <p>{job.experienceLevel}</p>
              </div>
            )}
          </div>

          <div className="job-sidebar">
            <div className="job-apply-card">
              {job.salaryMin && job.salaryMax && (
                <div className="salary-info">
                  <h3>Salary Range</h3>
                  <p className="salary-amount">
                    ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.currency || 'USD'}
                  </p>
                </div>
              )}

              {job.applicationDeadline && (
                <div className="deadline-info">
                  <h3>Application Deadline</h3>
                  <p>{new Date(job.applicationDeadline).toLocaleDateString()}</p>
                </div>
              )}

              <button 
                className={`btn-apply ${hasApplied ? 'applied' : ''}`}
                onClick={handleApply}
                disabled={applying || hasApplied}
              >
                {hasApplied ? '✓ Applied' : applying ? 'Applying...' : 'Apply Now'}
              </button>

              {authService.isAuthenticated() && authService.getUserType() === 'Student' && (
                <button 
                  className={`btn-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={handleBookmark}
                >
                  {isBookmarked ? '✓ Saved' : '💾 Save Job'}
                </button>
              )}
            </div>

            <div className="company-info-card">
              <h3>About {job.companyName}</h3>
              {job.companyDescription && (
                <p>{job.companyDescription}</p>
              )}
              {job.companyWebsite && (
                <a 
                  href={job.companyWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="company-website"
                >
                  Visit Company Website →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Apply for {job.title}</h2>
            <div className="form-group">
              <label>Cover Letter (Optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="6"
                placeholder="Tell the employer why you're a good fit for this position..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowApplyModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={submitApplication} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;

