import React, { useState, useEffect } from 'react';
import { rolesApi } from '../../../api/usersApi';

const RolesTab = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Add Role Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        rolesApi.getAllRoles(),
        rolesApi.getAllPermissions()
      ]);
      setRoles(Array.isArray(rolesRes) ? rolesRes : (rolesRes.data || []));
      setPermissions(Array.isArray(permsRes) ? permsRes : (permsRes.data || []));
      
      const parsedRoles = Array.isArray(rolesRes) ? rolesRes : (rolesRes.data || []);
      if (parsedRoles && parsedRoles.length > 0) {
        setSelectedRole(parsedRoles[0]);
      }
    } catch (err) {
      console.error('Failed to load roles and permissions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setMessage('');
  };

  const togglePermission = (permissionId) => {
    if (!selectedRole || selectedRole.system) return;
    
    const hasPermission = selectedRole.permissions.some(p => p.id === permissionId);
    let updatedPermissions;
    
    if (hasPermission) {
      updatedPermissions = selectedRole.permissions.filter(p => p.id !== permissionId);
    } else {
      const permToAdd = permissions.find(p => p.id === permissionId);
      updatedPermissions = [...selectedRole.permissions, permToAdd];
    }
    
    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    });
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      setCreatingRole(true);
      const res = await rolesApi.createRole(newRole);
      setRoles([...roles, res.data || res]);
      setSelectedRole(res.data || res);
      setIsModalOpen(false);
      setNewRole({ name: '', description: '' });
      setMessage('Role created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to create role', err);
      alert(err.response?.data?.error?.message || 'Failed to create role.');
    } finally {
      setCreatingRole(false);
    }
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setMessage('');
    
    try {
      const permissionIds = selectedRole.permissions.map(p => p.id);
      const res = await rolesApi.assignPermissions(selectedRole.id, permissionIds);
      
      // Update the roles list with the saved role
      setRoles(roles.map(r => r.id === selectedRole.id ? (res.data || res) : r));
      setMessage('Permissions saved successfully!');
    } catch (err) {
      console.error('Failed to save permissions', err);
      setMessage('Failed to save permissions.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading roles...</div>;

  return (
    <div className="flex h-full min-h-[500px]">
      {/* Roles List Sidebar */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-medium text-slate-900">System Roles</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            + Add
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <ul className="divide-y divide-slate-200">
          {roles.map(role => (
            <li key={role.id}>
              <button 
                onClick={() => handleRoleSelect(role)}
                className={`w-full text-left px-4 py-4 hover:bg-slate-100 transition-colors ${selectedRole?.id === role.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">{role.name}</span>
                  <span className="text-xs bg-slate-200 text-slate-600 py-1 px-2 rounded-full">
                    {role.permissions?.length || 0} perms
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{role.description}</p>
              </button>
            </li>
          ))}
          </ul>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="w-2/3 p-6 bg-white">
        {selectedRole ? (
          <>
            <div className="mb-6 flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedRole.name} Permissions</h2>
                  {selectedRole.system && (
                    <span className="px-2 py-1 text-xs font-semibold bg-slate-200 text-slate-700 rounded-md">SYSTEM ROLE</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{selectedRole.description}</p>
              </div>
              {!selectedRole.system && (
                <button 
                  onClick={savePermissions}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm font-medium text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
            
            {message && <div className={`mb-4 p-3 rounded-md text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissions.map((perm) => {
                const isAssigned = selectedRole.permissions.some(p => p.id === perm.id);
                return (
                  <div key={perm.id} className="relative flex items-start p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                    <div className="flex h-5 items-center">
                      <input
                        id={`perm-${perm.id}`}
                        name={`perm-${perm.id}`}
                        type="checkbox"
                        checked={isAssigned}
                        disabled={selectedRole.system}
                        onChange={() => togglePermission(perm.id)}
                        className={`h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 ${selectedRole.system ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={`perm-${perm.id}`} className="font-medium text-slate-900 cursor-pointer">
                        {perm.name}
                      </label>
                      <p className="text-slate-500 mt-1">{perm.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Select a role to view and manage permissions
          </div>
        )}
      </div>

      {/* Add Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateRole}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[70vh] overflow-y-auto">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">
                        Add New Role
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Role Name</label>
                          <input 
                            type="text" 
                            required 
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newRole.name}
                            onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                            placeholder="e.g. MANAGER"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Description</label>
                          <textarea 
                            required 
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newRole.description}
                            onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit" 
                    disabled={creatingRole}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {creatingRole ? 'Creating...' : 'Create Role'}
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

export default RolesTab;
