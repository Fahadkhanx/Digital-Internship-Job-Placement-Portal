import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './StudentProfile.css';

const EmployerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/employers/profile');
      if (response.data.success) {
        const employer = response.data.employer;
        setProfile(employer);
        setFormData({
          companyName: employer.companyName || '',
          companyDescription: employer.companyDescription || '',
          industry: employer.industry || '',
          website: employer.website || '',
          phone: employer.phone || '',
          address: employer.address || '',
          city: employer.city || '',
          country: employer.country || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        ...formData,
        companyName: formData.companyName.trim() || null,
        companyDescription: formData.companyDescription.trim() || null,
        industry: formData.industry.trim() || null,
        website: formData.website.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null
      };

      const response = await api.put('/employers/profile', updateData);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/employers/upload/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Logo uploaded successfully');
        fetchProfile();
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = ''; // Reset file input
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-header">
          <h1>Company Profile</h1>
          <p>Manage your company information and logo</p>
        </div>

        <div className="profile-content">
          <div className="profile-form">
            {!editing ? (
              <div className="profile-view">
                <div className="profile-actions">
                  <button className="btn-primary" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                </div>

                <div className="profile-info">
                  <div className="profile-section">
                    <div className="logo-section">
                      {profile?.logoUrl ? (
                        <img 
                          src={`http://localhost:5000${profile.logoUrl}`} 
                          alt="Company Logo" 
                          className="company-logo"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Logo';
                          }}
                        />
                      ) : (
                        <div className="logo-placeholder">
                          <span>No Logo</span>
                        </div>
                      )}
                      <div className="logo-upload-section">
                        <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            style={{ display: 'none' }}
                            disabled={uploadingLogo}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h2>Company Information</h2>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Company Name</label>
                        <p>{profile?.companyName || 'Not provided'}</p>
                      </div>
                      <div className="info-item">
                        <label>Industry</label>
                        <p>{profile?.industry || 'Not provided'}</p>
                      </div>
                      <div className="info-item">
                        <label>Website</label>
                        <p>
                          {profile?.website ? (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer">
                              {profile.website}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      </div>
                      <div className="info-item">
                        <label>Phone</label>
                        <p>{profile?.phone || 'Not provided'}</p>
                      </div>
                      <div className="info-item full-width">
                        <label>Company Description</label>
                        <p>{profile?.companyDescription || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h2>Location</h2>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Address</label>
                        <p>{profile?.address || 'Not provided'}</p>
                      </div>
                      <div className="info-item">
                        <label>City</label>
                        <p>{profile?.city || 'Not provided'}</p>
                      </div>
                      <div className="info-item">
                        <label>Country</label>
                        <p>{profile?.country || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h2>Verification Status</h2>
                    <div className="info-item">
                      <label>Status</label>
                      <p>
                        <span className={`status-badge ${profile?.verificationStatus === 'Verified' ? 'status-active' : 'status-inactive'}`}>
                          {profile?.verificationStatus || 'Pending'}
                        </span>
                      </p>
                    </div>
                    {profile?.verificationStatus !== 'Verified' && (
                      <p className="verification-note">
                        Your account is pending verification. You can update your profile, but job postings will require verification.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-actions-header">
                  <h2>Edit Company Profile</h2>
                  <div>
                    <button type="button" className="btn-secondary" onClick={() => { setEditing(false); fetchProfile(); }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="form-section">
                  <h2>Company Information</h2>
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://www.example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Description</label>
                    <textarea
                      value={formData.companyDescription}
                      onChange={(e) => setFormData({...formData, companyDescription: e.target.value})}
                      rows="5"
                      placeholder="Describe your company, its mission, and what makes it unique..."
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2>Location</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => { setEditing(false); fetchProfile(); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;

