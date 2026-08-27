import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getDashboardOverview, getDashboardFilterOptions } from '../../api/dashboard.api';
import { exportDashboardToExcel } from '../../utils/excelExportUtils';
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
import * as XLSX from 'xlsx';

export const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [error, setError] = useState(null);

  const [dateFilter, setDateFilter] = useState('all'); 
  const [agentFilter, setAgentFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');

  const [filters, setFilters] = useState({
    datePreset: 'all',
    startDate: '',
    endDate: '',
    agent: '',
    destination: '',
    serviceType: ''
  });

  useEffect(() => {
    const today = new Date();
    let startDate = '';
    let endDate = '';
    
    if (dateFilter === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (dateFilter === 'today') {
      startDate = today.toISOString().split('T')[0];
      endDate = startDate;
    }

    setFilters({
      datePreset: dateFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      agent: agentFilter === 'all' ? undefined : agentFilter,
      destination: destFilter === 'all' ? undefined : destFilter,
      serviceType: undefined
    });
  }, [dateFilter, agentFilter, destFilter]);

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
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [filters, fetchDashboardData]);

  const exportToExcel = async () => {
    if (!data) return;
    try {
      await exportDashboardToExcel(data, t);
    } catch (err) {
      console.error(err);
      alert("Error exporting Excel: " + err.message);
    }
  };

  const destColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#0ea5e9'];
  const serviceColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#0ea5e9'];
  const airlineColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#0ea5e9'];
  const notesColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea'];

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 bg-rose-50 rounded-xl border border-rose-100">
        {error}
        <button onClick={fetchDashboardData} className="block mx-auto mt-4 underline">Try Again</button>
      </div>
    );
  }

  const destinationData = data?.charts?.passengersByDestination?.length > 0 ? data.charts.passengersByDestination : [{ name: 'No Data', value: 1, percent: 100 }];
  const serviceData = data?.charts?.revenueByServiceType?.length > 0 ? data.charts.revenueByServiceType.map((s, idx) => ({...s, color: serviceColors[idx % serviceColors.length]})) : [];
  // The 'Passengers by Airline' chart historically grouped by flightNumber (which we added to the API as passengersByAirline)
  const airlineData = data?.charts?.passengersByAirline?.length > 0 ? data.charts.passengersByAirline : [{ name: 'No Data', value: 1, percent: 100 }];
  
  const notesData = data?.charts?.passengersByCategory?.length > 0 ? data.charts.passengersByCategory : [{ name: 'No Data', value: 1, percent: 100 }];
  
  const agentsData = data?.charts?.topAgentsByPassengers || [];
  const flightsData = data?.flights || [];

  return (
    <div className="space-y-6 bg-[#f8fafc] -m-6 p-6 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title', 'Dashboard')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.subtitle', 'Overview of travel and booking performance')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">...Agent Name</option>
            {filterOptions?.agents?.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
          <select 
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">...Destination</option>
            {filterOptions?.destinations?.map(dest => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
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
            {t('dashboard.refreshData', 'Refresh Data')}
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <KPICard 
              title={t('dashboard.kpi.totalPassengers', 'Total Passengers')} 
              value={data?.kpis?.totalPassengers || 0} 
              trend={data?.kpis?.passengersChange ? `${data.kpis.passengersChange > 0 ? '+' : ''}${data.kpis.passengersChange}%` : ''} 
              icon={UsersIcon} 
              colorClass={{ bg: 'bg-purple-100', text: 'text-purple-600' }} 
            />
            <KPICard 
              title={t('dashboard.kpi.totalFlights', 'Total Flights')} 
              value={data?.kpis?.totalFlights || 0} 
              trend={data?.kpis?.flightsChange ? `${data.kpis.flightsChange > 0 ? '+' : ''}${data.kpis.flightsChange}%` : ''} 
              icon={PaperAirplaneIcon} 
              colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }} 
            />
            <KPICard 
              title={t('dashboard.kpi.totalAgents', 'Total Agents')} 
              value={filterOptions?.agents?.length || 0} 
              trend="" 
              icon={UserGroupIcon} 
              colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }} 
            />
            <KPICard 
              title={t('dashboard.kpi.totalRevenue', 'Total Revenue')} 
              value={`${(data?.kpis?.revenueEgp || 0).toLocaleString()} ${data?.currency || ''}`} 
              trend={data?.kpis?.revenueChange ? `${data.kpis.revenueChange > 0 ? '+' : ''}${data.kpis.revenueChange}%` : ''} 
              icon={BanknotesIcon} 
              colorClass={{ bg: 'bg-amber-100', text: 'text-amber-600' }} 
            />
            <KPICard 
              title={t('dashboard.kpi.totalExpenses', 'Total Expenses')} 
              value={`${(data?.kpis?.expensesEgp || 0).toLocaleString()} ${data?.currency || ''}`} 
              trend="" 
              icon={CreditCardIcon} 
              colorClass={{ bg: 'bg-green-100', text: 'text-green-600' }} 
            />
            <KPICard 
              title={t('dashboard.kpi.netProfit', 'Net Profit')} 
              value={`${(data?.kpis?.netProfitEgp || 0).toLocaleString()} ${data?.currency || ''}`} 
              trend={data?.kpis?.profitChange ? `${data.kpis.profitChange > 0 ? '+' : ''}${data.kpis.profitChange}%` : ''} 
              subValue={`${t('dashboard.kpi.profitMargin', 'Profit Margin')} ${((data?.kpis?.netProfitEgp / data?.kpis?.revenueEgp) * 100 || 0).toFixed(2)}%`}
              icon={ChartPieIcon} 
              colorClass={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }} 
            />
          </div>

          {/* Middle Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-1">
              <CustomDonutChart 
                title={t('dashboard.charts.passengersByDestination', 'Passengers by Destination')} 
                data={destinationData} 
                colors={destColors}
                centerText={{ label: t('dashboard.kpi.totalPassengers', 'Total Passengers'), value: data?.kpis?.totalPassengers || 0 }}
              />
            </div>
            <div className="lg:col-span-1">
              <CustomBarChart 
                title={t('dashboard.charts.revenueByService', 'Revenue by Service Type')} 
                data={serviceData} 
              />
            </div>
            <div className="lg:col-span-1">
              <CustomDonutChart 
                title={t('dashboard.charts.passengersByAirline', 'Passengers by Airline')} 
                data={airlineData} 
                colors={airlineColors}
                centerText={{ label: t('dashboard.kpi.totalPassengers', 'Total Passengers'), value: data?.kpis?.totalPassengers || 0 }}
              />
            </div>
            <div className="lg:col-span-1">
              <CustomDonutChart 
                title={t('dashboard.charts.notes', 'Notes')} 
                data={notesData} 
                colors={notesColors}
                centerText={{ label: t('dashboard.kpi.totalPassengers', 'Total Passengers'), value: data?.kpis?.totalPassengers || 0 }}
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Most Active Agents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1 flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 mb-4">{t('dashboard.charts.mostActiveAgents', 'Most Active Agents (by passengers)')}</h3>
              <div className="space-y-4 flex-1">
                {agentsData.length === 0 && <div className="text-gray-400 text-sm text-center py-4">No data</div>}
                {agentsData.map((agent, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <div className="w-5 h-5 rounded text-[10px] font-bold text-white flex items-center justify-center mr-3" style={{backgroundColor: '#2563eb'}}>{idx + 1}</div>
                    <div className="w-24 text-gray-700 truncate" title={agent.name}>{agent.name}</div>
                    <div className="flex-1 mx-2 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${agent.percent}%` }}></div>
                    </div>
                    <div className="w-16 text-right font-semibold text-gray-900">{Number(agent.value).toLocaleString()} <span className="text-xs font-normal text-gray-400">({agent.percent}%)</span></div>
                  </div>
                ))}
              </div>
              <button className="mt-6 text-sm text-blue-600 hover:text-blue-800 w-full text-center">
                {t('dashboard.charts.viewAllAgents', 'View all agents')} &rarr;
              </button>
            </div>

            {/* Today's Flights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2 overflow-hidden flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 mb-4">{t('dashboard.tables.todaysFlights', "Today's Flights")}</h3>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100">
                      <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightType', 'Service Type')}</th>
                      <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightPassengers', 'Passengers')}</th>
                      <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightTo', 'To')}</th>
                      <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightFrom', 'From')}</th>
                      <th className="pb-3 px-2 font-medium">{t('dashboard.tables.flightTime', 'Flight Time')}</th>
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
                          <span className="text-[10px] px-2 py-1 rounded font-bold text-blue-700 bg-blue-100">{flight.type || 'Service'}</span>
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
                {t('dashboard.tables.viewAllFlights', 'View all flights')} &rarr;
              </button>
            </div>

            {/* Financial Summary & Service Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('dashboard.summary.financialSummary', 'Financial Summary')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{t('dashboard.summary.revenue', 'Revenue')}</span>
                    <span className="font-bold text-gray-900">{Number(data?.kpis?.revenueEgp || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{t('dashboard.summary.expenses', 'Expenses')}</span>
                    <span className="font-bold text-gray-900">{Number(data?.kpis?.expensesEgp || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{t('dashboard.summary.profit', 'Profit')}</span>
                    <span className="font-bold text-gray-900">{Number(data?.kpis?.netProfitEgp || 0).toLocaleString()} {data?.currency || ''}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-500">{t('dashboard.summary.profitRatio', 'Profit Ratio')}</span>
                    <span className="font-bold text-green-600">{((data?.kpis?.netProfitEgp / data?.kpis?.revenueEgp) * 100 || 0).toFixed(2)}%</span>
                  </div>
                </div>
                <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 justify-center w-full">
                  <ChartPieIcon className="w-4 h-4" /> {t('dashboard.summary.viewDetailedFinancial', 'View Detailed Financial Report')}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4">{t('dashboard.summary.serviceTypes', 'Service Types (Passengers)')}</h3>
                <div className="space-y-2 text-xs">
                  {serviceData.length === 0 && <div className="text-gray-400">No data</div>}
                  {serviceData.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: serviceColors[idx % serviceColors.length]}}></div>
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
            &#9432; {t('dashboard.summary.currencyNote', `All figures are in local currency (${data?.currency || 'EGP'})`)}
          </div>
        </>
      )}
    </div>
  );
};