import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchGroupDetails();
    } else {
      setError('Please login to view group details');
      setLoading(false);
    }
  }, [id, token]);

  const fetchGroupDetails = async () => {
    try {
      const response = await api.get(`/groups/${id}`);
      setGroup(response.data);
      // Update page title with group name
      document.title = `${response.data.title} - StudyGroup Finder`;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      await api.post(`/groups/${id}/join`);
      setMessage('Successfully joined the group!');
      fetchGroupDetails();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await api.post(`/groups/${id}/leave`);
        setMessage('Successfully left the group!');
        fetchGroupDetails();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to leave group');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/groups/${id}/messages`, { content: newMessage });
      setNewMessage('');
      fetchGroupDetails();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!materialTitle.trim() || !materialUrl.trim()) return;

    try {
      await api.post(`/groups/${id}/materials`, {
        title: materialTitle,
        url: materialUrl
      });
      setMaterialTitle('');
      setMaterialUrl('');
      setShowAddMaterial(false);
      fetchGroupDetails();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add material');
    }
  };

  const handleEditGroup = () => {
    navigate(`/edit-group/${id}`);
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await api.delete(`/groups/${id}`);
        setMessage('Group deleted successfully!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error && !group) return <div className="alert alert-error">{error}</div>;
  if (!group) return <div className="alert alert-error">Group not found</div>;

  const isCreator = currentUser.id === group.creator._id;
  const isAdmin = currentUser.role === 'admin';
  const isMember = group.members.some(member => member._id === currentUser.id);
  const canEditDelete = isCreator || isAdmin;

  return (
    <div className="page">
      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="grid grid-2">
          {/* Group Information */}
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
              <h2 className="card-title">{group.title}</h2>
              <p><strong>Subject:</strong> {group.subject}</p>
              <p><strong>Description:</strong> {group.description}</p>
              <p><strong>Created by:</strong> {group.creator.name}</p>
              <p><strong>Members:</strong> {group.members.length}/{group.maxMembers}</p>
              
              <div className="d-flex gap-2 flex-wrap mt-3">
                {!isMember ? (
                  <button 
                    className="btn btn-success" 
                    onClick={handleJoinGroup}
                    disabled={group.members.length >= group.maxMembers}
                  >
                    {group.members.length >= group.maxMembers ? 'Group Full' : 'Join Group'}
                  </button>
                ) : (
                  <button 
                    className="btn btn-warning" 
                    onClick={handleLeaveGroup}
                    disabled={isCreator}
                  >
                    {isCreator ? 'You are the creator' : 'Leave Group'}
                  </button>
                )}

                {canEditDelete && (
                  <>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleEditGroup}
                    >
                      Edit Group
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={handleDeleteGroup}
                    >
                      Delete Group
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Group Members */}
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Group Members ({group.members.length})</h3>
              <div className="d-flex flex-column gap-2">
                {group.members.map(member => (
                  <div key={member._id} className="d-flex justify-content-between align-items-center">
                    <span>{member.name}</span>
                    {member._id === group.creator._id && (
                      <span className="badge badge-success">Creator</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isMember && (
          <>
            {/* Messages Section */}
            <div className="card mt-4">
              <div className="card-body">
                <h3 className="card-title">Group Messages</h3>
                
                {/* Send Message Form */}
                <form onSubmit={handleSendMessage} className="mb-4">
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                    <button type="submit" className="btn btn-primary">Send</button>
                  </div>
                </form>

                {/* Messages Display */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {group.messages.length === 0 ? (
                    <p>No messages yet. Start the conversation!</p>
                  ) : (
                    group.messages.map((msg, index) => (
                      <div key={index} className="mb-3 p-3" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '5px' }}>
                        <div className="d-flex justify-content-between">
                          <strong>{msg.user.name}</strong>
                          <small>{new Date(msg.timestamp).toLocaleString()}</small>
                        </div>
                        <p className="mb-0 mt-1">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div className="card mt-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="card-title mb-0">Study Materials</h3>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddMaterial(!showAddMaterial)}
                  >
                    Add Material
                  </button>
                </div>

                {/* Add Material Form */}
                {showAddMaterial && (
                  <form onSubmit={handleAddMaterial} className="mb-4">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                        placeholder="Material title"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="url"
                        className="form-control"
                        value={materialUrl}
                        onChange={(e) => setMaterialUrl(e.target.value)}
                        placeholder="Material URL"
                        required
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-success">Add Material</button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowAddMaterial(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Materials List */}
                {group.materials.length === 0 ? (
                  <p>No materials shared yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {group.materials.map((material, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '5px' }}>
                        <div>
                          <strong>{material.title}</strong>
                          <br />
                          <small>Shared by {material.uploadedBy.name} on {new Date(material.uploadedAt).toLocaleDateString()}</small>
                        </div>
                        <a 
                          href={material.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;
