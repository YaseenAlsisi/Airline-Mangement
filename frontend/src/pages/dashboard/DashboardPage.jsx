import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UsersIcon, 
  PaperAirplaneIcon, 
  UserGroupIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  ChartPieIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { KPICard, CustomDonutChart, CustomBarChart } from './DashboardComponents';
import { getDashboardSummary } from '../../api/dashboard.api';
import * as XLSX from 'xlsx';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [dateFilter, setDateFilter] = useState('all'); // all, month, today
  const [agentFilter, setAgentFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      let start = null;
      let end = null;
      
      const today = new Date();
      if (dateFilter === 'month') {
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (dateFilter === 'today') {
        start = today.toISOString().split('T')[0];
        end = start;
      }
      
      const res = await getDashboardSummary(start, end, agentFilter, destFilter);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, agentFilter, destFilter]);

  const exportToExcel = () => {
    if (!data) return;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // KPI Sheet
    const kpiData = [
      ['Metric', 'Value'],
      ['Total Passengers', data.totalPassengers],
      ['Total Flights', data.totalFlights],
      ['Total Agents', data.totalAgents],
      ['Total Revenue', data.totalRevenue],
      ['Total Expenses', data.totalExpenses],
      ['Net Profit', data.netProfit],
      ['Profit Margin', `${data.profitMargin}%`]
    ];
    const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPI Summary');

    // Chart Sheets
    if (data.passengersByDestination?.length > 0) {
      const destWs = XLSX.utils.json_to_sheet(data.passengersByDestination);
      XLSX.utils.book_append_sheet(wb, destWs, 'By Destination');
    }
    if (data.revenueByServiceType?.length > 0) {
      const svcWs = XLSX.utils.json_to_sheet(data.revenueByServiceType);
      XLSX.utils.book_append_sheet(wb, svcWs, 'By Service Type');
    }
    if (data.topAgents?.length > 0) {
      const agentsWs = XLSX.utils.json_to_sheet(data.topAgents);
      XLSX.utils.book_append_sheet(wb, agentsWs, 'Top Agents');
    }
    if (data.todaysFlights?.length > 0) {
      const flightsWs = XLSX.utils.json_to_sheet(data.todaysFlights);
      XLSX.utils.book_append_sheet(wb, flightsWs, 'Flights');
    }

    // Save
    XLSX.writeFile(wb, `Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const destColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#0ea5e9'];
  const serviceColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#0ea5e9'];
  const airlineColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#0ea5e9'];
  const notesColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea'];

  if (loading && !data) {
    return <div className="p-8 text-center text-gray-500">{t('common.loading', 'Loading...')}</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // Fallback defaults in case API returns empty lists
  const destinationData = data?.passengersByDestination?.length > 0 ? data.passengersByDestination : [{ name: 'No Data', value: 1, percent: 100 }];
  const serviceData = data?.revenueByServiceType?.length > 0 ? data.revenueByServiceType.map((s, idx) => ({...s, color: serviceColors[idx % serviceColors.length]})) : [];
  const airlineData = data?.passengersByAirline?.length > 0 ? data.passengersByAirline : [{ name: 'No Data', value: 1, percent: 100 }];
  const notesData = data?.passengersByCategory?.length > 0 ? data.passengersByCategory : [{ name: 'No Data', value: 1, percent: 100 }];
  const agentsData = data?.topAgents || [];
  const flightsData = data?.todaysFlights || [];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Agent Filter (Dynamic if we had a full list, hardcoded common ones for now or text input) */}
          <input 
            type="text"
            placeholder="Agent Name..."
            value={agentFilter === 'all' ? '' : agentFilter}
            onChange={(e) => setAgentFilter(e.target.value || 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 w-32"
          />
          <input 
            type="text"
            placeholder="Destination..."
            value={destFilter === 'all' ? '' : destFilter}
            onChange={(e) => setDestFilter(e.target.value || 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 w-32"
          />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="today">Today</option>
          </select>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Excel
          </button>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('dashboard.refreshData')}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard 
          title={t('dashboard.kpi.totalPassengers')} 
          value={data?.totalPassengers || 0} 
          trend="" 
          icon={UsersIcon} 
          colorClass={{ bg: 'bg-purple-100', text: 'text-purple-600' }} 
        />
        <KPICard 
          title={t('dashboard.kpi.totalFlights')} 
          value={data?.totalFlights || 0} 
          trend="" 
          icon={PaperAirplaneIcon} 
          colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }} 
        />
        <KPICard 
          title={t('dashboard.kpi.totalAgents')} 
          value={data?.totalAgents || 0} 
          trend="" 
          icon={UserGroupIcon} 
          colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }} 
        />
        <KPICard 
          title={t('dashboard.kpi.totalRevenue')} 
          value={`${(data?.totalRevenue || 0).toLocaleString()} ${t('dashboard.kpi.currency')}`} 
          trend="" 
          icon={BanknotesIcon} 
          colorClass={{ bg: 'bg-amber-100', text: 'text-amber-600' }} 
        />
        <KPICard 
          title={t('dashboard.kpi.totalExpenses')} 
          value={`${(data?.totalExpenses || 0).toLocaleString()} ${t('dashboard.kpi.currency')}`} 
          trend="" 
          icon={CreditCardIcon} 
          colorClass={{ bg: 'bg-green-100', text: 'text-green-600' }} 
        />
        <KPICard 
          title={t('dashboard.kpi.netProfit')} 
          value={`${(data?.netProfit || 0).toLocaleString()} ${t('dashboard.kpi.currency')}`} 
          trend="" 
          subValue={`${t('dashboard.kpi.profitMargin')} ${data?.profitMargin || 0}%`}
          icon={ChartPieIcon} 
          colorClass={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }} 
        />
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <CustomDonutChart 
            title={t('dashboard.charts.passengersByDestination')} 
            data={destinationData} 
            colors={destColors}
            centerText={{ label: t('dashboard.kpi.totalPassengers'), value: data?.totalPassengers || 0 }}
          />
        </div>
        <div className="lg:col-span-1">
          <CustomBarChart 
            title={t('dashboard.charts.revenueByService')} 
            data={serviceData} 
          />
        </div>
        <div className="lg:col-span-1">
          <CustomDonutChart 
            title={t('dashboard.charts.passengersByAirline')} 
            data={airlineData} 
            colors={airlineColors}
            centerText={{ label: t('dashboard.kpi.totalPassengers'), value: data?.totalPassengers || 0 }}
          />
        </div>
        <div className="lg:col-span-1">
          <CustomDonutChart 
            title={t('dashboard.charts.notes')} 
            data={notesData} 
            colors={notesColors}
            centerText={{ label: t('dashboard.kpi.totalPassengers'), value: data?.totalPassengers || 0 }}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Most Active Agents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1">
          <h3 className="text-sm font-bold text-gray-800 mb-4">{t('dashboard.charts.mostActiveAgents')}</h3>
          <div className="space-y-4">
            {agentsData.length === 0 && <div className="text-gray-400 text-sm text-center py-4">No data</div>}
            {agentsData.map((agent, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <div className="w-4 h-4 rounded text-[10px] font-bold text-white flex items-center justify-center mr-3" style={{backgroundColor: '#2563eb'}}>{idx + 1}</div>
                <div className="w-24 text-gray-700 truncate" title={agent.name}>{agent.name}</div>
                <div className="flex-1 mx-2 bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${agent.percent}%` }}></div>
                </div>
                <div className="w-16 text-right font-semibold text-gray-900">{Number(agent.value).toLocaleString()} <span className="text-xs font-normal text-gray-400">({agent.percent}%)</span></div>
              </div>
            ))}
          </div>
          <button className="mt-6 text-sm text-blue-600 hover:text-blue-800 w-full text-center">
            &larr; {t('dashboard.charts.viewAllAgents')}
          </button>
        </div>

        {/* Today's Flights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2 overflow-hidden flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 mb-4">{t('dashboard.tables.todaysFlights')}</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightType')}</th>
                  <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightPassengers')}</th>
                  <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightTo')}</th>
                  <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightFrom')}</th>
                  <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightTime')}</th>
                </tr>
              </thead>
              <tbody>
                {flightsData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">No flights found</td>
                  </tr>
                )}
                {flightsData.map((flight, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 px-2">
                      <span className="text-[10px] px-2 py-1 rounded font-bold text-blue-700 bg-blue-100">{flight.type}</span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-800">{Number(flight.passengers).toLocaleString()}</td>
                    <td className="py-3 px-2 text-gray-600">{flight.to}</td>
                    <td className="py-3 px-2 text-gray-600">{flight.from}</td>
                    <td className="py-3 px-2 font-medium text-gray-900">{flight.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 w-full text-center">
            &larr; {t('dashboard.tables.viewAllFlights')}
          </button>
        </div>

        {/* Financial Summary & Service Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">{t('dashboard.summary.financialSummary')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">{t('dashboard.summary.revenue')}</span>
                <span className="font-bold text-gray-900">{Number(data?.totalRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">{t('dashboard.summary.expenses')}</span>
                <span className="font-bold text-gray-900">{Number(data?.totalExpenses || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">{t('dashboard.summary.profit')}</span>
                <span className="font-bold text-gray-900">{Number(data?.netProfit || 0).toLocaleString()} {t('dashboard.kpi.currency')}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500">{t('dashboard.summary.profitRatio')}</span>
                <span className="font-bold text-green-600">{data?.profitMargin || 0}%</span>
              </div>
            </div>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 justify-center w-full">
              <ChartPieIcon className="w-4 h-4" /> {t('dashboard.summary.viewDetailedFinancial')}
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">{t('dashboard.summary.serviceTypes')}</h3>
            <div className="space-y-2 text-xs">
              {serviceData.length === 0 && <div className="text-gray-400">No data</div>}
              {serviceData.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                    <span className="text-gray-600">{s.name}</span>
                  </div>
                  <div className="font-semibold text-gray-900">{Number(s.value).toLocaleString()} <span className="text-gray-400 font-normal">({s.percent}%)</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-6 pb-4">
        &#9432; {t('dashboard.summary.currencyNote')}
      </div>
    </div>
  );
};