import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getAgents } from '../../../api/agents.api';

export const ManifestRowFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      getAgents({ size: 5000 })
        .then(res => {
          const agentsData = res.data?.data?.content || res.data?.content || res.content || [];
          const activeAgents = Array.isArray(agentsData) ? agentsData.filter(a => a.status !== 'DELETED') : [];
          setAgents(activeAgents);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          agentNameRaw: '',
          passengerName: '',
          passportNumber: '',
          passengerCategory: 'ADULT',
          departureDate: '',
          flightNumber: '',
          destination: '',
          departurePort: '',
          birthDate: '',
          arrivalTime: '',
          serviceType: '',
          serviceType: '',
          regularPrice: 0,
          commission: 0,
          debitCurrency: 'EGP',
          debitAmount: 0
        });
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen && initialData) {
      const hasUsd = (initialData.debitUsd && Number(initialData.debitUsd) > 0);
      setFormData(prev => ({
        ...prev,
        debitCurrency: hasUsd ? 'USD' : 'EGP',
        debitAmount: hasUsd ? initialData.debitUsd : (initialData.debitEgp || 0)
      }));
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitData = { ...formData };
      
      if (submitData.debitCurrency === 'USD') {
        submitData.debitUsd = submitData.debitAmount;
        submitData.debitEgp = 0;
      } else {
        submitData.debitEgp = submitData.debitAmount;
        submitData.debitUsd = 0;
      }
      
      delete submitData.debitCurrency;
      delete submitData.debitAmount;

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-bold leading-6 text-slate-900 mb-6" id="modal-title">
                {t('import.addManualRow', 'Add Data Entry')}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Agent */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.agent', 'Agent')}</label>
                    <input required type="text" list="agentsList" name="agentNameRaw" value={formData.agentNameRaw} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    <datalist id="agentsList">
                      {agents.map(a => (
                        <option key={a.id} value={a.name} />
                      ))}
                    </datalist>
                  </div>
                  
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.passengerName', 'Passenger Name')}</label>
                    <input required type="text" name="passengerName" value={formData.passengerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>
                  
                  {/* Passport */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.passport', 'Passport')}</label>
                    <input required type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.category', 'Category')}</label>
                    <select name="passengerCategory" value={formData.passengerCategory} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm">
                      <option value="ADULT">بالغ - Adult</option>
                      <option value="CHILD">طفل - Child</option>
                      <option value="CHILD_UNDER_8">طفل تحت 8 سنوات - Child under 8</option>
                      <option value="LADIES">سيدة - Ladies</option>
                      <option value="INFANT">رضيع - Infant</option>
                    </select>
                  </div>

                  {/* Dep Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.departureDate', 'Dep. Date')}</label>
                    <input required type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>

                  {/* Flight */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.flight', 'Flight')}</label>
                    <input type="text" name="flightNumber" value={formData.flightNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.destination', 'Destination')}</label>
                    <input type="text" name="destination" value={formData.destination} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>

                  {/* Dep Port */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.departurePort', 'Dep. Port')}</label>
                    <input type="text" name="departurePort" value={formData.departurePort} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.birthDate', 'Birth Date')}</label>
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>

                  {/* Arrival Time */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.arrivalTime', 'Arrival Time')}</label>
                    <input type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" step="2" />
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.serviceType', 'Service Type')}</label>
                    <input type="text" name="serviceType" value={formData.serviceType} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>
                  
                  {/* Prices */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.regularPrice', 'Regular Price')}</label>
                    <input type="number" step="0.01" name="regularPrice" value={formData.regularPrice} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.commission', 'Commission')}</label>
                    <input type="number" step="0.01" name="commission" value={formData.commission} onChange={handleChange} className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">{t('import.col.debitAmount', 'Debit Amount')}</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <select
                        name="debitCurrency"
                        value={formData.debitCurrency}
                        onChange={handleChange}
                        className="rounded-l-md border-0 py-1.5 pl-3 pr-8 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-slate-50"
                      >
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        name="debitAmount"
                        value={formData.debitAmount}
                        onChange={handleChange}
                        className="block w-full rounded-r-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-slate-300">
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
                    {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
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
