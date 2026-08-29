import React, { useState, useEffect } from 'react';
import { XMarkIcon, BanknotesIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { updateAgentPayment, deleteAgentPayment } from '../../api/agentPayment.api';

export const AgentPaymentHistoryModal = ({ isOpen, onClose, agentGroup, payments = [], onPaymentsChanged }) => {
  const { t } = useTranslation();
  const [editingPayment, setEditingPayment] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editPaymentType, setEditPaymentType] = useState('CREDIT');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !agentGroup) return null;

  const handleEditClick = (payment) => {
    setEditingPayment(payment.id);
    setEditAmount(payment.amount);
    setEditPaymentType(payment.paymentType || 'CREDIT');
    // Format date for date input
    const dateStr = payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '';
    setEditDate(dateStr);
    setEditNote(payment.note || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;
    
    setLoading(true);
    try {
      await updateAgentPayment(editingPayment, {
        amount: Number(editAmount),
        paymentType: editPaymentType,
        paymentDate: editDate ? new Date(editDate).toISOString() : new Date().toISOString(),
        note: editNote
      });
      setEditingPayment(null);
      onPaymentsChanged(); // Refresh data
    } catch (error) {
      console.error('Error updating payment', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this payment?'))) return;
    
    setLoading(true);
    try {
      await deleteAgentPayment(id);
      onPaymentsChanged();
    } catch (error) {
      console.error('Error deleting payment', error);
    } finally {
      setLoading(false);
    }
  };

  const agentPayments = payments.filter(p => p.agentNameRaw === agentGroup.agentName).sort((a, b) => {
    const dateA = new Date(a.paymentDate).getTime();
    const dateB = new Date(b.paymentDate).getTime();
    return dateA - dateB;
  });

  return (
    <div className="relative z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto" onClick={onClose}>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div 
            className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 border border-indigo-200">
                  <BanknotesIcon className="h-6 w-6 text-indigo-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900" id="modal-title">
                    {t('agent.paymentHistory', 'Payment History')}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">{agentGroup.agentName}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full p-2 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {agentPayments.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                  <BanknotesIcon className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">{t('agent.noPayments', 'No payments found')}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t('agent.noPaymentsDesc', 'This agent has no recorded payments yet.')}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-start text-xs font-bold text-slate-500 uppercase">{t('agent.payment.date', 'Date')}</th>
                        <th className="px-4 py-3 text-start text-xs font-bold text-slate-500 uppercase">{t('agent.payment.type', 'Type')}</th>
                        <th className="px-4 py-3 text-start text-xs font-bold text-slate-500 uppercase">{t('agent.payment.amount', 'Amount')}</th>
                        <th className="px-4 py-3 text-start text-xs font-bold text-slate-500 uppercase">{t('common.note', 'Note')}</th>
                        <th className="px-4 py-3 text-end text-xs font-bold text-slate-500 uppercase">{t('import.col.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {agentPayments.map(payment => (
                        <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                          {editingPayment === payment.id ? (
                            <td colSpan="4" className="p-4 bg-indigo-50/50">
                              <form onSubmit={handleSaveEdit} className="flex flex-wrap md:flex-nowrap items-end gap-3">
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('agent.payment.date', 'Date')}</label>
                                  <input type="date" required className="w-full rounded-lg border-slate-300 py-2 px-3 text-sm" value={editDate} onChange={e => setEditDate(e.target.value)} />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('agent.payment.type', 'Type')}</label>
                                  <select required className="w-full rounded-lg border-slate-300 py-2 px-3 text-sm" value={editPaymentType} onChange={e => setEditPaymentType(e.target.value)}>
                                    <option value="CREDIT">{t('agent.payment.credit', 'دائن')}</option>
                                    <option value="DEBIT">{t('agent.payment.debit', 'مدين')}</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('agent.payment.amount', 'Amount')}</label>
                                  <input type="number" required min="0.01" step="0.01" className="w-full rounded-lg border-slate-300 py-2 px-3 text-sm" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('common.note', 'Note')}</label>
                                  <input type="text" className="w-full rounded-lg border-slate-300 py-2 px-3 text-sm" value={editNote} onChange={e => setEditNote(e.target.value)} />
                                </div>
                                <div className="flex shrink-0 gap-2">
                                  <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">{t('common.save', 'Save')}</button>
                                  <button type="button" disabled={loading} onClick={() => setEditingPayment(null)} className="bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-bold border border-slate-300 hover:bg-slate-50">{t('common.cancel', 'Cancel')}</button>
                                </div>
                              </form>
                            </td>
                          ) : (
                            <>
                              <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold">
                                {payment.paymentType === 'DEBIT' ? (
                                  <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs border border-orange-200">{t('agent.payment.debit', 'مدين')}</span>
                                ) : (
                                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs border border-emerald-200">{t('agent.payment.credit', 'دائن')}</span>
                                )}
                              </td>
                              <td className={`whitespace-nowrap px-4 py-4 text-sm font-bold ${payment.paymentType === 'DEBIT' ? 'text-orange-600' : 'text-emerald-600'}`}>
                                {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500 font-medium ml-1">{payment.currency || 'EGP'}</span>
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate" title={payment.note}>
                                {payment.note || '-'}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-end text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditClick(payment)} className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(payment.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-3xl shrink-0 flex justify-end">
              <button
                type="button"
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-colors"
                onClick={onClose}
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPaymentHistoryModal;
