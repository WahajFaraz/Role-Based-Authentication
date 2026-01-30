import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ChevronDown,
  Edit,
  Trash2,
  User as UserIcon,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';
import { userAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import './EnhancedUserList.css';

/**
 * Admin Dashboard Component
 * Full user management capabilities for administrators
 */
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
      setUsers(response.users);
      setPagination(response.pagination);
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, sortOrder, pagination.limit, logout]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await userAPI.deleteUser(userId);
      toast.success(`${userName} deleted successfully!`);
      await fetchUsers(pagination.currentPage);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setDeletingUserId(null);
    }
  };

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage);
    }
  };

  return (
    <div className="enhanced-user-list">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="admin-dashboard-header"
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
            <Shield />
          </motion.div>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Complete user management control panel</p>
          </div>
        </div>

        <div className="header-right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="admin-info"
          >
            <div className="admin-avatar">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="admin-details">
              <span className="admin-name">{currentUser?.name || 'Admin'}</span>
              <span className="admin-role">Super Administrator</span>
              <span className="admin-email">{currentUser?.email}</span>
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
            Add New User
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

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="stats-container"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="stat-card total-users"
        >
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{pagination.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="stat-card active-users"
        >
          <div className="stat-icon">
            <Shield />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.role === 'user').length}</h3>
            <p>Normal Users</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="stat-card admin-users"
        >
          <div className="stat-icon">
            <Shield />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.role === 'admin').length}</h3>
            <p>Admin Users</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="stat-card selected-users"
        >
          <div className="stat-icon">
            <Filter />
          </div>
          <div className="stat-content">
            <h3>{selectedUsers.length}</h3>
            <p>Selected</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="admin-controls-bar"
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
            className={`admin-filter-btn ${showFilters ? 'active' : ''}`}
          >
            <Filter />
            Advanced Filters
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchUsers()}
            className="admin-refresh-btn"
          >
            <RefreshCw />
            Refresh Data
          </motion.button>

          {selectedUsers.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBulkDelete}
              className="admin-bulk-delete-btn"
            >
              <Trash2 />
              Delete ({selectedUsers.length}) Users
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
            className="admin-filters-panel"
          >
            <div className="filter-group">
              <label>Sort by:</label>
              <div className="custom-select-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="admin-filter-select custom-select"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="createdAt">Created Date</option>
                  <option value="role">User Role</option>
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
                  className="admin-filter-select custom-select"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
                <div className="select-arrow">
                  <ChevronDown />
                </div>
              </div>
            </div>

            <div className="filter-group">
              <label>Users per page:</label>
              <div className="custom-select-wrapper">
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
                    fetchUsers(1);
                  }}
                  className="admin-filter-select custom-select"
                >
                  <option value={5}>5 Users</option>
                  <option value={10}>10 Users</option>
                  <option value={25}>25 Users</option>
                  <option value={50}>50 Users</option>
                </select>
                <div className="select-arrow">
                  <ChevronDown />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="admin-users-table-container"
      >
        {loading && users.length === 0 ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" />
            <p>Loading user data...</p>
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
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
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
                  <th onClick={() => handleSort('role')} className="sortable">
                    Role
                    {sortBy === 'role' && (
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
                      className={`admin-user-row ${selectedUsers.includes(user._id) ? 'selected' : ''}`}
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
                          <div className={`user-avatar-small ${user.role === 'admin' ? 'admin-avatar' : 'normal-avatar'}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            {user.role === 'admin' && (
                              <span className="admin-badge">Admin</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="email-cell">{user.email}</td>
                      <td className="role-cell">
                        <span className={`role-badge ${user.role === 'admin' ? 'admin-role' : 'user-role'}`}>
                          {user.role === 'admin' ? 'Administrator' : 'Normal User'}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(user.createdAt)}</td>
                      <td className="actions-cell">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            console.log('Edit button clicked for user:', user._id);
                            navigate(`/users/${user._id}/edit`);
                          }}
                          className="admin-edit-btn"
                          title="Edit user"
                        >
                          <Edit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={deletingUserId === user._id}
                          className="admin-delete-btn"
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
          className="admin-pagination"
        >
          <div className="pagination-info">
            <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            <span>Total {pagination.totalUsers} users</span>
            <span>Showing {pagination.limit} per page</span>
          </div>
          
          <div className="pagination-controls">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="admin-pagination-btn"
            >
              <ChevronLeft />
              Previous
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="admin-pagination-btn"
            >
              Next
              <ChevronRight />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
