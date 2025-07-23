import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    image: '',
    maxMembers: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/groups', formData);
      setSuccess('Study group created successfully! It will be visible after admin approval.');
      
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create study group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="form-container">
          <h2 className="text-center mb-4">Create New Study Group</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Group Title *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Advanced Mathematics Study Group"
                required
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                className="form-control"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Mathematics, Physics, Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what your study group is about, learning goals, meeting schedule, etc."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Group Image URL (optional)</label>
              <input
                type="url"
                name="image"
                className="form-control"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <small>If no image is provided, a default image will be used.</small>
            </div>

            <div className="form-group">
              <label>Maximum Members</label>
              <input
                type="number"
                name="maxMembers"
                className="form-control"
                value={formData.maxMembers}
                onChange={handleChange}
                min="5"
                max="100"
              />
              <small>Recommended: 10-50 members</small>
            </div>

            <div className="alert alert-info">
              <strong>Note:</strong> Your study group will need admin approval before it becomes visible to other users.
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Creating Group...' : 'Create Study Group'}
            </button>
          </form>

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
