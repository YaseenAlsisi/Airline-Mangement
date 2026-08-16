import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, updateUserStatus, deleteUser } from '../../../api/users.api';
import { getAllRoles } from '../../../api/roles.api';
import { useTranslation } from 'react-i18next';

const UsersTab = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    roleIds: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        getAllUsers({ size: 100 }),
        getAllRoles()
      ]);
      setUsers(usersRes.data?.content || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setFormError('');
    setEditingUser(user);
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName,
        roleIds: user.roles.map(r => r.id)
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleIds: []
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      const roleIds = prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId];
      return { ...prev, roleIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          email: formData.email,
          fullName: formData.fullName,
          roleIds: formData.roleIds
        });
      } else {
        await createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          roleIds: formData.roleIds
        });
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || t('An error occurred while saving the user.'));
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateUserStatus(user.id, !user.active);
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(t('Are you sure you want to delete user {{username}}?', { username: user.username }))) return;
    try {
      await deleteUser(user.id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('Failed to delete user'));
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">{t('Loading users...')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">{t('User Management')}</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm"
        >
          {t('+ Add New User')}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('User')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('Roles')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('Status')}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{user.fullName || user.username}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                      <span key={role.id} className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.active ? t('Active') : t('Inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">{t('Edit')}</button>
                  <button onClick={() => handleToggleStatus(user)} className={`${user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} mr-3`}>
                    {user.active ? t('Disable') : t('Enable')}
                  </button>
                  {user.username !== 'admin' && (
                    <button onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-900">
                      {t('Delete')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{editingUser ? t('Edit User') : t('Add New User')}</h3>
            
            {formError && (
              <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('Username')}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('Full Name')}</label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">{t('Email')}</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('Password')}</label>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('Assign Roles')}</label>
                <div className="space-y-2 border p-3 rounded-md max-h-40 overflow-y-auto">
                  {roles.map(role => (
                    <label key={role.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={formData.roleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition font-medium text-sm"
                >
                  {t('Cancel')}
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-medium text-sm"
                >
                  {editingUser ? t('Save Changes') : t('Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
