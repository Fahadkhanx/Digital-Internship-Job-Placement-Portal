import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Dream Internship or Job</h1>
          <p>Connect with verified employers and discover opportunities that match your skills</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/jobs" className="btn btn-secondary">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Verified Employers</h3>
              <p>All employers are verified by administrators to ensure legitimate opportunities</p>
            </div>
            <div className="feature-card">
              <h3>Skill-Based Matching</h3>
              <p>Our algorithm matches you with jobs based on your skills and qualifications</p>
            </div>
            <div className="feature-card">
              <h3>Application Tracking</h3>
              <p>Track your applications and receive real-time updates on your status</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

