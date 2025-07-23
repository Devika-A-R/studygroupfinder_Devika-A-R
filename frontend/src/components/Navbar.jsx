import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Left side - Brand */}
          <div className="navbar-left">
            <Link to="/" className="navbar-brand">
              <span className="brand-icon">🎓</span>
              StudyGroup Finder
            </Link>
          </div>
          
          {/* Right side - Navigation */}
          <div className="navbar-right">
            <ul className="navbar-nav">
              <li>
                <Link to="/" className="nav-link" title="Home">
                  <span className="nav-icon">🏠</span>
                  <span className="nav-text">Home</span>
                </Link>
              </li>
              
              {token ? (
                <>
                  {user.role === 'admin' ? (
                    <>
                      <li>
                        <Link to="/create-group" className="nav-link" title="Create Group">
                          <span className="nav-icon">✨</span>
                          <span className="nav-text">Create</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin" className="nav-link" title="Admin Dashboard">
                          <span className="nav-icon">⚡</span>
                          <span className="nav-text">Dashboard</span>
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to="/create-group" className="nav-link" title="Create Group">
                          <span className="nav-icon">✨</span>
                          <span className="nav-text">Create</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/profile" className="nav-link" title="Profile">
                          <span className="nav-icon">👤</span>
                          <span className="nav-text">Profile</span>
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <button onClick={handleLogout} className="nav-link btn logout-btn" title="Logout">
                      <span className="nav-icon">🚪</span>
                      <span className="nav-text">{user.name}</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="nav-link" title="Login">
                    <span className="nav-icon">🔐</span>
                    <span className="nav-text">Login</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
