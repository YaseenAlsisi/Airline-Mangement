import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBalanceReport } from '../../api/agentBalance.api';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import AgentTransactionLedgerModal from './AgentTransactionLedgerModal';


export const AgentBalanceReportPage = () => {
    useDocumentTitle('Agent Balance Report');
    const { t } = useTranslation();
    const [ticketPrice, setTicketPrice] = useState(45200);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async (price = ticketPrice) => {
        setLoading(true);
        try {
            const res = await getBalanceReport(price);
            setReport(res.data || res);
        } catch (error) {
            console.error('Failed to fetch report', error);
            alert(t('agents.balanceReport.fetchError', 'Failed to fetch report'));
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (e) => {
        setTicketPrice(e.target.value);
    };

    const handleApplyPrice = () => {
        fetchReport(ticketPrice);
    };

    const openLedger = (agent) => {
        setSelectedAgent(agent);
        setIsLedgerOpen(true);
    };

    if (loading && !report) {
        return <div className="p-8 text-center">{t('common.loading', 'Loading...')}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('agents.balanceReport.title', 'الرئيسية (Agent Balance Report)')}</h1>
                <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
                    <label className="text-sm font-medium text-gray-700">{t('agents.balanceReport.ticketPrice', 'Ticket Price (EGP):')}</label>
                    <input 
                        type="number" 
                        value={ticketPrice} 
                        onChange={handlePriceChange}
                        className="border border-gray-300 rounded px-3 py-2 w-32 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button 
                        onClick={handleApplyPrice}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {t('common.apply', 'Apply')}
                    </button>
                </div>
            </div>

            {report && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">م</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الوكيل</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اجمالي المديونيه $</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اجمالي المديونيه EGP</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد التذاكر التقريبي</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {report.agents?.map((agent, idx) => (
                                    <tr key={agent.agentId} className="hover:bg-gray-50 cursor-pointer" onClick={() => openLedger(agent)}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.serialNumber || idx + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{agent.agentName}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${agent.debtUsd < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {agent.debtUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${agent.debtEgp < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {agent.debtEgp?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {agent.ticketEquivalent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                                
                                {/* Grand Total */}
                                {report.grandTotal && (
                                    <tr className="bg-blue-50 font-bold">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan="2">الاجمالى</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${report.grandTotal.debtUsd < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {report.grandTotal.debtUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${report.grandTotal.debtEgp < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {report.grandTotal.debtEgp?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {report.grandTotal.ticketEquivalent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                )}

                                {/* Bad Debts Section */}
                                {report.badDebts && report.badDebts.length > 0 && (
                                    <>
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 bg-red-100 text-red-800 font-bold text-center">
                                                مديونيات معدومه (Bad Debts)
                                            </td>
                                        </tr>
                                        {report.badDebts.map((agent, idx) => (
                                            <tr key={agent.agentId} className="hover:bg-red-50 bg-red-50/30 cursor-pointer" onClick={() => openLedger(agent)}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-900">-</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{agent.agentName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                                    {agent.debtUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                                    {agent.debtEgp?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-900">
                                                    {agent.ticketEquivalent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isLedgerOpen && selectedAgent && (
                <AgentTransactionLedgerModal 
                    agent={selectedAgent}
                    isOpen={isLedgerOpen}
                    onClose={() => setIsLedgerOpen(false)}
                />
            )}
        </div>
    );
};
