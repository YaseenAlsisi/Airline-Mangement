import React, { useState, useEffect } from 'react';
import { createAgent, updateAgent } from '../../api/agents.api';

const AgentFormModal = ({ isOpen, agent, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
    creditLimit: 0,
    currency: 'USD'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (agent) {
      setFormData(agent);
    } else {
      setFormData({
        code: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'ACTIVE',
        creditLimit: 0,
        currency: 'USD'
      });
    }
  }, [agent, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (agent) {
        const res = await updateAgent(agent.id, formData);
        onClose(true, 'UPDATE', res.data || res.content || res);
      } else {
        const res = await createAgent(formData);
        onClose(true, 'ADD', res.data || res.content || res);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred while saving the agent.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                {agent ? 'Edit Agent' : 'Create Agent'}
              </h3>

              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium leading-6 text-gray-900">Code *</label>
                  <input
                    type="text"
                    name="code"
                    id="code"
                    required
                    disabled={!!agent}
                    value={formData.code || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Name *</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">Address</label>
                  <textarea
                    name="address"
                    id="address"
                    rows={2}
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">Status</label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="creditLimit" className="block text-sm font-medium leading-6 text-gray-900">Credit Limit</label>
                    <input
                      type="number"
                      step="0.01"
                      name="creditLimit"
                      id="creditLimit"
                      value={formData.creditLimit || 0}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="currency" className="block text-sm font-medium leading-6 text-gray-900">Currency</label>
                    <select
                      name="currency"
                      id="currency"
                      value={formData.currency || 'USD'}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:bg-indigo-400"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentFormModal;