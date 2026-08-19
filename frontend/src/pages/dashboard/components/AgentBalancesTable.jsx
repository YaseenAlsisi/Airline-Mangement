import React from 'react';
import { useTranslation } from 'react-i18next';

export const AgentBalancesTable = ({ balances }) => {
  const { t } = useTranslation();

  if (!balances || balances.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">{t('dashboard.tables.agentBalances', 'Top Agent Balances')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">{t('dashboard.tables.agentName', 'Agent')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.totalDebit', 'Debit')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.totalPaid', 'Paid')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.remainingBalance', 'Balance')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {balances.map((agent, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-900">{agent.agentName}</td>
                <td className="px-5 py-3 text-slate-600">{agent.totalDebit?.toLocaleString()}</td>
                <td className="px-5 py-3 text-slate-600">{agent.totalPaid?.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${agent.remainingBalance > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {Math.abs(agent.remainingBalance)?.toLocaleString()} {agent.remainingBalance > 0 ? '(عليه)' : '(له)'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
