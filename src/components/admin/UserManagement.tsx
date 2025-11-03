import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { Trash2, Shield, Lock, Unlock } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  last_login?: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'admin'>('all');

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getAllUsers({
        is_active: filter === 'active' ? true : filter === 'inactive' ? false : undefined,
        is_staff: filter === 'admin' ? true : undefined
      });
      setUsers(data.results || data || []);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleAdmin = async (user: User) => {
    try {
      setError(null);
      await adminAPI.updateUser(user.id, { is_staff: !user.is_staff });
      setSuccess(`${user.username} admin status updated!`);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      setError(null);
      await adminAPI.updateUser(user.id, { is_active: !user.is_active });
      setSuccess(`${user.username} status updated!`);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure? This will delete all user data including bookings!')) return;
    try {
      setError(null);
      await adminAPI.deleteUser(userId);
      setSuccess('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'inactive', 'admin'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && ` (${users.filter(u => 
              status === 'active' ? u.is_active : 
              status === 'inactive' ? !u.is_active : 
              status === 'admin' ? u.is_staff : false
            ).length})`}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.is_active).length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.is_staff).length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Username</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    {user.is_active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3">
                  {user.is_staff ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      <Shield size={14} />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      User
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleAdmin(user)}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      title={user.is_staff ? 'Remove Admin' : 'Make Admin'}
                    >
                      <Shield size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`font-medium text-sm ${
                        user.is_active
                          ? 'text-yellow-600 hover:text-yellow-700'
                          : 'text-green-600 hover:text-green-700'
                      }`}
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
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

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No users found</p>
        </div>
      )}
    </div>
  );
};
