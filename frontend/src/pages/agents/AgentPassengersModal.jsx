import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ManifestRowFormModal } from '../import/components/ManifestRowFormModal';
import { addPublishedPassenger, updatePublishedPassenger, deletePublishedPassenger } from '../../api/manifestImport.api';

export const AgentPassengersModal = ({ agent, isOpen, onClose, onDataChanged }) => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState(null);

  if (!isOpen || !agent) return null;
  
  const passengers = [...(agent.passengers || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime() || 0;
    const dateB = new Date(b.createdAt).getTime() || 0;
    return dateA - dateB;
  });

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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold leading-6 text-slate-900" id="modal-title">
                    {t('agent.passengers.title', 'Passengers for')} <span className="text-indigo-600">{agent.agentName}</span>
                  </h3>
                  {!agent.isDeleted && (
                    <button 
                      onClick={() => {
                        setEditingPassenger({ agentNameRaw: agent.agentName }); // Pre-fill agent name
                        setIsFormOpen(true);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                      {t('import.addManualRow', 'Add Passenger')}
                    </button>
                  )}
                </div>
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
                            <th className="px-4 py-3.5 text-end text-xs font-semibold text-slate-900 uppercase tracking-wider">{t('import.col.actions', 'Actions')}</th>
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
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                                {Number(p.debitUsd) > 0 
                                  ? `${p.debitUsd} USD` 
                                  : `${(p.totalPrice != null ? p.totalPrice : p.debitEgp) || 0} EGP`}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                                {!agent.isDeleted ? (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setEditingPassenger(p);
                                        setIsFormOpen(true);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-900 font-medium mr-3"
                                    >
                                      {t('common.edit', 'Edit')}
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        if (window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this?'))) {
                                          await deletePublishedPassenger(p.id);
                                          if (onDataChanged) onDataChanged();
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-900 font-medium"
                                    >
                                      {t('common.delete', 'Delete')}
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-slate-400 text-xs italic">{t('common.deleted', 'Deleted')}</span>
                                )}
                              </td>
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
      <ManifestRowFormModal
        isOpen={isFormOpen}
        initialData={editingPassenger}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPassenger(null);
        }}
        onSave={async (data) => {
          if (editingPassenger && editingPassenger.id) {
            await updatePublishedPassenger(editingPassenger.id, data);
          } else {
            await addPublishedPassenger(agent.id, data);
          }
          if (onDataChanged) onDataChanged();
        }}
      />
    </div>
  );
};

export default AgentPassengersModal;
