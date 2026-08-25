import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAgentTransactions } from '../../api/agentBalance.api';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AgentTransactionLedgerModal = ({ agent, isOpen, onClose }) => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (isOpen && agent) {
            fetchTransactions();
        }
    }, [isOpen, agent]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await getAgentTransactions(agent.agentId, { size: 1000 });
            setTransactions(res.data?.content || res.data?.data?.content || []);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <div className="relative mx-auto w-full max-w-6xl bg-white rounded-xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">
                        كشف حساب: {agent.agentName}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Summary Row */}
                <div className="p-6 bg-gray-50 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500">اجمالي مدين $</p>
                        <p className="text-lg font-bold text-red-600">{Number(agent.totalDebitUsd || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500">اجمالي دائن $</p>
                        <p className="text-lg font-bold text-green-600">{Number(agent.totalCreditUsd || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500">اجمالي مدين EGP</p>
                        <p className="text-lg font-bold text-red-600">{Number(agent.totalDebitEgp || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500">اجمالي دائن EGP</p>
                        <p className="text-lg font-bold text-green-600">{Number(agent.totalCreditEgp || 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">{t('common.loading', 'Loading...')}</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">لا توجد معاملات</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">النوع</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">الاسم / البيان</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">رقم الجواز</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التاريخ</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">مدين $</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">دائن $</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">مدين EGP</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">دائن EGP</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                txn.transactionType === 'PAYMENT' ? 'bg-green-100 text-green-800' :
                                                txn.transactionType === 'PASSENGER' ? 'bg-blue-100 text-blue-800' :
                                                txn.transactionType === 'OPENING_BALANCE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {txn.transactionType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 font-medium">
                                            {txn.passengerName || txn.paymentDescription || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                            {txn.passportNumber || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                            {txn.departureDate || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-red-600 font-medium">
                                            {txn.debitUsd > 0 ? Number(txn.debitUsd).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-green-600 font-medium">
                                            {txn.creditUsd > 0 ? Number(txn.creditUsd).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-red-600 font-medium">
                                            {txn.debitEgp > 0 ? Number(txn.debitEgp).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-green-600 font-medium">
                                            {txn.creditEgp > 0 ? Number(txn.creditEgp).toLocaleString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentTransactionLedgerModal;
