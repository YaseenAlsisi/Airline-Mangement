import React, { useState, useEffect } from 'react';
import { createPriceList, updatePriceList } from '../../api/priceLists.api';
import { getAgents } from '../../api/agents.api';
import { getAirlines } from '../../api/airlines.api';
import { useTranslation } from 'react-i18next';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const PriceListFormModal = ({ isOpen, priceList, onClose }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    airlineId: null,
    agentId: null,
    status: 'ACTIVE',
    validFrom: null,
    validTo: null,
    entries: []
  });

  const [agents, setAgents] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
    if (priceList) {
      setFormData({
        ...priceList,
        entries: priceList.entries || []
      });
    } else {
      setFormData({
        code: '',
        name: '',
        airlineId: null,
        agentId: null,
        status: 'ACTIVE',
        validFrom: null,
        validTo: null,
        entries: []
      });
    }
  }, [priceList, isOpen]);

  const fetchDropdownData = async () => {
    try {
      const [agentsRes, airlinesRes] = await Promise.all([
        getAgents({ size: 1000 }), 
        getAirlines({ size: 1000 })
      ]);
      setAgents(agentsRes.data?.content || []);
      setAirlines(airlinesRes.data?.content || []);
    } catch (e) {
      console.error("Failed to load dropdown data", e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value === '' ? null : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...formData.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setFormData({ ...formData, entries: newEntries });
  };

  const addEntry = () => {
    setFormData({
      ...formData,
      entries: [
        ...formData.entries,
        {
          departure: '',
          destination: '',
          passengerType: '',
          price: 0,
          commission: 0,
          currency: 'EGP'
        }
      ]
    });
  };

  const removeEntry = (index) => {
    const newEntries = [...formData.entries];
    newEntries.splice(index, 1);
    setFormData({ ...formData, entries: newEntries });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (priceList) {
        await updatePriceList(priceList.id, formData);
      } else {
        await createPriceList(formData);
      }
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-start shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                {priceList ? 'Edit Price List' : 'Create Price List'}
              </h3>
              
              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium leading-6 text-gray-900">Code *</label>
                    <input
                      type="text"
                      name="code"
                      id="code"
                      required
                      disabled={!!priceList}
                      value={formData.code || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Name / Description *</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="agentId" className="block text-sm font-medium leading-6 text-gray-900">Applies To Agent</label>
                    <select
                      name="agentId"
                      id="agentId"
                      value={formData.agentId || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="">-- All Agents (Global) --</option>
                      {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="airlineId" className="block text-sm font-medium leading-6 text-gray-900">Applies To Airline</label>
                    <select
                      name="airlineId"
                      id="airlineId"
                      value={formData.airlineId || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="">-- All Airlines (Global) --</option>
                      {airlines.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">Status</label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
                
                {/* Pricing Matrix Section */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium leading-6 text-gray-900">Pricing Matrix</h4>
                    <button
                      type="button"
                      onClick={addEntry}
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      <PlusIcon className="-ms-0.5 h-5 w-5" aria-hidden="true" />
                      {t('priceList.addEntry')}
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th className="py-3.5 pe-3 text-start text-sm font-semibold text-gray-900">{t('priceList.departure')}</th>
                          <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('priceList.destination')}</th>
                          <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('priceList.passengerType')}</th>
                          <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('priceList.price')}</th>
                          <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('priceList.commission')}</th>
                          <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('priceList.currency')}</th>
                          <th className="relative py-3.5 ps-3 pe-4 sm:pe-0">
                            <span className="sr-only">{t('priceList.remove')}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.entries.map((entry, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pe-3 text-sm">
                              <input
                                list="departures-list"
                                value={entry.departure}
                                onChange={(e) => handleEntryChange(index, 'departure', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                required
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <input
                                list="destinations-list"
                                value={entry.destination}
                                onChange={(e) => handleEntryChange(index, 'destination', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                required
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <input
                                list="passengers-list"
                                value={entry.passengerType}
                                onChange={(e) => handleEntryChange(index, 'passengerType', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                required
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <input
                                type="number"
                                step="0.01"
                                value={entry.price}
                                onChange={(e) => handleEntryChange(index, 'price', parseFloat(e.target.value))}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                required
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <input
                                type="number"
                                step="0.01"
                                value={entry.commission}
                                onChange={(e) => handleEntryChange(index, 'commission', parseFloat(e.target.value))}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                required
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <select
                                value={entry.currency}
                                onChange={(e) => handleEntryChange(index, 'currency', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              >
                                <option value="EGP">{t('priceList.currencies.EGP')}</option>
                                <option value="USD">{t('priceList.currencies.USD')}</option>
                                <option value="EUR">{t('priceList.currencies.EUR')}</option>
                              </select>
                            </td>
                            <td className="relative whitespace-nowrap py-4 ps-3 pe-4 text-end text-sm font-medium sm:pe-0">
                              <button
                                type="button"
                                onClick={() => removeEntry(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <datalist id="departures-list">
                  <option value={t('priceList.departures.Borg El Arab')} />
                  <option value={t('priceList.departures.Cairo')} />
                </datalist>
                
                <datalist id="destinations-list">
                  <option value={t('priceList.destinations.Benghazi')} />
                  <option value={t('priceList.destinations.Tripoli')} />
                  <option value={t('priceList.destinations.Misrata')} />
                  <option value={t('priceList.destinations.Sabha')} />
                  <option value={t('priceList.destinations.Land')} />
                </datalist>

                <datalist id="passengers-list">
                  <option value={t('priceList.passengerTypes.Adult')} />
                  <option value={t('priceList.passengerTypes.ChildTo8')} />
                  <option value={t('priceList.passengerTypes.Child')} />
                  <option value={t('priceList.passengerTypes.Ladies')} />
                  <option value={t('priceList.passengerTypes.Infant')} />
                </datalist>

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

export default PriceListFormModal;