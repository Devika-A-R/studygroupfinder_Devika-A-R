import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
      setFormData({
        name: response.data.name,
        contactNumber: response.data.contactNumber
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put('/users/profile', formData);
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Update user data in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        name: response.data.user.name
      }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-warning',
      'approved': 'badge-success',
      'rejected': 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">My Profile</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="grid grid-2">
          {/* Profile Information */}
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Profile Information</h3>
              
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      className="form-control"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user.name,
                          contactNumber: user.contactNumber
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Contact:</strong> {user.contactNumber}</p>
                  <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Statistics</h3>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span>Groups Joined:</span>
                  <span className="badge badge-success">{user.joinedGroups.length}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Groups Created:</span>
                  <span className="badge badge-primary">{user.createdGroups.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Joined Groups */}
        <div className="card mt-4">
          <div className="card-body">
            <h3 className="card-title">My Joined Groups</h3>
            
            {user.joinedGroups.length === 0 ? (
              <p>You haven't joined any groups yet.</p>
            ) : (
              <div className="grid grid-3">
                {user.joinedGroups.map(group => (
                  <Link 
                    key={group._id} 
                    to={`/group/${group._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="card">
                      <img 
                        src={group.image} 
                        alt={group.title}
                        className="card-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Study+Group';
                        }}
                      />
                      <div className="card-body">
                        <h4 className="card-title">{group.title}</h4>
                        <p className="card-text">{group.subject}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Created Groups */}
        <div className="card mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="card-title mb-0">My Created Groups</h3>
              <Link to="/create-group" className="btn btn-primary">
                Create New Group
              </Link>
            </div>
            
            {user.createdGroups.length === 0 ? (
              <p>You haven't created any groups yet.</p>
            ) : (
              <div className="grid grid-3">
                {user.createdGroups.map(group => (
                  <div key={group._id} className="card">
                    <img 
                      src={group.image} 
                      alt={group.title}
                      className="card-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Study+Group';
                      }}
                    />
                    <div className="card-body">
                      <h4 className="card-title">{group.title}</h4>
                      <p className="card-text">{group.subject}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge ${getStatusBadge(group.status)}`}>
                          {group.status}
                        </span>
                        <Link 
                          to={`/group/${group._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
