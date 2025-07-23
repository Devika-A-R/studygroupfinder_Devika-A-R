import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const EditGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    image: '',
    maxMembers: 50
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const response = await api.get(`/groups/${id}`);
      const group = response.data;
      
      // Check if user can edit this group
      if (group.creator._id !== currentUser.id && currentUser.role !== 'admin') {
        setError('You are not authorized to edit this group');
        return;
      }

      setFormData({
        title: group.title,
        subject: group.subject,
        description: group.description,
        image: group.image,
        maxMembers: group.maxMembers
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch group details');
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
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/groups/${id}`, formData);
      setSuccess('Group updated successfully!');
      
      setTimeout(() => {
        navigate(`/group/${id}`);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="form-container">
          <h2 className="text-center mb-4">Edit Study Group</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {!error && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Group Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
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
                />
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
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update Group'}
                </button>
                
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/group/${id}`)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditGroup;
