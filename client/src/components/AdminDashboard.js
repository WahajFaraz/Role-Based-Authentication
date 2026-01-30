import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Shield,
  LogOut,
  Save,
  Loader2
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
      const response = await userAPI.getAllUsers({
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm,
        role: filterRole,
        sortBy: sortField,
        sortOrder: sortDirection
      });
      
      setUsers(response.users);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole, sortField, sortDirection]);

  const handleDeleteUser = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
      fetchUsers(newPage);
    }
  };

  return (
    <div className="enhanced-user-list">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="header-left">
          <div className="header-icon">
            <Shield />
          </div>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Complete user management control panel</p>
          </div>
        </div>

        <div className="header-right">
          <div className="admin-info">
            <span className="admin-role">Super Administrator</span>
            <span className="admin-email">{currentUser?.email}</span>
          </div>

          <button
            className="add-user-btn"
            onClick={() => navigate('/users/new')}
          >
            <UserPlus />
            Add New User
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

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card total-users">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{pagination.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card active-users">
          <div className="stat-icon">
            <UserIcon />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.role === 'user').length}</h3>
            <p>Normal Users</p>
          </div>
        </div>

        <div className="stat-card admin-users">
          <div className="stat-icon">
            <Shield />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.role === 'admin').length}</h3>
            <p>Admin Users</p>
          </div>
        </div>

        <div className="stat-card selected-users">
          <div className="stat-icon">
            <UserIcon />
          </div>
          <div className="stat-content">
            <h3>{selectedUsers.length}</h3>
            <p>Selected</p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="admin-controls-bar">
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
            onClick={() => fetchUsers()}
            className="refresh-btn"
          >
            <Loader2 className="animate-spin" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" />
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
                <UserPlus />
                Add Your First User
              </button>
            )}
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="admin-user-row">
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
                    <td>
                      <span className={`role-badge ${user.role === 'admin' ? 'admin-role' : 'user-role'}`}>
                        {user.role === 'admin' ? 'Administrator' : 'Normal User'}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => navigate(`/users/${user._id}/edit`)}
                          className="admin-edit-btn"
                          title="Edit user"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="admin-delete-btn"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="admin-pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * usersPerPage) + 1} to{' '}
            {Math.min(currentPage * usersPerPage, pagination.totalUsers)} of{' '}
            {pagination.totalUsers} users
          </div>
          
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="page-indicator">
              Page {currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
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

export default AdminDashboard;
