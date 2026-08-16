import React, { useState, useEffect } from 'react';
import { getAllRoles, getAllPermissions, createRole, updateRole, assignPermissions, deleteRole } from '../../../api/roles.api';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const RolesTab = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ name: '', description: '' });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        getAllRoles(),
        getAllPermissions()
      ]);
      const rolesData = rolesRes.data || [];
      setRoles(rolesData);
      setPermissions(permsRes.data || []);
      
      if (rolesData.length > 0 && !selectedRole) {
        handleSelectRole(rolesData[0]);
      } else if (selectedRole) {
        const updated = rolesData.find(r => r.id === selectedRole.id);
        if (updated) handleSelectRole(updated);
      }
    } catch (err) {
      console.error('Error fetching roles/permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setSelectedRolePermissions(role.permissions.map(p => p.id));
    setMessage('');
  };

  const handleTogglePermission = (permId) => {
    if (selectedRole?.isSystem) return; // Cannot modify system roles
    
    setSelectedRolePermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || selectedRole.isSystem) return;
    
    setIsSaving(true);
    setMessage('');
    try {
      const res = await assignPermissions(selectedRole.id, selectedRolePermissions);
      handleSelectRole(res.data);
      setMessage(t('Permissions updated successfully!'));
      fetchData(); // Refresh to get the latest
    } catch (err) {
      setMessage(err.response?.data?.message || t('Failed to update permissions.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      const res = await createRole({
        name: newRoleData.name,
        description: newRoleData.description
      });
      setModalOpen(false);
      setNewRoleData({ name: '', description: '' });
      fetchData();
      handleSelectRole(res.data);
    } catch (err) {
      setCreateError(err.response?.data?.message || t('Failed to create role.'));
    }
  };

  const handleDeleteRole = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t('Are you sure you want to delete this role?'))) return;
    
    try {
      await deleteRole(id);
      if (selectedRole?.id === id) {
        setSelectedRole(null);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('Failed to delete role'));
    }
  };

  if (loading && roles.length === 0) {
    return <div className="p-8 text-slate-500">{t('Loading roles and permissions...')}</div>;
  }

  // Group permissions by category (assuming permissions are named like CATEGORY_ACTION)
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.code.split('_')[0] || 'GENERAL';
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">{t('Roles & Permissions')}</h2>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm"
        >
          {t('+ Create Role')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role List */}
        <div className="lg:col-span-1 border-r border-slate-200 pr-6 h-[500px] overflow-y-auto">
          <ul className="space-y-3">
            {roles.map(role => (
              <li 
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`p-4 rounded-xl border cursor-pointer transition shadow-sm relative group ${
                  selectedRole?.id === role.id 
                    ? 'bg-indigo-50 border-indigo-200' 
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold ${selectedRole?.id === role.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {role.name}
                    </h3>
                    <p className={`text-xs mt-1 ${selectedRole?.id === role.id ? 'text-indigo-700' : 'text-slate-500'}`}>
                      {role.description} {role.system && t('(System)')}
                    </p>
                  </div>
                  {!role.system && (
                    <button
                      onClick={(e) => handleDeleteRole(e, role.id)}
                      className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition"
                      title={t('Delete role')}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900">
                  {t('Permissions for {{name}}', { name: selectedRole.name })}
                </h3>
                {selectedRole.isSystem ? (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">{t('System roles cannot be modified')}</span>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedRolePermissions(permissions.map(p => p.id))}
                      disabled={isSaving}
                      className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded hover:bg-indigo-200 transition text-sm font-medium disabled:opacity-50"
                    >
                      {t('Select All')}
                    </button>
                    <button 
                      onClick={() => setSelectedRolePermissions([])}
                      disabled={isSaving}
                      className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded hover:bg-slate-200 transition text-sm font-medium disabled:opacity-50"
                    >
                      {t('Clear')}
                    </button>
                    <button 
                      onClick={handleSavePermissions}
                      disabled={isSaving}
                      className="bg-slate-800 text-white px-4 py-1.5 rounded hover:bg-slate-900 transition text-sm disabled:opacity-50"
                    >
                      {isSaving ? t('Saving...') : t('Save Permissions')}
                    </button>
                  </div>
                )}
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[430px] overflow-y-auto pr-2">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
                    <h4 className="font-semibold text-sm mb-3 text-slate-700">{category}</h4>
                    <div className="space-y-2">
                      {perms.map(perm => (
                        <label key={perm.id} className={`flex items-start space-x-2 text-sm ${selectedRole.isSystem ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 cursor-pointer'}`}>
                          <input 
                            type="checkbox" 
                            checked={selectedRolePermissions.includes(perm.id)}
                            onChange={() => handleTogglePermission(perm.id)}
                            disabled={selectedRole.isSystem}
                            className={`rounded mt-0.5 ${selectedRole.isSystem ? 'text-slate-400 focus:ring-0' : 'text-indigo-600 focus:ring-indigo-500'}`} 
                          />
                          <div>
                            <div className="font-medium">{perm.code}</div>
                            {perm.description && <div className="text-xs text-slate-500">{t(perm.description)}</div>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              {t('Select a role to view permissions')}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{t('Create New Role')}</h3>
            
            {createError && (
              <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('Role Name')}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. DATA_ENTRY"
                  value={newRoleData.name}
                  onChange={(e) => setNewRoleData({...newRoleData, name: e.target.value.toUpperCase()})}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <p className="text-xs text-slate-500 mt-1">{t('Names are typically uppercase (e.g. MANAGER, AUDITOR).')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('Description')}</label>
                <textarea 
                  required
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData({...newRoleData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  rows="3"
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition font-medium text-sm"
                >
                  {t('Cancel')}
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-medium text-sm"
                >
                  {t('Create Role')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesTab;
