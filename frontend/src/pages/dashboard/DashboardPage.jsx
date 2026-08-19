import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getDashboardOverview, getDashboardFilterOptions } from '../../api/dashboard.api';

import DashboardFilters from './components/DashboardFilters';
import KpiGrid from './components/KpiGrid';
import { TrendChart, CategoryBarChart } from './components/DashboardCharts';
import { FlightsTable } from './components/FlightsTable';
import { AgentBalancesTable } from './components/AgentBalancesTable';
import { LatestBatchesTable, DataHealthPanel } from './components/DataTables';

export const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [error, setError] = useState(null);

  // Default to today
  const [filters, setFilters] = useState({
    datePreset: 'today',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    agent: '',
    destination: '',
    serviceType: ''
  });

  const fetchFilterOptions = async () => {
    try {
      const res = await getDashboardFilterOptions();
      setFilterOptions(res);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardOverview(filters);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(t('dashboard.errors.loadFailed', 'Failed to load dashboard data. Please check backend connection.'));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchFilterOptions();
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load only

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 bg-rose-50 rounded-xl border border-rose-100">
        {error}
        <button onClick={handleRefresh} className="block mx-auto mt-4 underline">{t('dashboard.filters.reset', 'Try Again')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title', 'Dashboard Overview')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('dashboard.subtitle', 'Operational and financial command center')}</p>
        </div>
      </div>

      <DashboardFilters 
        filters={filters} 
        setFilters={setFilters} 
        filterOptions={filterOptions} 
        onRefresh={handleRefresh} 
        isLoading={loading} 
      />

      {loading && !data ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <KpiGrid kpis={data?.kpis} />

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TrendChart 
              title={t('dashboard.charts.revenueOverTime', 'Revenue Over Time')} 
              data={data?.charts?.revenueOverTime} 
              dataKey="value"
              color="#10b981"
              formatter={(val) => `${val.toLocaleString()} ${data?.currency || 'EGP'}`}
            />
            <TrendChart 
              title={t('dashboard.charts.profitOverTime', 'Profit Over Time')} 
              data={data?.charts?.profitOverTime} 
              dataKey="value"
              color="#8b5cf6"
              formatter={(val) => `${val.toLocaleString()} ${data?.currency || 'EGP'}`}
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <CategoryBarChart 
              title={t('dashboard.charts.revenueByDestination', 'Revenue by Destination')} 
              data={data?.charts?.revenueByDestination} 
              color="#0ea5e9"
              formatter={(val) => `${val.toLocaleString()} ${data?.currency || 'EGP'}`}
            />
            <CategoryBarChart 
              title={t('dashboard.charts.revenueByServiceType', 'Revenue by Service')} 
              data={data?.charts?.revenueByServiceType} 
              color="#f59e0b"
              formatter={(val) => `${val.toLocaleString()} ${data?.currency || 'EGP'}`}
            />
            <CategoryBarChart 
              title={t('dashboard.charts.topAgentsByRevenue', 'Top Agents by Revenue')} 
              data={data?.charts?.topAgentsByRevenue} 
              color="#6366f1"
              formatter={(val) => `${val.toLocaleString()} ${data?.currency || 'EGP'}`}
            />
          </div>

          {/* Tables Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 h-[400px]">
              <FlightsTable flights={data?.flights} />
            </div>
            <div className="lg:col-span-1 h-[400px]">
              <AgentBalancesTable balances={data?.agentBalances} />
            </div>
          </div>

          {/* Tables Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[350px]">
              <LatestBatchesTable batches={data?.latestBatches} />
            </div>
            <div className="h-[350px]">
              <DataHealthPanel issues={data?.dataHealth} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};