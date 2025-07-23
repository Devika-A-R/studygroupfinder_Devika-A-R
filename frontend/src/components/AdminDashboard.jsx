import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { sendGroupStatusEmail, sendBulkNotificationEmail, sendSelectedUsersEmail } from '../utils/emailService';

const AdminDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [approvedGroups, setApprovedGroups] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('groups');
  
  // Search states
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [groupSearchFilter, setGroupSearchFilter] = useState('all');
  const [userSearchFilter, setUserSearchFilter] = useState('all');
  
  const [notification, setNotification] = useState({
    subject: '',
    message: '',
    recipientType: 'all',
    selectedGroup: '',
    selectedUsers: []
  });
  const [sendingNotification, setSendingNotification] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [groupSearchQuery, groupSearchFilter, groups]);

  useEffect(() => {
    filterUsers();
  }, [userSearchQuery, userSearchFilter, users]);

  const fetchData = async () => {
    try {
      const [groupsRes, usersRes, allUsersRes, approvedGroupsRes] = await Promise.all([
        api.get('/admin/groups'),
        api.get('/users'),
        api.get('/admin/users-for-notification'),
        api.get('/admin/approved-groups')
      ]);
      setGroups(groupsRes.data);
      setUsers(usersRes.data);
      setFilteredGroups(groupsRes.data);
      setFilteredUsers(usersRes.data);
      setAllUsers(allUsersRes.data);
      setApprovedGroups(approvedGroupsRes.data);
      setAvailableUsers(allUsersRes.data);
    } catch (error) {
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    if (!groupSearchQuery.trim()) {
      setFilteredGroups(groups);
      return;
    }

    const query = groupSearchQuery.toLowerCase().trim();
    const filtered = groups.filter(group => {
      switch (groupSearchFilter) {
        case 'title':
          return group.title.toLowerCase().includes(query);
        case 'subject':
          return group.subject.toLowerCase().includes(query);
        case 'creator':
          return group.creator.name.toLowerCase().includes(query);
        case 'status':
          return group.status.toLowerCase().includes(query);
        default:
          return (
            group.title.toLowerCase().includes(query) ||
            group.subject.toLowerCase().includes(query) ||
            group.creator.name.toLowerCase().includes(query) ||
            group.status.toLowerCase().includes(query) ||
            group.description.toLowerCase().includes(query)
          );
      }
    });
    setFilteredGroups(filtered);
  };

  const filterUsers = () => {
    if (!userSearchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = userSearchQuery.toLowerCase().trim();
    const filtered = users.filter(user => {
      switch (userSearchFilter) {
        case 'name':
          return user.name.toLowerCase().includes(query);
        case 'email':
          return user.email.toLowerCase().includes(query);
        case 'contact':
          return user.contactNumber.includes(query);
        case 'status':
          const status = user.isBlocked ? 'blocked' : 'active';
          return status.includes(query);
        default:
          const userStatus = user.isBlocked ? 'blocked' : 'active';
          return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.contactNumber.includes(query) ||
            userStatus.includes(query)
          );
      }
    });
    setFilteredUsers(filtered);
  };

  const clearGroupSearch = () => {
    setGroupSearchQuery('');
    setGroupSearchFilter('all');
  };

  const clearUserSearch = () => {
    setUserSearchQuery('');
    setUserSearchFilter('all');
  };

  const handleApproveGroup = async (groupId) => {
    try {
      const response = await api.put(`/admin/groups/${groupId}/approve`);
      setSuccess('✅ Group approved successfully!');
      
      if (response.data.notificationData) {
        const emailResult = await sendGroupStatusEmail(response.data.notificationData);
        if (emailResult.success) {
          setSuccess('✅ Group approved and email notification sent!');
        } else {
          setSuccess('✅ Group approved, but email notification failed.');
        }
      }
      
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve group');
    }
  };

  const handleRejectGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to reject this group?')) {
      try {
        const response = await api.put(`/admin/groups/${groupId}/reject`);
        setSuccess('⚠️ Group rejected successfully!');
        
        if (response.data.notificationData) {
          const emailResult = await sendGroupStatusEmail(response.data.notificationData);
          if (emailResult.success) {
            setSuccess('⚠️ Group rejected and email notification sent!');
          } else {
            setSuccess('⚠️ Group rejected, but email notification failed.');
          }
        }
        
        fetchData();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to reject group');
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await api.delete(`/groups/${groupId}`);
        setSuccess('🗑️ Group deleted successfully!');
        fetchData();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/block`);
      setSuccess('🚫 User blocked successfully!');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/unblock`);
      setSuccess('✅ User unblocked successfully!');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to unblock user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their groups and remove them from all groups they joined.')) {
      try {
        await api.delete(`/users/${userId}`);
        setSuccess('🗑️ User deleted successfully!');
        fetchData();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleRecipientTypeChange = async (e) => {
    const recipientType = e.target.value;
    setNotification(prev => ({
      ...prev,
      recipientType,
      selectedGroup: '',
      selectedUsers: []
    }));

    if (recipientType === 'group' && approvedGroups.length > 0) {
      const firstGroup = approvedGroups[0];
      try {
        const response = await api.get(`/admin/groups/${firstGroup._id}/users`);
        setSelectedGroupUsers(response.data);
        setNotification(prev => ({
          ...prev,
          selectedGroup: firstGroup._id
        }));
      } catch (error) {
        console.error('Failed to fetch group users:', error);
      }
    }
  };

  const handleGroupSelectionChange = async (e) => {
    const groupId = e.target.value;
    setNotification(prev => ({
      ...prev,
      selectedGroup: groupId
    }));

    if (groupId) {
      try {
        const response = await api.get(`/admin/groups/${groupId}/users`);
        setSelectedGroupUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch group users:', error);
        setSelectedGroupUsers([]);
      }
    } else {
      setSelectedGroupUsers([]);
    }
  };

  const handleUserSelection = (userId) => {
    setNotification(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleSelectAllUsers = () => {
    const allUserIds = availableUsers.map(user => user._id);
    setNotification(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.length === allUserIds.length ? [] : allUserIds
    }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendingNotification(true);
    setError('');
    setSuccess('');
    
    try {
      let recipients = [];
      
      if (notification.recipientType === 'all') {
        recipients = allUsers;
      } else if (notification.recipientType === 'group') {
        recipients = selectedGroupUsers;
      } else if (notification.recipientType === 'specific') {
        recipients = availableUsers.filter(user => notification.selectedUsers.includes(user._id));
      }

      if (recipients.length === 0) {
        setError('❌ No recipients selected');
        return;
      }

      const emailResult = await sendSelectedUsersEmail(
        recipients, 
        notification.subject, 
        notification.message
      );
      
      if (emailResult.success) {
        setSuccess(`📧 Notification sent to ${emailResult.sent} users successfully! ${emailResult.failed > 0 ? `(${emailResult.failed} failed)` : ''}`);
      } else {
        setError('❌ Failed to send notifications: ' + emailResult.error);
      }
      
      setNotification({ 
        subject: '', 
        message: '', 
        recipientType: 'all', 
        selectedGroup: '', 
        selectedUsers: [] 
      });
    } catch (error) {
      setError('❌ Failed to send notification');
    } finally {
      setSendingNotification(false);
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

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'approved': '✅',
      'rejected': '❌'
    };
    return icons[status] || '❓';
  };

  const getRecipientCount = () => {
    if (notification.recipientType === 'all') {
      return allUsers.length;
    } else if (notification.recipientType === 'group') {
      return selectedGroupUsers.length;
    } else if (notification.recipientType === 'specific') {
      return notification.selectedUsers.length;
    }
    return 0;
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">⚡ Admin Dashboard</h1>
        <p className="page-subtitle">
          🎯 Manage your study groups and users with powerful admin tools
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Modern Tab Navigation */}
        <div className="d-flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'groups' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('groups')}
          >
            📚 Groups ({groups.length})
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users ({users.length})
          </button>
          <button
            className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('notifications')}
          >
            📧 Notifications
          </button>
        </div>

        {/* Groups Management Tab */}
        {activeTab === 'groups' && (
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">📚 Study Groups Management</h3>
              
              {/* Groups Search Bar */}
              <div className="admin-search-container">
                <div className="admin-search-wrapper">
                  <div className="search-input-group">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search groups by title, subject, creator, or status..."
                      value={groupSearchQuery}
                      onChange={(e) => setGroupSearchQuery(e.target.value)}
                    />
                    {groupSearchQuery && (
                      <button className="clear-search-btn" onClick={clearGroupSearch} title="Clear search">
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <div className="search-filters">
                    <select 
                      className="search-filter-select"
                      value={groupSearchFilter}
                      onChange={(e) => setGroupSearchFilter(e.target.value)}
                    >
                      <option value="all">🎯 All Fields</option>
                      <option value="title">📚 Title</option>
                      <option value="subject">📖 Subject</option>
                      <option value="creator">👤 Creator</option>
                      <option value="status">⚡ Status</option>
                    </select>
                  </div>
                </div>

                {groupSearchQuery && (
                  <div className="search-results-info">
                    <span className="results-count">
                      ✨ {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
                    </span>
                    {filteredGroups.length !== groups.length && (
                      <button className="show-all-btn" onClick={clearGroupSearch}>
                        Show All Groups
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {filteredGroups.length === 0 ? (
                <div className="text-center">
                  {groupSearchQuery ? (
                    <div>
                      <h4>🔍 No groups found matching your search</h4>
                      <button onClick={clearGroupSearch} className="btn btn-secondary">
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <h4>📚 No groups found</h4>
                  )}
                </div>
              ) : (
                <div className="table">
                  <table>
                    <thead>
                      <tr>
                        <th>📚 Title</th>
                        <th>📖 Subject</th>
                        <th>👤 Creator</th>
                        <th>👥 Members</th>
                        <th>⚡ Status</th>
                        <th>📅 Created</th>
                        <th>🔧 Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGroups.map(group => (
                        <tr key={group._id}>
                          <td style={{ fontWeight: '600' }}>{group.title}</td>
                          <td>{group.subject}</td>
                          <td>{group.creator.name}</td>
                          <td>
                            <span className="badge badge-info">
                              {group.members.length}/{group.maxMembers}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(group.status)} status-badge`}>
                              {getStatusIcon(group.status)} {group.status}
                            </span>
                          </td>
                          <td>{new Date(group.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              {group.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleApproveGroup(group._id)}
                                    title="Approve group"
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleRejectGroup(group._id)}
                                    title="Reject group"
                                  >
                                    ❌ Reject
                                  </button>
                                </>
                              )}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteGroup(group._id)}
                                title="Delete group"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">👥 Users Management</h3>
              
              {/* Users Search Bar */}
              <div className="admin-search-container">
                <div className="admin-search-wrapper">
                  <div className="search-input-group">
                    <span className="search-icon">👤</span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search users by name, email, contact, or status..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                    {userSearchQuery && (
                      <button className="clear-search-btn" onClick={clearUserSearch} title="Clear search">
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <div className="search-filters">
                    <select 
                      className="search-filter-select"
                      value={userSearchFilter}
                      onChange={(e) => setUserSearchFilter(e.target.value)}
                    >
                      <option value="all">🎯 All Fields</option>
                      <option value="name">👤 Name</option>
                      <option value="email">📧 Email</option>
                      <option value="contact">📱 Contact</option>
                      <option value="status">⚡ Status</option>
                    </select>
                  </div>
                </div>

                {userSearchQuery && (
                  <div className="search-results-info">
                    <span className="results-count">
                      ✨ {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                    </span>
                    {filteredUsers.length !== users.length && (
                      <button className="show-all-btn" onClick={clearUserSearch}>
                        Show All Users
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {filteredUsers.length === 0 ? (
                <div className="text-center">
                  {userSearchQuery ? (
                    <div>
                      <h4>🔍 No users found matching your search</h4>
                      <button onClick={clearUserSearch} className="btn btn-secondary">
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <h4>👥 No users found</h4>
                  )}
                </div>
              ) : (
                <div className="table">
                  <table>
                    <thead>
                      <tr>
                        <th>👤 Name</th>
                        <th>📧 Email</th>
                        <th>📱 Contact</th>
                        <th>🔗 Groups Joined</th>
                        <th>✨ Groups Created</th>
                        <th>⚡ Status</th>
                        <th>📅 Joined</th>
                        <th>🔧 Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td style={{ fontWeight: '600' }}>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.contactNumber}</td>
                          <td>
                            <span className="badge badge-info">
                              {user.joinedGroups.length}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-primary">
                              {user.createdGroups.length}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.isBlocked ? 'badge-danger' : 'badge-success'} status-badge`}>
                              {user.isBlocked ? '🚫 Blocked' : '✅ Active'}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              {user.isBlocked ? (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleUnblockUser(user._id)}
                                  title="Unblock user"
                                >
                                  ✅ Unblock
                                </button>
                              ) : (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleBlockUser(user._id)}
                                  title="Block user"
                                >
                                  🚫 Block
                                </button>
                              )}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteUser(user._id)}
                                title="Delete user"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">📧 Send Email Notifications</h3>
              
              <div className="alert alert-info">
                <strong>💡 Note:</strong> Emails will be sent using EmailJS. You can send to all users, specific group members, or selected individual users.
              </div>
              
              <form onSubmit={handleSendNotification}>
                <div className="form-group">
                  <label>🎯 Select Recipients</label>
                  <select
                    className="form-control"
                    value={notification.recipientType}
                    onChange={handleRecipientTypeChange}
                    required
                  >
                    <option value="all">👥 All Active Users ({allUsers.length})</option>
                    <option value="group">📚 Members of Specific Group</option>
                    <option value="specific">✨ Select Individual Users</option>
                  </select>
                </div>

                {/* Group Selection */}
                {notification.recipientType === 'group' && (
                  <div className="form-group">
                    <label>📚 Select Group</label>
                    <select
                      className="form-control"
                      value={notification.selectedGroup}
                      onChange={handleGroupSelectionChange}
                      required
                    >
                      <option value="">Choose a group...</option>
                      {approvedGroups.map(group => (
                        <option key={group._id} value={group._id}>
                          {group.title} ({group.members.length} members)
                        </option>
                      ))}
                    </select>
                    {selectedGroupUsers.length > 0 && (
                      <small className="text-info">
                        📧 This will send to {selectedGroupUsers.length} group members
                      </small>
                    )}
                  </div>
                )}

                {/* Individual User Selection */}
                {notification.recipientType === 'specific' && (
                  <div className="form-group">
                    <label>👤 Select Users</label>
                    <div className="mb-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleSelectAllUsers}
                      >
                        {notification.selectedUsers.length === availableUsers.length ? '❌ Deselect All' : '✅ Select All'}
                      </button>
                      <small className="ml-2 text-info">
                        ✨ {notification.selectedUsers.length} users selected
                      </small>
                    </div>
                    <div style={{ 
                      maxHeight: '250px', 
                      overflowY: 'auto', 
                      border: '2px solid var(--border-color)', 
                      padding: '1rem', 
                      borderRadius: 'var(--border-radius)',
                      background: 'var(--bg-secondary)'
                    }}>
                      {availableUsers.map(user => (
                        <div key={user._id} className="d-flex align-items-center mb-2 p-2" style={{
                          background: notification.selectedUsers.includes(user._id) ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                          borderRadius: 'var(--border-radius-sm)',
                          border: notification.selectedUsers.includes(user._id) ? '1px solid var(--primary-color)' : '1px solid transparent'
                        }}>
                          <input
                            type="checkbox"
                            id={`user-${user._id}`}
                            checked={notification.selectedUsers.includes(user._id)}
                            onChange={() => handleUserSelection(user._id)}
                            className="mr-2"
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <label htmlFor={`user-${user._id}`} className="mb-0" style={{ cursor: 'pointer', flex: 1 }}>
                            <strong>{user.name}</strong> <small>({user.email})</small>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recipient Count Display */}
                <div className="alert alert-info">
                  <strong>📧 Recipients:</strong> {getRecipientCount()} users will receive this notification
                </div>

                <div className="form-group">
                  <label>📝 Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={notification.subject}
                    onChange={(e) => setNotification(prev => ({
                      ...prev,
                      subject: e.target.value
                    }))}
                    placeholder="Enter email subject..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>💬 Message</label>
                  <textarea
                    className="form-control"
                    value={notification.message}
                    onChange={(e) => setNotification(prev => ({
                      ...prev,
                      message: e.target.value
                    }))}
                    placeholder="Enter your message..."
                    rows="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sendingNotification || getRecipientCount() === 0}
                >
                  {sendingNotification ? '📧 Sending...' : `📧 Send to ${getRecipientCount()} Users`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modern Stats Cards */}
        <div className="grid grid-3 mt-5">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="card-title" style={{ fontSize: '2.5rem', margin: '0' }}>
                ⏳ {groups.filter(g => g.status === 'pending').length}
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Pending Groups</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <h3 className="card-title" style={{ fontSize: '2.5rem', margin: '0' }}>
                🚫 {users.filter(u => u.isBlocked).length}
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Blocked Users</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <h3 className="card-title" style={{ fontSize: '2.5rem', margin: '0' }}>
                ✅ {groups.filter(g => g.status === 'approved').length}
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Active Groups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
