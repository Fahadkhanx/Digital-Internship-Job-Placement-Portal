import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: 'Internship',
    location: '',
    remoteOption: false,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    requiredSkills: '',
    requiredEducation: '',
    experienceLevel: 'Entry',
    applicationDeadline: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/my-jobs');
      if (response.data.success) {
        const jobsList = response.data.jobs || [];
        setJobs(jobsList);
        
        // Calculate statistics
        const totalJobs = jobsList.length;
        const activeJobs = jobsList.filter(j => j.isActive).length;
        let totalApplications = 0;
        let pendingApplications = 0;
        
        // Fetch applications for each job to get accurate counts
        for (const job of jobsList) {
          try {
            const appResponse = await api.get(`/applications/job/${job.jobId}`);
            if (appResponse.data.success) {
              const jobApps = appResponse.data.applications || [];
              totalApplications += jobApps.length;
              pendingApplications += jobApps.filter(app => app.status === 'Pending').length;
            }
          } catch (err) {
            // Ignore errors for individual job applications
          }
        }
        
        setStats({
          totalJobs,
          activeJobs,
          totalApplications,
          pendingApplications
        });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        applicationDeadline: formData.applicationDeadline || null
      };

      if (editingJob) {
        await api.put(`/jobs/${editingJob.jobId}`, payload);
        toast.success('Job updated successfully');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job posted successfully');
      }
      setShowJobForm(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      jobType: job.jobType || 'Internship',
      location: job.location || '',
      remoteOption: job.remoteOption || false,
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      currency: job.currency || 'USD',
      requiredSkills: job.requiredSkills || '',
      requiredEducation: job.requiredEducation || '',
      experienceLevel: job.experienceLevel || 'Entry',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : ''
    });
    setShowJobForm(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      jobType: 'Internship',
      location: '',
      remoteOption: false,
      salaryMin: '',
      salaryMax: '',
      currency: 'USD',
      requiredSkills: '',
      requiredEducation: '',
      experienceLevel: 'Entry',
      applicationDeadline: ''
    });
  };

  const fetchApplications = async (jobId) => {
    try {
      setLoadingApplications(true);
      const response = await api.get(`/applications/job/${jobId}`);
      if (response.data.success) {
        setApplications(response.data.applications || []);
        setShowApplications(true);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await api.put(`/applications/${applicationId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success('Application status updated successfully');
        // Update the application in the list
        setApplications(applications.map(app => 
          app.applicationId === applicationId 
            ? { ...app, status: newStatus, reviewedAt: new Date().toISOString() }
            : app
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleViewApplications = (job) => {
    setSelectedJob(job);
    fetchApplications(job.jobId);
  };


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
              <h3>{stats.totalJobs}</h3>
              <p>Total Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.activeJobs}</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📥</div>
            <div className="stat-info">
              <h3>{stats.totalApplications}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingApplications}</h3>
              <p>Pending Reviews</p>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => { setShowJobForm(true); setEditingJob(null); resetForm(); }}>
                ➕ Post New Job
              </button>
              <Link to="/employer/profile" className="action-btn">✏️ Edit Company Profile</Link>
              <Link to="/messages" className="action-btn">💬 Messages</Link>
            </div>
          </div>

          {showJobForm && (
            <div className="dashboard-section job-form-section">
              <h2>{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <form onSubmit={handleSubmit} className="job-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Job Type *</label>
                    <select value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})} required>
                      <option value="Internship">Internship</option>
                      <option value="FullTime">Full Time</option>
                      <option value="PartTime">Part Time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="5" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Experience Level</label>
                    <select value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}>
                      <option value="Entry">Entry</option>
                      <option value="Junior">Junior</option>
                      <option value="Mid">Mid</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Salary Min</label>
                    <input type="number" value={formData.salaryMin} onChange={(e) => setFormData({...formData, salaryMin: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Salary Max</label>
                    <input type="number" value={formData.salaryMax} onChange={(e) => setFormData({...formData, salaryMax: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Required Skills</label>
                  <input type="text" value={formData.requiredSkills} onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} placeholder="e.g., JavaScript, React, Node.js" />
                </div>
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={formData.remoteOption} onChange={(e) => setFormData({...formData, remoteOption: e.target.checked})} />
                    Remote Work Available
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">{editingJob ? 'Update Job' : 'Post Job'}</button>
                  <button type="button" className="btn-secondary" onClick={() => { setShowJobForm(false); setEditingJob(null); resetForm(); }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="dashboard-section">
            <h2>My Job Postings</h2>
            {loading ? (
              <LoadingSpinner message="Loading jobs..." />
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <p>You haven't posted any jobs yet.</p>
                <button className="btn-primary" onClick={() => setShowJobForm(true)}>Post Your First Job</button>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job.jobId} className="job-item">
                    <div className="job-item-content">
                      <h3>{job.title}</h3>
                      <p className="job-meta-info">
                        <span>{job.jobType}</span> • <span>📍 {job.location || 'Remote'}</span> • <span>{job.applicationCount || 0} applications</span>
                      </p>
                      <span className={`status-badge ${job.isActive ? 'status-active' : 'status-inactive'}`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="job-item-actions">
                      <button className="btn-view" onClick={() => handleViewApplications(job)}>
                        View Applications ({job.applicationCount || 0})
                      </button>
                      <button className="btn-edit" onClick={() => handleEdit(job)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(job.jobId)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications Modal */}
      {showApplications && selectedJob && (
        <div className="modal-overlay" onClick={() => { setShowApplications(false); setSelectedJob(null); setApplications([]); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Applications for: {selectedJob.title}</h2>
              <button className="modal-close" onClick={() => { setShowApplications(false); setSelectedJob(null); setApplications([]); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {loadingApplications ? (
                <LoadingSpinner message="Loading applications..." />
              ) : applications.length === 0 ? (
                <div className="empty-state">
                  <p>No applications received yet for this job.</p>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map((application) => (
                    <div key={application.applicationId} className="application-item">
                      <div className="application-header">
                        <div>
                          <h3>
                            {application.student?.firstName} {application.student?.lastName}
                          </h3>
                          <p className="application-email">{application.student?.user?.email}</p>
                        </div>
                        <span className={`status-badge status-${application.status?.toLowerCase()}`}>
                          {application.status}
                        </span>
                      </div>
                      <div className="application-details">
                        <div className="application-info">
                          <div className="status-update-section">
                            <label><strong>Status:</strong></label>
                            <select
                              value={application.status || 'Pending'}
                              onChange={(e) => handleStatusUpdate(application.applicationId, e.target.value)}
                              className="status-select"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <span className={`status-badge status-${application.status?.toLowerCase()}`}>
                              {application.status}
                            </span>
                          </div>
                          <p><strong>Applied:</strong> {new Date(application.appliedAt).toLocaleString()}</p>
                          {application.reviewedAt && (
                            <p><strong>Reviewed:</strong> {new Date(application.reviewedAt).toLocaleString()}</p>
                          )}
                          {application.student?.phone && (
                            <p><strong>Phone:</strong> {application.student.phone}</p>
                          )}
                          {application.student?.city && (
                            <p><strong>Location:</strong> {application.student.city}, {application.student.country || ''}</p>
                          )}
                          {application.student?.resumeUrl && (
                            <p>
                              <strong>Resume:</strong>{' '}
                              <a 
                                href={`http://localhost:5000${application.student.resumeUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="resume-link"
                              >
                                View Resume
                              </a>
                            </p>
                          )}
                        </div>
                        {application.coverLetter && (
                          <div className="cover-letter">
                            <strong>Cover Letter:</strong>
                            <p>{application.coverLetter}</p>
                          </div>
                        )}
                        {application.student?.bio && (
                          <div className="student-bio">
                            <strong>About:</strong>
                            <p>{application.student.bio}</p>
                          </div>
                        )}
                        <div className="application-actions">
                          <button 
                            className="btn-message" 
                            onClick={() => {
                              if (application.student?.user?.userId) {
                                navigate(`/messages?userId=${application.student.user.userId}&applicationId=${application.applicationId}`);
                              } else {
                                toast.error('Unable to start conversation. Student user ID not found.');
                              }
                            }}
                          >
                            💬 Send Message
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowApplications(false); setSelectedJob(null); setApplications([]); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
