import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './JobListings.css';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    location: '',
  });

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search || filters.jobType || filters.location) {
        fetchJobs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.location) params.append('location', filters.location);
      params.append('page', '1');
      params.append('limit', '20');

      const response = await api.get(`/jobs?${params.toString()}`);
      if (response.data.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
  };

  const handleApplyFilters = () => {
    fetchJobs();
  };

  return (
    <div className="job-listings">
      <div className="container">
        <div className="page-header">
          <h1>Job Listings</h1>
          <p>Find your dream internship or job opportunity</p>
        </div>
        <div className="filters-section">
          <div className="filters">
            <input
              type="text"
              placeholder="Search jobs by title or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              className="filter-select"
            >
              <option value="">All Job Types</option>
              <option value="Internship">Internship</option>
              <option value="FullTime">Full Time</option>
              <option value="PartTime">Part Time</option>
              <option value="Contract">Contract</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filter-input"
            />
            <button onClick={handleApplyFilters} className="filter-button">
              Apply Filters
            </button>
          </div>
        </div>
        {loading ? (
          <LoadingSpinner message="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <div className="no-jobs">
            <p>No jobs found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="jobs-count">
              <p>Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="jobs-grid">
              {jobs.map((job) => (
                <Link key={job.jobId} to={`/jobs/${job.jobId}`} className="job-card">
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <span className={`job-type-badge job-type-${job.jobType?.toLowerCase()}`}>
                      {job.jobType || 'Full Time'}
                    </span>
                  </div>
                  <p className="company-name">{job.companyName}</p>
                  <div className="job-meta">
                    <span className="location">
                      📍 {job.location || 'Remote'}
                    </span>
                    {job.remoteOption && <span className="remote-badge">Remote</span>}
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <p className="salary">
                      ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} {job.currency || 'USD'}
                    </p>
                  )}
                  <div className="job-card-footer">
                    <span className="posted-date">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span className="view-job">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobListings;

