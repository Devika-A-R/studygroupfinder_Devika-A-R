import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');

  useEffect(() => {
    // Update page title
    document.title = 'StudyGroup Finder - Find Your Perfect Study Group';
    fetchGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchQuery, searchFilter, groups]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
      setFilteredGroups(response.data);
    } catch (error) {
      setError('Failed to fetch study groups');
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    if (!searchQuery.trim()) {
      setFilteredGroups(groups);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = groups.filter(group => {
      switch (searchFilter) {
        case 'title':
          return group.title.toLowerCase().includes(query);
        case 'subject':
          return group.subject.toLowerCase().includes(query);
        case 'creator':
          return group.creator.name.toLowerCase().includes(query);
        default:
          return (
            group.title.toLowerCase().includes(query) ||
            group.subject.toLowerCase().includes(query) ||
            group.creator.name.toLowerCase().includes(query) ||
            group.description.toLowerCase().includes(query)
          );
      }
    });
    setFilteredGroups(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setSearchFilter(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchFilter('all');
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Find Your Perfect Study Group</h1>
        <p className="page-subtitle">
          🚀 Connect with fellow learners and achieve your academic goals together
        </p>

        {error && <div className="alert alert-error">❌ {error}</div>}

        {/* Enhanced Search Section */}
        <div className="search-container">
          <div className="search-wrapper">
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search for study groups, subjects, or creators..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={clearSearch} title="Clear search">
                  ✕
                </button>
              )}
            </div>
            
            <div className="search-filters">
              <select 
                className="search-filter-select"
                value={searchFilter}
                onChange={handleFilterChange}
                title="Filter search results"
              >
                <option value="all">🎯 All Fields</option>
                <option value="title">📚 Title</option>
                <option value="subject">📖 Subject</option>
                <option value="creator">👤 Creator</option>
              </select>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="search-results-info">
              <span className="results-count">
                ✨ {filteredGroups.length} result{filteredGroups.length !== 1 ? 's' : ''} found for "{searchQuery}"
              </span>
              {filteredGroups.length !== groups.length && (
                <button className="show-all-btn" onClick={clearSearch}>
                  Show All Groups
                </button>
              )}
            </div>
          )}
        </div>

        {/* Groups Display */}
        {filteredGroups.length === 0 ? (
          <div className="text-center">
            {searchQuery ? (
              <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="card-body">
                  <h3>🔍 No Results Found</h3>
                  <p>No study groups found matching your search criteria.</p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button onClick={clearSearch} className="btn btn-secondary">
                      Clear Search
                    </button>
                    <Link to="/create-group" className="btn btn-primary">
                      Create New Group
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="card-body">
                  <h3>🎓 Welcome to StudyGroup Finder</h3>
                  <p>No study groups available at the moment. Be the first to create one!</p>
                  <Link to="/create-group" className="btn btn-primary">
                    ✨ Create the First Group!
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-3">
            {filteredGroups.map(group => (
              <Link 
                key={group._id} 
                to={`/group/${group._id}`} 
                style={{ textDecoration: 'none' }}
              >
                <div className="card group-card">
                  <img 
                    src={group.image} 
                    alt={group.title}
                    className="card-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200/06b6d4/ffffff?text=📚+Study+Group';
                    }}
                  />
                  <div className="card-body">
                    <h3 className="card-title">{group.title}</h3>
                    <p className="card-text">
                      <strong>📖 Subject:</strong> {group.subject}
                    </p>
                    <p className="card-text" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {group.description}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <span className="badge badge-success">
                          👥 {group.members.length}
                        </span>
                        <span className="badge badge-info">
                          🎯 {group.subject}
                        </span>
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        👤 {group.creator.name}
                      </small>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats Section */}
        {groups.length > 0 && (
          <div className="grid grid-3 mt-5">
            <div className="card">
              <div className="card-body text-center">
                <h3 style={{ fontSize: '2.5rem', margin: '0', background: 'var(--primary-gradient)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  📚 {groups.length}
                </h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Active Study Groups</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <h3 style={{ fontSize: '2.5rem', margin: '0', background: 'var(--success-gradient)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  👥 {groups.reduce((acc, group) => acc + group.members.length, 0)}
                </h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Total Members</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <h3 style={{ fontSize: '2.5rem', margin: '0', background: 'var(--info-gradient)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  🎯 {[...new Set(groups.map(g => g.subject))].length}
                </h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Subjects Covered</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
