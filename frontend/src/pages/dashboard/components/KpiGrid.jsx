import React from 'react';
import { 
  UsersIcon, 
  PaperAirplaneIcon, 
  BanknotesIcon, 
  CurrencyDollarIcon, 
  WalletIcon, 
  ChartBarIcon, 
  DocumentCheckIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import KpiCard from './KpiCard';

const KpiGrid = ({ kpis }) => {
  const { t } = useTranslation();

  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard 
        title={t('dashboard.kpi.totalPassengers', 'Total Passengers')} 
        value={kpis.totalPassengers?.toLocaleString()} 
        change={kpis.passengersChange} 
        icon={<UsersIcon className="w-6 h-6 text-indigo-600" />} 
        color="indigo" 
      />
      <KpiCard 
        title={t('dashboard.kpi.totalFlights', 'Total Flights')} 
        value={kpis.totalFlights?.toLocaleString()} 
        change={kpis.flightsChange} 
        icon={<PaperAirplaneIcon className="w-6 h-6 text-sky-600" />} 
        color="sky" 
      />
      <KpiCard 
        title={t('dashboard.kpi.revenueEgp', 'Revenue EGP')} 
        value={kpis.revenueEgp?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
        change={kpis.revenueChange} 
        icon={<BanknotesIcon className="w-6 h-6 text-emerald-600" />} 
        color="emerald" 
      />
      <KpiCard 
        title={t('dashboard.kpi.revenueUsd', 'Revenue USD')} 
        value={kpis.revenueUsd?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
        icon={<CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />} 
        color="emerald" 
      />
      <KpiCard 
        title={t('dashboard.kpi.expensesEgp', 'Expenses EGP')} 
        value={kpis.expensesEgp?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
        icon={<WalletIcon className="w-6 h-6 text-rose-600" />} 
        color="rose" 
      />
      <KpiCard 
        title={t('dashboard.kpi.netProfitEgp', 'Net Profit')} 
        value={kpis.netProfitEgp?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
        change={kpis.profitChange} 
        icon={<ChartBarIcon className="w-6 h-6 text-violet-600" />} 
        color="violet" 
      />
      <KpiCard 
        title={t('dashboard.kpi.publishedFiles', 'Published Files')} 
        value={kpis.publishedFiles?.toLocaleString()} 
        icon={<DocumentCheckIcon className="w-6 h-6 text-blue-600" />} 
        color="blue" 
      />
      <KpiCard 
        title={t('dashboard.kpi.dataIssues', 'Data Issues')} 
        value={kpis.dataIssues?.toLocaleString()} 
        icon={<ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />} 
        color="amber" 
      />
    </div>
  );
};

export default KpiGrid;
