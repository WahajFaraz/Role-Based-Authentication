import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import './UserList.css';

/**
 * UserList Component
 * Displays a list of all users with pagination and actions
 */
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10
  });
  const [deletingUserId, setDeletingUserId] = useState(null);

  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  /**
   * Fetch users from API
   * @param {number} page - Page number
   */
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({
        page,
        limit: pagination.limit
      });
      
      setUsers(response.users);
      setPagination(response.pagination);
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
  }, [pagination.limit, logout]);

  /**
   * Handle page change
   * @param {number} page - New page number
   */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchUsers(page);
    }
  };

  /**
   * Handle user deletion
   * @param {string} userId - User ID to delete
   * @param {string} userName - User name for confirmation
   */
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await userAPI.deleteUser(userId);
      
      // Refresh user list
      await fetchUsers(pagination.currentPage);
      
      // Show success message (you could use a toast library here)
      alert('User deleted successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      alert(errorMessage);
    } finally {
      setDeletingUserId(null);
    }
  };

  /**
   * Handle user edit
   * @param {string} userId - User ID to edit
   */
  const handleEditUser = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
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
    fetchUsers();
  }, [fetchUsers]);

  if (loading && users.length === 0) {
    return (
      <div className="user-list-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <Toaster position="top-right" />
      
      <div className="user-list-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <span className="user-info">
            Welcome, {currentUser?.name}
          </span>
          <button 
            className="add-user-btn"
            onClick={() => navigate('/users/new')}
          >
            Add New User
          </button>
          <button 
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => fetchUsers()} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="users-table-container">
        {users.length === 0 ? (
          <div className="no-users">
            <p>No users found</p>
            <button 
              className="add-user-btn"
              onClick={() => navigate('/users/new')}
            >
              Add First User
            </button>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="actions-cell">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditUser(user._id)}
                      title="Edit user"
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      disabled={deletingUserId === user._id}
                      title="Delete user"
                    >
                      {deletingUserId === user._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
            {' '}({pagination.totalUsers} total users)
          </span>
          
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList;
