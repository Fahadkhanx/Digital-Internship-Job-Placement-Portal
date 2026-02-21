import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const AdminDashboard = () => {
  const [employers, setEmployers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [userFilterType, setUserFilterType] = useState('all');
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('employers'); // 'employers' or 'users'
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDuration, setBanDuration] = useState('3days');
  const [banReason, setBanReason] = useState('');
  const [deactivateDuration, setDeactivateDuration] = useState('3days');
  const [newRole, setNewRole] = useState('Student');

  useEffect(() => {
    fetchStats();
    if (activeTab === 'employers') {
      fetchEmployers();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [filterStatus, activeTab, userFilterType, userFilterStatus]);

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

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      let url = '/admin/users?';
      if (userFilterType !== 'all') {
        url += `userType=${userFilterType}&`;
      }
      if (userFilterStatus !== 'all') {
        url += `status=${userFilterStatus}`;
      }
      const response = await api.get(url);
      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
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
      const response = await api.put(`/admin/employers/${employerId}/reject`, {});
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

  const handleBanUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await api.put(`/admin/users/${selectedUser.userId}/ban`, {
        duration: banDuration,
        reason: banReason
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowBanModal(false);
        setSelectedUser(null);
        setBanReason('');
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;
    
    try {
      const response = await api.put(`/admin/users/${userId}/unban`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unban user');
    }
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await api.put(`/admin/users/${selectedUser.userId}/deactivate`, {
        duration: deactivateDuration,
        reason: banReason
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowDeactivateModal(false);
        setSelectedUser(null);
        setBanReason('');
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleActivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to activate this user?')) return;
    
    try {
      const response = await api.put(`/admin/users/${userId}/activate`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await api.put(`/admin/users/${selectedUser.userId}/role`, {
        userType: newRole
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowRoleModal(false);
        setSelectedUser(null);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change user role');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone and will delete all associated data.`)) return;
    
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getUserStatusBadge = (user) => {
    if (user.isBanned) {
      return <span className="status-badge status-rejected">Banned</span>;
    }
    if (!user.isActive) {
      return <span className="status-badge status-pending">Inactive</span>;
    }
    return <span className="status-badge status-verified">Active</span>;
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, employers, and system statistics</p>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'employers' ? 'active' : ''}`}
            onClick={() => setActiveTab('employers')}
          >
            Employers
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            All Users
          </button>
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
          {activeTab === 'employers' && (
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
          )}

          {activeTab === 'users' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>User Management</h2>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${userFilterType === 'all' ? 'active' : ''}`}
                  onClick={() => setUserFilterType('all')}
                >
                  All Types
                </button>
                <button
                  className={`filter-btn ${userFilterType === 'Student' ? 'active' : ''}`}
                  onClick={() => setUserFilterType('Student')}
                >
                  Students
                </button>
                <button
                  className={`filter-btn ${userFilterType === 'Employer' ? 'active' : ''}`}
                  onClick={() => setUserFilterType('Employer')}
                >
                  Employers
                </button>
                <button
                  className={`filter-btn ${userFilterType === 'Admin' ? 'active' : ''}`}
                  onClick={() => setUserFilterType('Admin')}
                >
                  Admins
                </button>
              </div>
              <div className="filter-buttons" style={{ marginTop: '10px' }}>
                <button
                  className={`filter-btn ${userFilterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setUserFilterStatus('all')}
                >
                  All Status
                </button>
                <button
                  className={`filter-btn ${userFilterStatus === 'active' ? 'active' : ''}`}
                  onClick={() => setUserFilterStatus('active')}
                >
                  Active
                </button>
                <button
                  className={`filter-btn ${userFilterStatus === 'inactive' ? 'active' : ''}`}
                  onClick={() => setUserFilterStatus('inactive')}
                >
                  Inactive
                </button>
                <button
                  className={`filter-btn ${userFilterStatus === 'banned' ? 'active' : ''}`}
                  onClick={() => setUserFilterStatus('banned')}
                >
                  Banned
                </button>
              </div>
            </div>

            {usersLoading ? (
              <LoadingSpinner message="Loading users..." />
            ) : users.length === 0 ? (
              <div className="empty-state">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="users-list">
                {users.map((user) => (
                  <div key={user.userId} className="user-item">
                    <div className="user-item-content">
                      <div className="user-header">
                        <h3>{user.email}</h3>
                        {getUserStatusBadge(user)}
                      </div>
                      <div className="user-info">
                        <p><strong>User ID:</strong> {user.userId}</p>
                        <p><strong>Type:</strong> {user.userType}</p>
                        <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
                        {user.isBanned && user.bannedUntil && (
                          <p><strong>Banned Until:</strong> {new Date(user.bannedUntil).toLocaleString()}</p>
                        )}
                        {user.banReason && (
                          <p><strong>Reason:</strong> {user.banReason}</p>
                        )}
                        <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="user-item-actions">
                      {!user.isBanned && user.isActive && (
                        <>
                          <button
                            className="btn-ban"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBanModal(true);
                            }}
                          >
                            🚫 Ban
                          </button>
                          <button
                            className="btn-deactivate"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeactivateModal(true);
                            }}
                          >
                            ⏸ Deactivate
                          </button>
                        </>
                      )}
                      {user.isBanned && (
                        <button
                          className="btn-verify"
                          onClick={() => handleUnbanUser(user.userId)}
                        >
                          ✅ Unban
                        </button>
                      )}
                      {!user.isActive && !user.isBanned && (
                        <button
                          className="btn-verify"
                          onClick={() => handleActivateUser(user.userId)}
                        >
                          ✅ Activate
                        </button>
                      )}
                      <button
                        className="btn-view"
                        onClick={() => {
                          setSelectedUser(user);
                          // Set default to different role than current
                          if (user.userType === 'Student') {
                            setNewRole('Employer');
                          } else if (user.userType === 'Employer') {
                            setNewRole('Student');
                          } else {
                            setNewRole('Student');
                          }
                          setShowRoleModal(true);
                        }}
                      >
                        🔄 Change Role
                      </button>
                      {user.userType !== 'Admin' && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user.userId, user.email)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
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

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="modal-overlay" onClick={() => { setShowBanModal(false); setSelectedUser(null); setBanReason(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ban User: {selectedUser.email}</h2>
              <button className="modal-close" onClick={() => { setShowBanModal(false); setSelectedUser(null); setBanReason(''); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Duration</label>
                <select value={banDuration} onChange={(e) => setBanDuration(e.target.value)}>
                  <option value="3days">3 Days</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reason (Optional)</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for banning this user..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ban" onClick={handleBanUser}>
                Ban User
              </button>
              <button className="btn-secondary" onClick={() => { setShowBanModal(false); setSelectedUser(null); setBanReason(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate User Modal */}
      {showDeactivateModal && selectedUser && (
        <div className="modal-overlay" onClick={() => { setShowDeactivateModal(false); setSelectedUser(null); setBanReason(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Deactivate User: {selectedUser.email}</h2>
              <button className="modal-close" onClick={() => { setShowDeactivateModal(false); setSelectedUser(null); setBanReason(''); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Duration</label>
                <select value={deactivateDuration} onChange={(e) => setDeactivateDuration(e.target.value)}>
                  <option value="3days">3 Days</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reason (Optional)</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for deactivating this user..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-deactivate" onClick={handleDeactivateUser}>
                Deactivate User
              </button>
              <button className="btn-secondary" onClick={() => { setShowDeactivateModal(false); setSelectedUser(null); setBanReason(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => { setShowRoleModal(false); setSelectedUser(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Role: {selectedUser.email}</h2>
              <button className="modal-close" onClick={() => { setShowRoleModal(false); setSelectedUser(null); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Role: {selectedUser.userType}</label>
                <label>New Role</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="Student">Student</option>
                  <option value="Employer">Employer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <p style={{ color: '#ff6b6b', marginTop: '10px' }}>
                ⚠️ Warning: Changing user role may affect their access and data. Admin role grants full system access.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-view" onClick={handleChangeRole}>
                Change Role
              </button>
              <button className="btn-secondary" onClick={() => { setShowRoleModal(false); setSelectedUser(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

