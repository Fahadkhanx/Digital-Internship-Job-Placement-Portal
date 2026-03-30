import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Internship Portal</h3>
          <p>Connecting students with verified employers for internships and entry-level jobs.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/jobs">Browse Jobs</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>For Students</h4>
          <ul>
            <li><Link to="/register">Create Profile</Link></li>
            <li><Link to="/jobs">Find Jobs</Link></li>
            <li><Link to="/student/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>For Employers</h4>
          <ul>
            <li><Link to="/register">Register Company</Link></li>
            <li><Link to="/employer/dashboard">Post Jobs</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Digital Internship & Job Placement Portal. All rights reserved.</p>
        <p>Developed by: Fahad Shah & Khan Huzaifa | Supervisor: David Keane</p>
      </div>
    </footer>
  );
};

export default Footer;

