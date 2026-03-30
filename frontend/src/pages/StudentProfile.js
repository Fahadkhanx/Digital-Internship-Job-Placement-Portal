import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './StudentProfile.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    bio: ''
  });
  const [educationForm, setEducationForm] = useState({
    institutionName: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    gpa: '',
    description: ''
  });
  const [skillForm, setSkillForm] = useState({
    skillName: '',
    proficiencyLevel: 'Beginner'
  });

  useEffect(() => {
    fetchProfile();
    fetchEducations();
    fetchSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/students/profile');
      if (response.data.success) {
        const student = response.data.student;
        setProfile(student);
        setFormData({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          phone: student.phone || '',
          dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
          address: student.address || '',
          city: student.city || '',
          country: student.country || '',
          bio: student.bio || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchEducations = async () => {
    try {
      const response = await api.get('/students/education');
      if (response.data.success) {
        setEducations(response.data.educations || []);
      }
    } catch (error) {
      console.error('Error fetching educations:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get('/students/skills');
      if (response.data.success) {
        setSkills(response.data.skills || []);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Prepare data for API - convert date string to proper format and handle empty strings
      const updateData = {
        firstName: formData.firstName.trim() || null,
        lastName: formData.lastName.trim() || null,
        phone: formData.phone.trim() || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth + 'T00:00:00').toISOString() : null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null,
        bio: formData.bio.trim() || null
      };

      // Validate required fields
      if (!updateData.firstName || !updateData.lastName) {
        toast.error('First Name and Last Name are required');
        return;
      }

      const response = await api.put('/students/profile', updateData);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/students/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        toast.success('Resume uploaded successfully');
        fetchProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    }
  };

  const handleAddEducation = () => {
    setEducationForm({
      institutionName: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    });
    setEditingEducation(null);
    setShowEducationForm(true);
  };

  const handleEditEducation = (edu) => {
    setEducationForm({
      institutionName: edu.institutionName || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate ? edu.startDate.split('T')[0] : '',
      endDate: edu.endDate ? edu.endDate.split('T')[0] : '',
      gpa: edu.gpa || '',
      description: edu.description || ''
    });
    setEditingEducation(edu);
    setShowEducationForm(true);
  };

  const handleSaveEducation = async (e) => {
    e.preventDefault();
    try {
      const educationData = {
        institutionName: educationForm.institutionName,
        degree: educationForm.degree,
        fieldOfStudy: educationForm.fieldOfStudy || null,
        startDate: educationForm.startDate ? new Date(educationForm.startDate + 'T00:00:00').toISOString() : null,
        endDate: educationForm.endDate ? new Date(educationForm.endDate + 'T00:00:00').toISOString() : null,
        gpa: educationForm.gpa ? parseFloat(educationForm.gpa) : null,
        description: educationForm.description || null
      };

      if (editingEducation) {
        await api.put(`/students/education/${editingEducation.educationId}`, educationData);
        toast.success('Education updated successfully');
      } else {
        await api.post('/students/education', educationData);
        toast.success('Education added successfully');
      }
      setShowEducationForm(false);
      setEditingEducation(null);
      fetchEducations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save education');
    }
  };

  const handleDeleteEducation = async (educationId) => {
    if (!window.confirm('Are you sure you want to delete this education?')) return;
    try {
      await api.delete(`/students/education/${educationId}`);
      toast.success('Education deleted successfully');
      fetchEducations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete education');
    }
  };

  const handleAddSkill = () => {
    setSkillForm({
      skillName: '',
      proficiencyLevel: 'Beginner'
    });
    setEditingSkill(null);
    setShowSkillForm(true);
  };

  const handleEditSkill = (skill) => {
    setSkillForm({
      skillName: skill.skillName || '',
      proficiencyLevel: skill.proficiencyLevel || 'Beginner'
    });
    setEditingSkill(skill);
    setShowSkillForm(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      const skillData = {
        skillName: skillForm.skillName,
        proficiencyLevel: skillForm.proficiencyLevel
      };

      if (editingSkill) {
        await api.put(`/students/skills/${editingSkill.skillId}`, skillData);
        toast.success('Skill updated successfully');
      } else {
        await api.post('/students/skills', skillData);
        toast.success('Skill added successfully');
      }
      setShowSkillForm(false);
      setEditingSkill(null);
      fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await api.delete(`/students/skills/${skillId}`);
      toast.success('Skill deleted successfully');
      fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete skill');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="student-profile">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <button 
            className="btn-edit" 
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-main">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>Personal Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!editing}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!editing}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!editing}
                    rows="4"
                  />
                </div>
                {editing && (
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>

            <div className="form-section">
              <h2>Resume</h2>
              {profile?.resumeUrl ? (
                <div className="resume-info">
                  <a 
                    href={`http://localhost:5000/api/files/resume/${profile.resumeUrl.split('/').pop()}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    📄 View Resume
                  </a>
                  <span className="resume-url">({profile.resumeUrl})</span>
                </div>
              ) : (
                <p>No resume uploaded</p>
              )}
              <label className="btn-upload">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                Upload Resume (PDF, DOC, DOCX)
              </label>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h2>Education</h2>
                <button type="button" className="btn-add" onClick={handleAddEducation}>
                  + Add Education
                </button>
              </div>
              {educations.length > 0 ? (
                <div className="education-list">
                  {educations.map((edu) => (
                    <div key={edu.educationId} className="education-item">
                      <div className="education-content">
                        <h3>{edu.institutionName}</h3>
                        <p><strong>{edu.degree}</strong> {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}</p>
                        <p>
                          {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - 
                          {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                        </p>
                        {edu.gpa && <p>GPA: {edu.gpa}</p>}
                        {edu.description && <p className="description">{edu.description}</p>}
                      </div>
                      <div className="education-actions">
                        <button className="btn-edit-small" onClick={() => handleEditEducation(edu)}>
                          Edit
                        </button>
                        <button className="btn-delete-small" onClick={() => handleDeleteEducation(edu.educationId)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No education added. Click "Add Education" to add your educational background.</p>
              )}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h2>Skills</h2>
                <button type="button" className="btn-add" onClick={handleAddSkill}>
                  + Add Skill
                </button>
              </div>
              {skills.length > 0 ? (
                <div className="skills-list">
                  {skills.map((skill) => (
                    <div key={skill.skillId} className="skill-item">
                      <span className="skill-tag">
                        {skill.skillName} ({skill.proficiencyLevel})
                      </span>
                      <div className="skill-actions">
                        <button className="btn-edit-small" onClick={() => handleEditSkill(skill)}>
                          Edit
                        </button>
                        <button className="btn-delete-small" onClick={() => handleDeleteSkill(skill.skillId)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No skills added. Click "Add Skill" to add your skills.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Education Form Modal */}
      {showEducationForm && (
        <div className="modal-overlay" onClick={() => { setShowEducationForm(false); setEditingEducation(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEducation ? 'Edit Education' : 'Add Education'}</h2>
            <form onSubmit={handleSaveEducation}>
              <div className="form-group">
                <label>Institution Name *</label>
                <input
                  type="text"
                  value={educationForm.institutionName}
                  onChange={(e) => setEducationForm({...educationForm, institutionName: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Degree *</label>
                  <input
                    type="text"
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Field of Study</label>
                  <input
                    type="text"
                    value={educationForm.fieldOfStudy}
                    onChange={(e) => setEducationForm({...educationForm, fieldOfStudy: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={educationForm.startDate}
                    onChange={(e) => setEducationForm({...educationForm, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={educationForm.endDate}
                    onChange={(e) => setEducationForm({...educationForm, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={educationForm.gpa}
                  onChange={(e) => setEducationForm({...educationForm, gpa: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={educationForm.description}
                  onChange={(e) => setEducationForm({...educationForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowEducationForm(false); setEditingEducation(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingEducation ? 'Update' : 'Add'} Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skill Form Modal */}
      {showSkillForm && (
        <div className="modal-overlay" onClick={() => { setShowSkillForm(false); setEditingSkill(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSkill ? 'Edit Skill' : 'Add Skill'}</h2>
            <form onSubmit={handleSaveSkill}>
              <div className="form-group">
                <label>Skill Name *</label>
                <input
                  type="text"
                  value={skillForm.skillName}
                  onChange={(e) => setSkillForm({...skillForm, skillName: e.target.value})}
                  placeholder="e.g., JavaScript, React, Python"
                  required
                />
              </div>
              <div className="form-group">
                <label>Proficiency Level *</label>
                <select
                  value={skillForm.proficiencyLevel}
                  onChange={(e) => setSkillForm({...skillForm, proficiencyLevel: e.target.value})}
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowSkillForm(false); setEditingSkill(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingSkill ? 'Update' : 'Add'} Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;

