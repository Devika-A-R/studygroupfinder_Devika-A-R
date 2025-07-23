import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Home from './components/Home';
import LoginSignup from './components/LoginSignup';
import AdminLogin from './components/AdminLogin';
import TermsAndConditions from './components/TermsAndConditions';
import CreateGroup from './components/CreateGroup';
import GroupDetails from './components/GroupDetails';
import EditGroup from './components/EditGroup';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

// Component to handle dynamic title updates
const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const updateTitle = () => {
      const path = location.pathname;
      const baseTitle = 'StudyGroup Finder';
      
      let pageTitle = '';
      
      switch (path) {
        case '/':
          pageTitle = `${baseTitle} - Find Your Perfect Study Group`;
          break;
        case '/login':
          pageTitle = `Login - ${baseTitle}`;
          break;
        case '/admin-login':
          pageTitle = `Admin Login - ${baseTitle}`;
          break;
        case '/terms':
          pageTitle = `Terms & Conditions - ${baseTitle}`;
          break;
        case '/create-group':
          pageTitle = `Create Study Group - ${baseTitle}`;
          break;
        case '/profile':
          pageTitle = `My Profile - ${baseTitle}`;
          break;
        case '/admin':
          pageTitle = `Admin Dashboard - ${baseTitle}`;
          break;
        default:
          if (path.startsWith('/group/')) {
            pageTitle = `Study Group Details - ${baseTitle}`;
          } else if (path.startsWith('/edit-group/')) {
            pageTitle = `Edit Group - ${baseTitle}`;
          } else {
            pageTitle = baseTitle;
          }
      }
      
      document.title = pageTitle;
    };

    updateTitle();
  }, [location]);

  return null;
};

function App() {
  return (
    <Router>
      <div className="App">
        <TitleUpdater />
        <Navbar />
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/group/:id" element={<GroupDetails />} />
          <Route path="/edit-group/:id" element={<EditGroup />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
