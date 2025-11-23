import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const AdminDashboard = () => {
  const [employers, setEmployers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchEmployers();
  }, [filterStatus]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all' 
        ? '/admin/employers' 
        : `/admin/employers?status=${filterStatus}`;
      const response = await api.get(url);
      if (response.data.success) {
        setEmployers(response.data.employers || []);
      }
    } catch (error) {
      console.error('Error fetching employers:', error);
      toast.error('Failed to load employers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (employerId) => {
    if (!window.confirm('Are you sure you want to verify this employer?')) return;
    
    try {
      const response = await api.put(`/admin/employers/${employerId}/verify`);
      if (response.data.success) {
        toast.success('Employer verified successfully');
        fetchEmployers();
        fetchStats();
        if (selectedEmployer?.employerId === employerId) {
          setShowDetails(false);
          setSelectedEmployer(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify employer');
    }
  };

  const handleReject = async (employerId) => {
    if (!window.confirm('Are you sure you want to reject this employer?')) return;
    
    try {
      const response = await api.put(`/admin/employers/${employerId}/reject`);
      if (response.data.success) {
        toast.success('Employer rejected successfully');
        fetchEmployers();
        fetchStats();
        if (selectedEmployer?.employerId === employerId) {
          setShowDetails(false);
          setSelectedEmployer(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject employer');
    }
  };

  const viewDetails = async (employerId) => {
    try {
      const response = await api.get(`/admin/employers/${employerId}`);
      if (response.data.success) {
        setSelectedEmployer(response.data.employer);
        setShowDetails(true);
      }
    } catch (error) {
      toast.error('Failed to load employer details');
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      'Pending': 'status-pending',
      'Verified': 'status-verified',
      'Rejected': 'status-rejected'
    }[status] || '';

    return (
      <span className={`status-badge ${statusClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage employer verifications and system statistics</p>
        </div>

        {stats && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-info">
                <h3>{stats.totalEmployers}</h3>
                <p>Total Employers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pendingEmployers}</h3>
                <p>Pending Verification</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.verifiedEmployers}</h3>
                <p>Verified Employers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.totalStudents}</h3>
                <p>Total Students</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💼</div>
              <div className="stat-info">
                <h3>{stats.activeJobs}</h3>
                <p>Active Jobs</p>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Employer Verifications</h2>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('Pending')}
                >
                  Pending ({stats?.pendingEmployers || 0})
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'Verified' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('Verified')}
                >
                  Verified
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'Rejected' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('Rejected')}
                >
                  Rejected
                </button>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading employers..." />
            ) : employers.length === 0 ? (
              <div className="empty-state">
                <p>No employers found.</p>
              </div>
            ) : (
              <div className="employers-list">
                {employers.map((employer) => (
                  <div key={employer.employerId} className="employer-item">
                    <div className="employer-item-content">
                      <div className="employer-header">
                        <h3>{employer.companyName}</h3>
                        {getStatusBadge(employer.verificationStatus)}
                      </div>
                      <div className="employer-info">
                        <p><strong>Email:</strong> {employer.userEmail}</p>
                        {employer.industry && <p><strong>Industry:</strong> {employer.industry}</p>}
                        {employer.city && <p><strong>Location:</strong> {employer.city}, {employer.country || ''}</p>}
                        {employer.website && (
                          <p>
                            <strong>Website:</strong>{' '}
                            <a href={employer.website} target="_blank" rel="noopener noreferrer">
                              {employer.website}
                            </a>
                          </p>
                        )}
                        {employer.verifiedAt && (
                          <p className="verification-date">
                            <strong>Verified:</strong> {new Date(employer.verifiedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="employer-item-actions">
                      <button className="btn-view" onClick={() => viewDetails(employer.employerId)}>
                        View Details
                      </button>
                      {employer.verificationStatus === 'Pending' && (
                        <>
                          <button
                            className="btn-verify"
                            onClick={() => handleVerify(employer.employerId)}
                          >
                            ✓ Verify
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(employer.employerId)}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employer Details Modal */}
      {showDetails && selectedEmployer && (
        <div className="modal-overlay" onClick={() => { setShowDetails(false); setSelectedEmployer(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEmployer.companyName}</h2>
              <button className="modal-close" onClick={() => { setShowDetails(false); setSelectedEmployer(null); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Company Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Company Name</label>
                    <p>{selectedEmployer.companyName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedEmployer.userEmail}</p>
                  </div>
                  {selectedEmployer.industry && (
                    <div className="detail-item">
                      <label>Industry</label>
                      <p>{selectedEmployer.industry}</p>
                    </div>
                  )}
                  {selectedEmployer.website && (
                    <div className="detail-item">
                      <label>Website</label>
                      <p>
                        <a href={selectedEmployer.website} target="_blank" rel="noopener noreferrer">
                          {selectedEmployer.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {selectedEmployer.phone && (
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{selectedEmployer.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedEmployer.companyDescription && (
                <div className="detail-section">
                  <h3>Company Description</h3>
                  <p>{selectedEmployer.companyDescription}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>Location</h3>
                <div className="detail-grid">
                  {selectedEmployer.address && (
                    <div className="detail-item full-width">
                      <label>Address</label>
                      <p>{selectedEmployer.address}</p>
                    </div>
                  )}
                  {selectedEmployer.city && (
                    <div className="detail-item">
                      <label>City</label>
                      <p>{selectedEmployer.city}</p>
                    </div>
                  )}
                  {selectedEmployer.country && (
                    <div className="detail-item">
                      <label>Country</label>
                      <p>{selectedEmployer.country}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Verification Status</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Status</label>
                    <p>{getStatusBadge(selectedEmployer.verificationStatus)}</p>
                  </div>
                  {selectedEmployer.verifiedAt && (
                    <div className="detail-item">
                      <label>Verified At</label>
                      <p>{new Date(selectedEmployer.verifiedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedEmployer.verificationStatus === 'Pending' && (
                <>
                  <button
                    className="btn-verify"
                    onClick={() => {
                      handleVerify(selectedEmployer.employerId);
                      setShowDetails(false);
                      setSelectedEmployer(null);
                    }}
                  >
                    ✓ Verify Employer
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => {
                      handleReject(selectedEmployer.employerId);
                      setShowDetails(false);
                      setSelectedEmployer(null);
                    }}
                  >
                    ✗ Reject Employer
                  </button>
                </>
              )}
              <button className="btn-secondary" onClick={() => { setShowDetails(false); setSelectedEmployer(null); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

