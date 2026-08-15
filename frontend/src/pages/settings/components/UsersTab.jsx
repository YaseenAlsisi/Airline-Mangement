import React, { useState, useEffect } from 'react';
import { usersApi, rolesApi } from '../../../api/usersApi';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    roleIds: []
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAllUsers();
      setUsers(response.content || response.data?.content || (Array.isArray(response) ? response : (response.data || [])));
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesApi.getAllRoles();
      setRoles(response.data || (Array.isArray(response) ? response : []));
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await usersApi.updateUserStatus(id, !currentStatus);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
      try {
        await usersApi.deleteUser(user.id);
        fetchUsers();
      } catch (err) {
        console.error('Failed to delete user', err);
        alert(err.response?.data?.error?.message || 'Failed to delete user.');
      }
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setModalMode('edit');
      setFormData({
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        password: '', // Never show password, only edit if backend allows, but backend UpdateUserRequest doesn't take password
        fullName: user.fullName || '',
        roleIds: user.roles?.map(r => r.id) || []
      });
    } else {
      setModalMode('create');
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        await usersApi.createUser(formData);
      } else {
        await usersApi.updateUser(formData.id, {
          email: formData.email,
          fullName: formData.fullName,
          roleIds: formData.roleIds
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Save failed', err);
      alert(err.response?.data?.error?.message || 'Failed to save user.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRole = (roleId) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId) 
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">User Management</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm"
        >
          + Add New User
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-slate-500">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                        {user.fullName ? user.fullName.charAt(0) : 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.fullName}</div>
                        <div className="text-sm text-slate-500">{user.email} <span className="text-xs text-slate-400">(@{user.username})</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleOpenModal(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`${user.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} mr-3`}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[70vh] overflow-y-auto">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">
                        {modalMode === 'create' ? 'Add New User' : 'Edit User'}
                      </h3>
                      
                      <div className="space-y-4">
                        {modalMode === 'create' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Username</label>
                            <input 
                              type="text" 
                              required 
                              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={formData.username}
                              onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Full Name</label>
                          <input 
                            type="text" 
                            required 
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">Email</label>
                          <input 
                            type="email" 
                            required 
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>

                        {modalMode === 'create' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input 
                              type="password" 
                              required 
                              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Roles</label>
                          <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-2">
                            {roles.map(role => (
                              <label key={role.id} className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                  checked={formData.roleIds.includes(role.id)}
                                  onChange={() => toggleRole(role.id)}
                                />
                                <span className="text-sm font-medium text-slate-900">{role.name}</span>
                              </label>
                            ))}
                            {roles.length === 0 && <p className="text-sm text-slate-500">No roles available.</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
