import React, { useState, useEffect } from 'react';
import { createPriceList, updatePriceList } from '../../api/priceLists.api';
import { useTranslation } from 'react-i18next';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultEntry = () => ({
  clientId: generateId(),
  passengerType: '',
  price: '',
  commission: '',
  currency: 'EGP'
});

const defaultGroup = () => ({
  clientId: generateId(),
  departureAirport: '',
  destination: '',
  entries: [defaultEntry()]
});

const PASSENGER_TYPES = ['ADULT', 'CHILD', 'CHILD_UNDER_8', 'LADIES', 'INFANT', 'SINGLE_SERVICE'];

const PriceListFormModal = ({ isOpen, priceList, onClose }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    status: 'ACTIVE',
    validFrom: '',
    validTo: '',
    groups: [defaultGroup()]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (priceList) {
      setFormData({
        code: priceList.code || '',
        name: priceList.name || '',
        status: priceList.status || 'ACTIVE',
        validFrom: priceList.validFrom || '',
        validTo: priceList.validTo || '',
        groups: priceList.groups && priceList.groups.length > 0 
          ? priceList.groups.map(g => ({
              id: g.id,
              clientId: generateId(),
              departureAirport: g.departureAirport || '',
              destination: g.destination || '',
              entries: g.entries && g.entries.length > 0 
                ? g.entries.map(e => ({
                    id: e.id,
                    clientId: generateId(),
                    passengerType: e.passengerType || '',
                    price: e.price !== undefined && e.price !== null ? e.price : '',
                    commission: e.commission !== undefined && e.commission !== null ? e.commission : '',
                    currency: e.currency || 'EGP'
                  }))
                : [defaultEntry()]
            }))
          : [defaultGroup()]
      });
    } else {
      setFormData({
        code: '',
        name: '',
        status: 'ACTIVE',
        validFrom: '',
        validTo: '',
        groups: [defaultGroup()]
      });
    }
  }, [priceList, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleGroupChange = (groupIndex, field, value) => {
    const newGroups = [...formData.groups];
    newGroups[groupIndex] = { ...newGroups[groupIndex], [field]: value };
    setFormData({ ...formData, groups: newGroups });
  };

  const handleEntryChange = (groupIndex, entryIndex, field, value) => {
    const newGroups = [...formData.groups];
    const newEntries = [...newGroups[groupIndex].entries];
    newEntries[entryIndex] = { ...newEntries[entryIndex], [field]: value };
    newGroups[groupIndex].entries = newEntries;
    setFormData({ ...formData, groups: newGroups });
  };

  const addGroup = () => {
    setFormData({
      ...formData,
      groups: [...formData.groups, defaultGroup()]
    });
  };

  const removeGroup = (groupIndex) => {
    const newGroups = [...formData.groups];
    newGroups.splice(groupIndex, 1);
    setFormData({ ...formData, groups: newGroups });
  };

  const addEntry = (groupIndex) => {
    const newGroups = [...formData.groups];
    newGroups[groupIndex].entries.push(defaultEntry());
    setFormData({ ...formData, groups: newGroups });
  };

  const removeEntry = (groupIndex, entryIndex) => {
    const newGroups = [...formData.groups];
    newGroups[groupIndex].entries.splice(entryIndex, 1);
    setFormData({ ...formData, groups: newGroups });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.code) {
        dataToSubmit.code = `PL-${Date.now()}`;
      }
      if (!dataToSubmit.name) {
        dataToSubmit.name = `Price List ${new Date().toLocaleString()}`;
      }

      // Basic Validation Check for duplicates
      for (const group of dataToSubmit.groups) {
        const types = group.entries.map(e => e.passengerType).filter(Boolean);
        if (new Set(types).size !== types.length) {
           throw new Error(t('priceList.validation.duplicatePassengerType', 'Duplicate passenger types within the same group are not allowed.'));
        }
      }

      if (priceList) {
        await updatePriceList(priceList.id, dataToSubmit);
        onClose(true, t('priceList.updateSuccess', 'تم تعديل قائمة الأسعار بنجاح'));
      } else {
        await createPriceList(dataToSubmit);
        onClose(true, t('priceList.createSuccess', 'تم إضافة قائمة الأسعار بنجاح'));
      }
    } catch (err) {
      const apiError = err.response?.data;
      const errorMessage = apiError?.error?.message || 
                           (typeof apiError?.error === 'string' ? apiError.error : null) || 
                           apiError?.message || 
                           err.message || 
                           'An error occurred while saving.';
      setError(errorMessage);
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
          <div className="relative transform overflow-hidden rounded-lg bg-white text-start shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-start w-full">
                  <h3 className="text-xl font-semibold leading-6 text-gray-900" id="modal-title">
                    {priceList ? t('priceList.edit', 'Edit Price List') : t('priceList.add', 'Create Price List')}
                  </h3>
                  
                  {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <form id="priceListForm" onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">{t('priceList.name', 'Name')}</label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-white"
                            placeholder="Optional: Auto-generated if empty"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium leading-6 text-slate-700">{t('priceList.code', 'Code')}</label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="code"
                            value={formData.code || ''}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-white"
                            placeholder="Optional: Auto-generated if empty"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing Groups Builder */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold leading-6 text-gray-900">{t('priceList.pricingGroups', 'Pricing Groups')}</h4>
                        <button
                          type="button"
                          onClick={addGroup}
                          className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                          {t('priceList.addPricingGroup', 'Add Pricing Group')}
                        </button>
                      </div>

                      {formData.groups.length === 0 && (
                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                          {t('priceList.empty.description', 'No pricing groups added yet.')}
                        </div>
                      )}

                      {formData.groups.map((group, groupIndex) => (
                        <div key={group.clientId} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-indigo-200 transition-colors">
                          {/* Group Header */}
                          <div className="bg-slate-50/80 px-5 py-4 flex justify-between items-center border-b border-slate-100">
                            <span className="font-bold text-slate-700 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">{groupIndex + 1}</div>
                              {t('priceList.pricingGroup', 'Pricing Group')}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeGroup(groupIndex)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                              {t('priceList.removePricingGroup', 'Remove Group')}
                            </button>
                          </div>
                          
                          <div className="p-5 space-y-6">
                            {/* Route Inputs */}
                            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                              <div>
                                <label className="block text-sm font-medium leading-6 text-slate-700">
                                  {t('priceList.departureAirport', 'Departure Airport / Port')}
                                </label>
                                <input
                                  type="text"
                                  value={group.departureAirport}
                                  onChange={(e) => handleGroupChange(groupIndex, 'departureAirport', e.target.value)}
                                  className="mt-1 block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-white"
                                  placeholder={t('priceList.departureAirportPlaceholder', 'Type departure...')}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium leading-6 text-slate-700">
                                  {t('priceList.destination', 'Destination')}
                                </label>
                                <input
                                  type="text"
                                  value={group.destination}
                                  onChange={(e) => handleGroupChange(groupIndex, 'destination', e.target.value)}
                                  className="mt-1 block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-white"
                                  placeholder={t('priceList.destinationPlaceholder', 'Type destination...')}
                                  required
                                />
                              </div>
                            </div>

                            {/* Passenger Pricing Table */}
                            <div className="mt-6 pt-4 border-t border-slate-100">
                              <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold leading-6 text-slate-800">
                                  {t('priceList.passengerPricing', 'Passenger Pricing')}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addEntry(groupIndex)}
                                  className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center transition-colors"
                                >
                                  <PlusIcon className="h-4 w-4 mr-1.5" />
                                  {t('priceList.addPassengerType', 'Add Passenger')}
                                </button>
                              </div>
                              <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                  <thead className="bg-slate-50">
                                    <tr>
                                      <th scope="col" className="px-4 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('priceList.passengerType', 'Passenger Type')}</th>
                                      <th scope="col" className="px-4 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('priceList.price', 'Price')}</th>
                                      <th scope="col" className="px-4 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('priceList.commission', 'Commission')}</th>
                                      <th scope="col" className="px-4 py-3.5 text-start text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('priceList.currency', 'Currency')}</th>
                                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-16"><span className="sr-only">Actions</span></th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                    {group.entries.map((entry, entryIndex) => {
                                      // Determine disabled passenger types
                                      const selectedTypes = group.entries.map(e => e.passengerType).filter(Boolean);
                                      return (
                                        <tr key={entry.clientId} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                                            <select
                                              value={entry.passengerType}
                                              onChange={(e) => handleEntryChange(groupIndex, entryIndex, 'passengerType', e.target.value)}
                                              className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-white"
                                              required
                                            >
                                              <option value="">{t('priceList.selectType', 'Select Type')}</option>
                                              {PASSENGER_TYPES.map(type => (
                                                <option 
                                                  key={type} 
                                                  value={type} 
                                                  disabled={selectedTypes.includes(type) && entry.passengerType !== type}
                                                >
                                                  {t(`passengerType.${type}`, type)}
                                                </option>
                                              ))}
                                            </select>
                                          </td>
                                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                                            <input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              placeholder="0.00"
                                              value={entry.price}
                                              onChange={(e) => handleEntryChange(groupIndex, entryIndex, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                              className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-white"
                                              required
                                            />
                                          </td>
                                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                                            <input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              placeholder="0.00"
                                              value={entry.commission}
                                              onChange={(e) => handleEntryChange(groupIndex, entryIndex, 'commission', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                              className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-white"
                                              required
                                            />
                                          </td>
                                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                                            <select
                                              value={entry.currency}
                                              onChange={(e) => handleEntryChange(groupIndex, entryIndex, 'currency', e.target.value)}
                                              className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-white"
                                            >
                                              <option value="EGP">EGP</option>
                                              <option value="USD">USD</option>
                                              <option value="EUR">EUR</option>
                                            </select>
                                          </td>
                                          <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-center text-sm font-medium sm:pr-6">
                                            <button
                                              type="button"
                                              onClick={() => removeEntry(groupIndex, entryIndex)}
                                              className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                              title={t('priceList.removePassengerType', 'Remove')}
                                            >
                                              <TrashIcon className="h-5 w-5" />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </form>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
              <button
                type="submit"
                form="priceListForm"
                disabled={loading}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:bg-indigo-400"
              >
                {loading ? t('priceList.saving', 'Saving...') : t('priceList.save', 'Save')}
              </button>
              <button
                type="button"
                onClick={() => onClose(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {t('priceList.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceListFormModal;