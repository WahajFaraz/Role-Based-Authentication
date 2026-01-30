import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  LogOut,
  RefreshCw,
  Plus,
  AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './EnhancedUserList.css';

/**
 * Enhanced User List Component with Next-Level UI
 * Features: Advanced styling, icons, toast notifications, search, filters
 */
const EnhancedUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getAllUsers({
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm,
        role: filterRole,
        sortBy,
        sortOrder
      });
      
      setUsers(response.users);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error.message || 'Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole, sortBy, sortOrder]);

  const handleDeleteUser = async (userId, userName) => {
    try {
      await userAPI.deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
      toast.success(`User "${userName}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedUsers.map(userId => userAPI.deleteUser(userId)));
      setUsers(users.filter(user => !selectedUsers.includes(user._id)));
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} users deleted successfully`);
    } catch (error) {
      console.error('Failed to delete users:', error);
      toast.error('Failed to delete users');
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pagination = useMemo(() => {
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    
    return {
      totalUsers,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [users, currentPage, usersPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="enhanced-user-list-container">
      <Toaster position="top-right" />
      
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-element" style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          top: '10%',
          left: '5%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div className="floating-element" style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          top: '60%',
          right: '10%',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />
        <div className="floating-element" style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          bottom: '20%',
          left: '15%',
          animation: 'float 7s ease-in-out infinite'
        }} />
      </div>

      {/* Header */}
      <div className="user-list-header">
        <div className="header-left">
          <div className="header-icon">
            <Users />
          </div>
          <div>
            <h1>User Management</h1>
            <p>Manage your application users</p>
          </div>
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-role">{currentUser?.role === 'admin' ? 'Administrator' : 'User'}</span>
            <span className="user-email">{currentUser?.email}</span>
          </div>

          <button
            className="add-user-btn"
            onClick={() => navigate('/users/new')}
          >
            <UserPlus />
            Add User
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut />
            Logout
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ color: '#1e293b' }}
            />
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="filter-btn"
          >
            <Filter />
            Filters
          </button>

          <button
            onClick={handleRefresh}
            className="refresh-btn"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {selectedUsers.length > 0 && (
            <button
              onClick={() => handleBulkDelete()}
              className="bulk-delete-btn"
            >
              <Trash2 />
              Delete ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            <div className="filter-group">
              <label>Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="user">Normal Users Only</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div className="filter-actions">
              <button
                onClick={() => setShowFilters(false)}
                className="apply-filters-btn"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <div className="error-content">
            <div className="error-icon">
              <AlertCircle />
            </div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button
              onClick={() => fetchUsers(1)}
              className="retry-btn"
            >
              <RefreshCw />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <RefreshCw className="animate-spin" />
            </div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <UserIcon />
            </div>
            <h3>No users found</h3>
            <p>
              {searchTerm 
                ? `No users match your search for "${searchTerm}"`
                : "No users have been created yet"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/users/new')}
                className="add-first-user-btn"
              >
                <Plus />
                Add Your First User
              </button>
            )}
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={handleSelectAll}
                      className="select-all-checkbox"
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Name
                    {sortBy === 'name' && (
                      <span className="sort-indicator">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th onClick={() => handleSort('email')} className="sortable">
                    Email
                    {sortBy === 'email' && (
                      <span className="sort-indicator">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="sortable">
                    Created At
                    {sortBy === 'createdAt' && (
                      <span className="sort-indicator">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className={selectedUsers.includes(user._id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="user-checkbox"
                      />
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          {user.role === 'admin' && (
                            <span className="admin-badge">ADMIN</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="email-cell">{user.email}</td>
                    <td className="date-cell">{formatDate(user.createdAt)}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => navigate(`/users/${user._id}/edit`)}
                        className="edit-btn"
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="delete-btn"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * usersPerPage) + 1} to{' '}
            {Math.min(currentPage * usersPerPage, pagination.totalUsers)} of{' '}
            {pagination.totalUsers} users
          </div>
          
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="page-indicator">
              Page {currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserList;
