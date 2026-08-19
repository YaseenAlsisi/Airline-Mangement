import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export const AgentPassengersModal = ({ agent, isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen || !agent) return null;
  
  const passengers = agent.passengers || [];

  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto" onClick={onClose}>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6 border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-xl font-bold leading-6 text-slate-900 mb-4" id="modal-title">
                  {t('agent.passengers.title', 'Passengers for')} <span className="text-indigo-600">{agent.agentName}</span>
                </h3>
                <div className="mt-4">
                  {passengers.length === 0 ? (
                    <div className="text-sm text-slate-500 bg-slate-50 p-8 rounded-xl text-center border border-slate-200">{t('agent.passengers.none', 'No passengers found for this agent.')}</div>
                  ) : (
                    <div className="overflow-x-auto ring-1 ring-slate-200 sm:rounded-xl shadow-sm">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3.5 text-start text-xs font-semibold text-slate-900 uppercase tracking-wider">{t('import.col.passengerName', 'Name')}</th>
                            <th className="px-4 py-3.5 text-start text-xs font-semibold text-slate-900 uppercase tracking-wider">{t('import.col.passport', 'Passport')}</th>
                            <th className="px-4 py-3.5 text-start text-xs font-semibold text-slate-900 uppercase tracking-wider">{t('import.col.departureDate', 'Date')}</th>
                            <th className="px-4 py-3.5 text-start text-xs font-semibold text-slate-900 uppercase tracking-wider">{t('import.col.serviceType', 'Service Type')}</th>
                            <th className="px-4 py-3.5 text-start text-xs font-semibold text-slate-900 uppercase tracking-wider">{t('import.col.destination', 'Dest')}</th>
                            <th className="px-4 py-3.5 text-start text-xs font-semibold text-slate-900 uppercase tracking-wider">{t('import.col.category', 'Category')}</th>
                            <th className="px-4 py-3.5 text-start text-xs font-semibold text-slate-900 uppercase tracking-wider">{t('agent.debit', 'Debit')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {passengers.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{p.passengerName}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{p.passportNumber}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{p.departureDate}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{p.serviceType || p.flightNumber || '-'}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{p.destination}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{p.passengerCategory}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{(p.totalPrice != null ? p.totalPrice : p.debitEgp) || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPassengersModal;
