import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  const userType = user?.userType;

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    window.location.reload(); // Refresh to update navbar
  };

  const getDashboardLink = () => {
    if (userType === 'Admin') {
      return '/admin/dashboard';
    }
    if (userType === 'Employer') {
      return '/employer/dashboard';
    }
    return '/student/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          💼 Internship Portal
        </Link>
        <div className="navbar-menu">
          <Link to="/jobs" className="navbar-link">
            Browse Jobs
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="navbar-link">
                Dashboard
              </Link>
              <NotificationBell />
              <div className="user-info">
                <span className="user-email">{user?.email || 'User'}</span>
              </div>
              <button onClick={handleLogout} className="navbar-button navbar-button-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

