import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  LogOut, 
  UserPlus,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './EnhancedUserList.css';

/**
 * Enhanced User List Component with Next-Level UI
 * Features: Advanced animations, icons, toast notifications, search, filters
 */
const EnhancedUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10
  });
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  // Floating animation background elements
  const [floatingElements, setFloatingElements] = useState([]);

  useEffect(() => {
    // Generate random floating elements
    const elements = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 15,
      duration: Math.random() * 15 + 10
    }));
    setFloatingElements(elements);
  }, []);

  /**
   * Fetch users from API with search and sorting
   */
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm,
        sortBy,
        sortOrder
      };
      
      const response = await userAPI.getAllUsers(params);
      
      // Apply client-side filtering if needed
      let filteredUsers = response.users || [];
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setUsers(filteredUsers);
      setPagination(response.pagination || {
        currentPage: page,
        totalPages: 1,
        totalUsers: filteredUsers.length,
        limit: 10
      });
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, sortOrder, pagination.limit, logout]);

  /**
   * Handle search with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  /**
   * Handle page change
   */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchUsers(page);
    }
  };

  /**
   * Handle user deletion with confirmation
   */
  const handleDeleteUser = async (userId, userName) => {
    setDeletingUserId(userId);
    
    try {
      await userAPI.deleteUser(userId);
      toast.success(`User "${userName}" deleted successfully!`);
      await fetchUsers(pagination.currentPage);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setDeletingUserId(null);
    }
  };

  /**
   * Handle bulk delete
   */
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      return;
    }

    try {
      for (const userId of selectedUsers) {
        await userAPI.deleteUser(userId);
      }
      toast.success(`${selectedUsers.length} user(s) deleted successfully!`);
      setSelectedUsers([]);
      await fetchUsers(pagination.currentPage);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete users';
      toast.error(errorMessage);
    }
  };

  /**
   * Handle user selection
   */
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  /**
   * Handle select all
   */
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  /**
   * Handle sorting
   */
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchUsers(pagination.currentPage);
    toast.success('Data refreshed!');
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="enhanced-user-list-container"
    >
      <Toaster position="top-right" />
      
      {/* Floating background elements */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="floating-element"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="user-list-header"
      >
        <div className="header-left">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="header-icon"
          >
            <Users />
          </motion.div>
          <div>
            <h1>User Management</h1>
            <p>Manage your application users</p>
          </div>
        </div>

        <div className="header-right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="user-info"
          >
            <div className="user-avatar">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{currentUser?.name || 'Guest User'}</span>
              <span className="user-role">Administrator</span>
              {currentUser?.email && (
                <span className="user-email">{currentUser.email}</span>
              )}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/users/new')}
            className="add-user-btn"
          >
            <UserPlus />
            Add User
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="controls-bar"
      >
        <div className="search-section">
          <motion.div
            animate={{
              scale: searchTerm ? 1.02 : 1
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className="search-wrapper"
          >
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ color: '#1e293b' }}
            />
          </motion.div>
        </div>

        <div className="action-buttons">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-btn ${showFilters ? 'active' : ''}`}
          >
            <Filter />
            Filters
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="refresh-btn"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>

          {selectedUsers.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBulkDelete}
              className="bulk-delete-btn"
            >
              <Trash2 />
              Delete ({selectedUsers.length})
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="filters-panel"
          >
            <div className="filter-group">
              <label>Sort by:</label>
              <div className="custom-select-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select custom-select"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="createdAt">Created Date</option>
                </select>
                <div className="select-arrow">
                  <ChevronDown />
                </div>
              </div>
            </div>

            <div className="filter-group">
              <label>Order:</label>
              <div className="custom-select-wrapper">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="filter-select custom-select"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
                <div className="select-arrow">
                  <ChevronDown />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="error-state"
          >
            <div className="error-content">
              <AlertCircle className="error-icon" />
              <div>
                <h3>Oops! Something went wrong</h3>
                <p>{error}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchUsers(1)}
                className="retry-btn"
              >
                <RefreshCw />
                Retry
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="users-table-container"
      >
        {loading && users.length === 0 ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" />
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users className="empty-icon" />
            <h3>No users found</h3>
            <p>
              {searchTerm 
                ? 'No users match your search criteria' 
                : 'Get started by adding your first user'
              }
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/users/new')}
                className="add-first-user-btn"
              >
                <Plus />
                Add Your First User
              </motion.button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <motion.input
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={handleSelectAll}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Name
                    {sortBy === 'name' && (
                      <motion.span
                        animate={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        ↑
                      </motion.span>
                    )}
                  </th>
                  <th onClick={() => handleSort('email')} className="sortable">
                    Email
                    {sortBy === 'email' && (
                      <motion.span
                        animate={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        ↑
                      </motion.span>
                    )}
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="sortable">
                    Created At
                    {sortBy === 'createdAt' && (
                      <motion.span
                        animate={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        ↑
                      </motion.span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={selectedUsers.includes(user._id) ? 'selected' : ''}
                    >
                      <td>
                        <motion.input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="user-name">{user.name}</span>
                        </div>
                      </td>
                      <td className="email-cell">{user.email}</td>
                      <td className="date-cell">{formatDate(user.createdAt)}</td>
                      <td className="actions-cell">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            console.log('Edit button clicked for user:', user._id);
                            navigate(`/users/${user._id}/edit`);
                          }}
                          className="edit-btn"
                          title="Edit user"
                        >
                          <Edit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={deletingUserId === user._id}
                          className="delete-btn"
                          title="Delete user"
                        >
                          {deletingUserId === user._id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pagination"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="pagination-btn"
          >
            <ChevronLeft />
            Previous
          </motion.button>
          
          <div className="pagination-info">
            <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            <span className="total-users">({pagination.totalUsers} total users)</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="pagination-btn"
          >
            Next
            <ChevronRight />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedUserList;
