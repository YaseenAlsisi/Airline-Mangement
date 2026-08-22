import React, { useState } from 'react';
import { XMarkIcon, CurrencyDollarIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { createAgentPayment } from '../../api/agentPayment.api';

export const AgentPaymentModal = ({ agentGroup, isOpen, onClose, onPaymentApplied }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currency, setCurrency] = useState('EGP');

  React.useEffect(() => {
    if (agentGroup?.fullAgentData?.currency) {
      setCurrency(agentGroup.fullAgentData.currency);
    } else {
      setCurrency('EGP');
    }
  }, [agentGroup, isOpen]);

  if (!isOpen || !agentGroup) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setErrorMsg(t('agent.payment.invalidAmount', 'Invalid amount'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        agentNameRaw: agentGroup.agentName,
        amount: paymentAmount,
        currency: currency,
        paymentDate: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        note: note
      };

      await createAgentPayment(payload);

      setSuccessMsg(t('agent.payment.success', 'Payment applied successfully!'));
      onPaymentApplied();
      setAmount('');
      setNote('');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (error) {
      console.error('Error applying payment:', error);
      setErrorMsg(t('agent.payment.error', 'Failed to apply payment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-20" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto" onClick={onClose}>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div 
            className="relative transform overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-8 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-start w-full">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 sm:mx-0 mb-4">
                  <BanknotesIcon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold leading-6 text-slate-900 mb-2" id="modal-title">
                  {t('agent.payment.title', 'Add Payment for')} <span className="text-emerald-600">{agentGroup.agentName}</span>
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {t('agent.payment.description', 'This payment will be recorded in the agent\'s ledger.')}
                </p>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-100">
                    {errorMsg}
                  </div>
                )}
                
                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 w-full">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-semibold text-slate-700">
                      {t('agent.payment.amount', 'Amount')}
                    </label>
                    <div className="relative mt-2 flex rounded-xl shadow-sm">
                      <select
                        name="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="rounded-l-xl border-0 py-3 pl-3 pr-8 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-emerald-600 sm:text-sm font-bold bg-slate-50"
                      >
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                      </select>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        required
                        min="1"
                        step="0.01"
                        className="block w-full rounded-r-xl border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 font-bold"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="paymentDate" className="block text-sm font-semibold text-slate-700">
                      {t('agent.payment.date', 'Date')}
                    </label>
                    <div className="mt-2">
                      <input
                        type="date"
                        name="paymentDate"
                        id="paymentDate"
                        required
                        className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 font-medium"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="note" className="block text-sm font-semibold text-slate-700">
                      {t('common.note', 'Note')}
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="note"
                        id="note"
                        className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 font-medium"
                        placeholder={t('agent.enterNote', 'Enter Note:')}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      className="w-1/2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                      onClick={onClose}
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors flex justify-center disabled:opacity-70"
                    >
                      {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPaymentModal;
