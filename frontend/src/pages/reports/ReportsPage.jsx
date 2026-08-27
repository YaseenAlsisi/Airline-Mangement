import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDashboardData } from '../../api/reports.api';
import { getAgents } from '../../api/agents.api';
import * as XLSX from 'xlsx';
import { exportSalesSummaryToExcel } from '../../utils/excelExportUtils';
import html2pdf from 'html2pdf.js';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowPathIcon,
  WalletIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  UsersIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const MOCK_DATA = {
  totalRevenueEgp: { current: 2450750, previous: 2000000, percentageChange: 18.7 },
  totalRevenueUsd: { current: 85430, previous: 70000, percentageChange: 15.3 },
  totalExpensesEgp: { current: 1820300, previous: 2000000, percentageChange: -10.1 },
  netProfitEgp: { current: 630450, previous: 480000, percentageChange: 29.2 },
  totalPassengers: { current: 3246, previous: 2800, percentageChange: 12.8 },
  totalFlights: { current: 156, previous: 140, percentageChange: 8.6 },
  revenueOverTime: [
    { date: '01 Jul', value: 50000 },
    { date: '04 Jul', value: 120000 },
    { date: '08 Jul', value: 200000 },
    { date: '11 Jul', value: 100000 },
    { date: '15 Jul', value: 90000 },
    { date: '18 Jul', value: 170000 },
    { date: '22 Jul', value: 250000 },
    { date: '25 Jul', value: 210000 },
    { date: '29 Jul', value: 340000 },
    { date: '01 Aug', value: 250000 },
    { date: '05 Aug', value: 170000 },
    { date: '08 Aug', value: 210000 },
    { date: '10 Aug', value: 190000 },
    { date: '12 Aug', value: 140000 },
    { date: '15 Aug', value: 240000 }
  ],
  revenueByDestination: [
    { name: 'Tripoli', value: 600000 },
    { name: 'Benghazi', value: 450000 },
    { name: 'Misrata', value: 350000 },
    { name: 'Cairo', value: 250000 },
    { name: 'Tunis', value: 200000 }
  ],
  serviceTypeDistribution: [
    { name: 'Economy (Single)', value: 1470, percentage: 45.3 },
    { name: 'Business (Double)', value: 1042, percentage: 32.1 },
    { name: 'First Class (Triple)', value: 510, percentage: 15.7 },
    { name: 'Other', value: 224, percentage: 6.9 }
  ],
  topAgentsByRevenue: [
    { name: 'Abu Attia Company', value: 620000 },
    { name: 'Alrahma Group', value: 480000 },
    { name: 'Al Travel Co.', value: 360000 },
    { name: 'Sky Vision', value: 290000 },
    { name: 'Alwaha Agency', value: 210000 }
  ],
  detailedSummary: [
    { rowNum: 1, agentName: 'Abu Attia Company', destination: 'Tripoli', flights: 28, passengers: 620, revenueEgp: 620450, revenueUsd: 21540, expensesEgp: 460200, profitEgp: 160250 },
    { rowNum: 2, agentName: 'Alrahma Group', destination: 'Benghazi', flights: 24, passengers: 540, revenueEgp: 480300, revenueUsd: 18230, expensesEgp: 350120, profitEgp: 130180 },
    { rowNum: 3, agentName: 'Al Travel Co.', destination: 'Misrata', flights: 20, passengers: 420, revenueEgp: 360120, revenueUsd: 12450, expensesEgp: 260050, profitEgp: 100070 },
    { rowNum: 4, agentName: 'Sky Vision', destination: 'Cairo', flights: 18, passengers: 380, revenueEgp: 290400, revenueUsd: 10320, expensesEgp: 210230, profitEgp: 80170 },
    { rowNum: 5, agentName: 'Alwaha Agency', destination: 'Tunis', flights: 16, passengers: 320, revenueEgp: 210230, revenueUsd: 7890, expensesEgp: 150140, profitEgp: 60090 }
  ]
};

export const ReportsPage = () => {
  const { t } = useTranslation();
  
  // Filters
  const [dateRange, setDateRange] = useState('');
  const [agentId, setAgentId] = useState('');
  const [destination, setDestination] = useState('');
  const [serviceType, setServiceType] = useState('');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(MOCK_DATA); // Render mock data immediately
  const [agentChartPage, setAgentChartPage] = useState(0);
  const [agentsList, setAgentsList] = useState([]);
  
  const [destinationsList, setDestinationsList] = useState([t('reports.allDestinations', 'All Destinations')]);
  const [serviceTypesList, setServiceTypesList] = useState([t('reports.allServiceTypes', 'All Service Types')]);

  const agentsPerPage = 5;
  const topAgents = data?.topAgentsByRevenue || [];
  const totalAgentPages = Math.ceil(topAgents.length / agentsPerPage);
  const paginatedAgents = topAgents.slice(agentChartPage * agentsPerPage, (agentChartPage + 1) * agentsPerPage);

  const handleNextAgentPage = () => {
    if (agentChartPage < totalAgentPages - 1) setAgentChartPage(p => p + 1);
  };
  const handlePrevAgentPage = () => {
    if (agentChartPage > 0) setAgentChartPage(p => p - 1);
  };

  // Table Pagination
  const [tablePage, setTablePage] = useState(0);
  const tableItemsPerPage = 10;
  
  const totalTableItems = data?.detailedSummary?.length || 0;
  const totalTablePages = Math.max(1, Math.ceil(totalTableItems / tableItemsPerPage));
  const paginatedTableData = data?.detailedSummary?.slice(tablePage * tableItemsPerPage, (tablePage + 1) * tableItemsPerPage) || [];
  
  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(0, tablePage - Math.floor(maxVisible / 2));
    let end = start + maxVisible;
    if (end > totalTablePages) {
       end = totalTablePages;
       start = Math.max(0, end - maxVisible);
    }
    return Array.from({length: end - start}, (_, i) => start + i);
  };

  const COLORS = ['#7c3aed', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Parse dateRange string if it exists (e.g., "01/07/2025 - 15/08/2025")
      // For a robust app, use a real DatePicker. This is a basic implementation.
      if (dateRange && dateRange.includes('-')) {
        const parts = dateRange.split('-');
        if (parts.length === 2) {
           // Basic formatting check, but usually it's better to let the backend handle or use standardized ISO
           params.startDate = parts[0].trim();
           params.endDate = parts[1].trim();
        }
      }
      
      if (agentId) params.agentId = agentId;
      if (destination) params.destination = destination;
      if (serviceType) params.serviceType = serviceType;

      const res = await getDashboardData(params);
      let fetchedData = null;

      if (res.data?.success && res.data?.data) {
        fetchedData = res.data.data;
      } else if (res.data && res.data.data === null) {
        fetchedData = res.data;
      } else if (res.data && res.data.totalRevenueEgp) {
        // Direct object case
        fetchedData = res.data;
      }

      if (fetchedData) {
        setData(fetchedData);
        setAgentChartPage(0);
        setTablePage(0);
        
        // Populate filter options safely
        if (!agentId && !destination && !serviceType && !dateRange) {
          const uniqueDests = [...new Set((fetchedData.revenueByDestination || []).map(d => d.name))].filter(d => d && d !== 'Unknown');
          const uniqueServices = [...new Set((fetchedData.serviceTypeDistribution || []).map(s => s.name))].filter(s => s && s !== 'Other');
          setDestinationsList([t('reports.allDestinations', 'All Destinations'), ...uniqueDests]);
          setServiceTypesList([t('reports.allServiceTypes', 'All Service Types'), ...uniqueServices]);
        }
      }
    } catch (error) {
      console.error("Error fetching real data.", error);
      // Fallback to MOCK_DATA
      setData(MOCK_DATA);
      if (!agentId && !destination && !serviceType && !dateRange) {
        const uniqueDests = [...new Set((MOCK_DATA.revenueByDestination || []).map(d => d.name))].filter(d => d && d !== 'Unknown');
        const uniqueServices = [...new Set((MOCK_DATA.serviceTypeDistribution || []).map(s => s.name))].filter(s => s && s !== 'Other');
        setDestinationsList([t('reports.allDestinations', 'All Destinations'), ...uniqueDests]);
        setServiceTypesList([t('reports.allServiceTypes', 'All Service Types'), ...uniqueServices]);
      }
      alert("Error: Could not connect to the backend database. Using mock data for now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Fetch agents for the filter dropdown
    const fetchAgentsList = async () => {
      try {
        const res = await getAgents();
        if (res.data?.success && res.data?.data?.content) {
          setAgentsList(res.data.data.content);
        } else if (res.data?.content) {
          setAgentsList(res.data.content);
        } else if (Array.isArray(res.data)) {
          setAgentsList(res.data);
        }
      } catch (error) {
        console.error("Error fetching agents.", error);
      }
    };
    fetchAgentsList();
  }, []);

  const handleApplyFilter = () => {
    fetchDashboard();
  };

  const handleClearFilters = () => {
    setDateRange('');
    setAgentId('');
    setDestination('');
    setServiceType('');
    // Automatically re-fetch after clearing
    setTimeout(() => {
      fetchDashboard();
    }, 0);
  };

  const exportToExcel = async () => {
    try {
      if (!data?.detailedSummary) {
        alert("No data available to export");
        return;
      }
      await exportSalesSummaryToExcel(data.detailedSummary);
    } catch (err) {
      console.error(err);
      alert("Error exporting Excel: " + err.message);
    }
  };

  const exportToPDF = () => {
    try {
      if (!data?.detailedSummary) {
        alert("No data available to export");
        return;
      }

      const tempContainer = document.createElement('div');
      tempContainer.style.padding = '20px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.dir = 'rtl';
      tempContainer.id = 'pdf-container';
      
      // We append it to the body temporarily so html2canvas can clone it properly
      // but keep it hidden from the user.
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      document.body.appendChild(tempContainer);

      let tableHtml = `
        <style id="pdf-styles">
          #pdf-container { background: white; color: black; }
          .pdf-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .pdf-table th, .pdf-table td { padding: 8px; border: 1px solid #ccc; text-align: right; }
          .pdf-table th { background-color: #f1f5f9; }
          .pdf-header { text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold; }
        </style>
        <div class="pdf-header">تقرير المبيعات التفصيلي</div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الوكيل</th>
              <th>الوجهة</th>
              <th>الرحلات</th>
              <th>الركاب</th>
              <th>الإيرادات (EGP)</th>
              <th>الإيرادات (USD)</th>
              <th>المصروفات (EGP)</th>
              <th>الربح (EGP)</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.detailedSummary.forEach((row, idx) => {
        tableHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td>${row.agentName}</td>
            <td>${row.destination}</td>
            <td>${row.flights}</td>
            <td>${row.passengers}</td>
            <td>${row.revenueEgp.toLocaleString()}</td>
            <td>${row.revenueUsd.toLocaleString()}</td>
            <td>${row.expensesEgp.toLocaleString()}</td>
            <td>${row.profitEgp.toLocaleString()}</td>
          </tr>
        `;
      });

      tableHtml += `</tbody></table>`;
      tempContainer.innerHTML = tableHtml;

      const opt = {
        margin:       0.5,
        filename:     'Sales_Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2,
          // CRITICAL FIX: html2canvas crashes on Tailwind v4 'oklch' colors.
          // By removing all stylesheets from the cloned document except our pdf-styles, 
          // we bypass the crash entirely while keeping our table styled!
          onclone: (clonedDoc) => {
            const styles = clonedDoc.querySelectorAll('style:not(#pdf-styles), link[rel="stylesheet"]');
            styles.forEach(s => s.remove());
          }
        },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(tempContainer).save().then(() => {
        document.body.removeChild(tempContainer);
      }).catch(err => {
        console.error(err);
        alert("Error generating PDF: " + err.message);
        document.body.removeChild(tempContainer);
      });

    } catch (err) {
      console.error(err);
      alert("Error starting PDF export: " + err.message);
    }
  };

  const exportToCSV = () => {
    try {
      if (!data?.detailedSummary) {
        alert("No data available to export");
        return;
      }
      const ws = XLSX.utils.json_to_sheet(data.detailedSummary);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Sales_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Error exporting CSV: " + err.message);
    }
  };

  const renderKpiCard = (title, value, metric, icon, iconColor, iconBg, currency = '') => {
    const isPositive = metric?.percentageChange > 0;
    const isNeutral = metric?.percentageChange === 0;
    const changeVal = Math.abs(metric?.percentageChange || 0).toFixed(1);
    
    return (
      <div className="bg-white p-6 rounded-[14px] shadow-sm border border-slate-100 flex flex-col justify-center h-[120px]">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-700">{title}</h3>
            <div className="text-[22px] font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {value.toLocaleString()} {currency}
            </div>
            <div className="text-[11px] font-bold mt-1 flex items-center gap-1">
              <span className={`${isPositive ? 'text-emerald-500' : isNeutral ? 'text-slate-400' : 'text-rose-500'}`}>
                {isPositive ? '↑' : isNeutral ? '' : '↓'} {changeVal}%
              </span>
              <span className="text-slate-400 font-medium">{t('reports.vsPrevious', 'vs previous period')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans w-full">
      <div className="max-w-[1400px] mx-auto space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center px-1">
          <div>
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">{t('reports.title', 'Sales Reports')}</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1">{t('reports.subtitle', 'View aggregated financial and operational data across the entire system.')}</p>
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50 font-bold text-sm transition-colors shadow-sm"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />{t('reports.export', 'Export Report')}<span className="text-slate-400 ml-1 text-[10px]">▼</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
          <h3 className="text-[14px] font-bold text-slate-900 mb-4">{t('reports.filterBy', 'Filter by')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700">{t('reports.dateRange', 'Date Range')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="01/07/2025 - 15/08/2025" 
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="w-full text-[13px] font-medium border-slate-200 rounded-lg py-2.5 pl-10 pr-10 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 shadow-sm" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700">{t('reports.agent', 'Agent')}</label>
              <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full text-[13px] font-medium border-slate-200 rounded-lg py-2.5 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 shadow-sm bg-white">
                <option value="">{t('reports.allAgents', 'All Agents')}</option>
                {agentsList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700">{t('reports.destination', 'Destination')}</label>
              <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full text-[13px] font-medium border-slate-200 rounded-lg py-2.5 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 shadow-sm bg-white">
                {destinationsList.map(d => <option key={d} value={d === t('reports.allDestinations', 'All Destinations') ? '' : d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700">{t('reports.serviceType', 'Service Type')}</label>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full text-[13px] font-medium border-slate-200 rounded-lg py-2.5 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 shadow-sm bg-white">
                {serviceTypesList.map(s => <option key={s} value={s === t('reports.allServiceTypes', 'All Service Types') ? '' : s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5 flex items-end gap-2 pb-0.5">
              <button 
                onClick={handleApplyFilter}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />{t('reports.applyFilter', 'Apply Filter')}</button>
              <button 
                onClick={handleClearFilters}
                className="px-3 py-2.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center text-[12px] font-bold whitespace-nowrap"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />{t('reports.clearFilters', 'Clear Filters')}</button>
            </div>
          </div>
        </div>


        {data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {renderKpiCard(t('reports.totalRevenueEgp', 'Total Revenue (EGP)'), data.totalRevenueEgp.current, data.totalRevenueEgp, <WalletIcon className="w-6 h-6 stroke-2" />, "text-[#7c3aed]", "bg-[#f3e8ff]")}
              {renderKpiCard(t('reports.totalRevenueUsd', 'Total Revenue (USD)'), data.totalRevenueUsd.current, data.totalRevenueUsd, <BanknotesIcon className="w-6 h-6 stroke-2" />, "text-[#10b981]", "bg-[#dcfce7]")}
              {renderKpiCard(t('reports.totalExpensesEgp', 'Total Expenses (EGP)'), data.totalExpensesEgp.current, data.totalExpensesEgp, <CreditCardIcon className="w-6 h-6 stroke-2" />, "text-[#f59e0b]", "bg-[#fef3c7]")}
              {renderKpiCard(t('reports.netProfitEgp', 'Net Profit (EGP)'), data.netProfitEgp.current, data.netProfitEgp, <ChartBarIcon className="w-6 h-6 stroke-2" />, "text-[#3b82f6]", "bg-[#dbeafe]")}
              {renderKpiCard(t('reports.totalPassengers', 'Total Passengers'), data.totalPassengers.current, data.totalPassengers, <UsersIcon className="w-6 h-6 stroke-2" />, "text-[#8b5cf6]", "bg-[#f3e8ff]")}
              {renderKpiCard(t('reports.totalFlights', 'Total Flights'), data.totalFlights.current, data.totalFlights, <PaperAirplaneIcon className="w-6 h-6 stroke-2" />, "text-[#14b8a6]", "bg-[#ccfbf1]")}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Revenue Over Time */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[14px] font-bold text-slate-900">{t('reports.revenueOverTime', 'Revenue Over Time (EGP)')}</h3>
                  <div className="flex items-center gap-2">
                    <select className="text-[12px] border-slate-200 rounded-md py-1 pr-6 pl-2 text-slate-700 font-bold bg-white focus:ring-0 shadow-sm">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="h-[220px] w-full flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.revenueOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} dy={10} interval="preserveStartEnd" minTickGap={20} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}K` : val} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2.5} dot={{r: 3.5, fill: '#fff', stroke: '#7c3aed', strokeWidth: 2}} activeDot={{r: 5}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue by Destination */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-3 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[14px] font-bold text-slate-900">{t('reports.revenueByDestination', 'Revenue by Destination (EGP)')}</h3>
                  <EllipsisVerticalIcon className="w-5 h-5 text-slate-400 cursor-pointer" />
                </div>
                <div className="h-[220px] w-full flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByDestination} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}K` : val} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                      <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Service Type Distribution */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-center mb-0">
                  <h3 className="text-[14px] font-bold text-slate-900">{t('reports.serviceTypeDistribution', 'Service Type Distribution')}</h3>
                  <EllipsisVerticalIcon className="w-5 h-5 text-slate-400 cursor-pointer" />
                </div>
                <div className="flex-grow flex flex-col justify-center relative min-h-[220px]">
                  <div className="h-[140px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.serviceTypeDistribution}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {data.serviceTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                      <span className="text-[11px] font-bold text-slate-500">{t('reports.total', 'Total')}</span>
                      <span className="text-[16px] font-extrabold text-slate-900 -mt-1">{data.totalPassengers.current.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Custom Legend */}
                  <div className="mt-3 space-y-1.5 px-1">
                    {data.serviceTypeDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                          <span className="text-[11px] text-slate-700 font-bold">{item.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Agents */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-3 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[14px] font-bold text-slate-900">{t('reports.allAgentsByRevenue', 'All Agents by Revenue (EGP)')}</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevAgentPage} 
                      disabled={agentChartPage === 0}
                      className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-500">{t('reports.page', 'Page ')}{agentChartPage + 1} of {Math.max(1, totalAgentPages)}</span>
                    <button 
                      onClick={handleNextAgentPage} 
                      disabled={agentChartPage >= totalAgentPages - 1}
                      className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-[220px] w-full flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paginatedAgents} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}K` : val} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} width={100} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                      <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Detailed Summary Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-[15px] font-extrabold text-slate-900">{t('reports.detailedSummary', 'Detailed Summary')}</h3>
                <div className="flex gap-2.5">
                  <button onClick={exportToCSV} className="text-[12px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm">
                    <DocumentTextIcon className="w-4 h-4 text-blue-500 stroke-2" />{t('reports.exportCsv', 'Export CSV')}</button>
                  <button onClick={exportToExcel} className="text-[12px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm">
                    <TableCellsIcon className="w-4 h-4 text-emerald-500 stroke-2" />{t('reports.exportExcel', 'Export Excel')}</button>
                  <button onClick={exportToPDF} className="text-[12px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm">
                    <DocumentIcon className="w-4 h-4 text-rose-500 stroke-2" />{t('reports.exportPdf', 'Export PDF')}</button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[12px] text-slate-900 bg-white border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-extrabold">#</th>
                      <th className="px-6 py-4 font-extrabold">Agent</th>
                      <th className="px-6 py-4 font-extrabold">Destination</th>
                      <th className="px-6 py-4 font-extrabold text-right">Flights</th>
                      <th className="px-6 py-4 font-extrabold text-right">Passengers</th>
                      <th className="px-6 py-4 font-extrabold text-right">Revenue (EGP)</th>
                      <th className="px-6 py-4 font-extrabold text-right">Revenue (USD)</th>
                      <th className="px-6 py-4 font-extrabold text-right">Expenses (EGP)</th>
                      <th className="px-6 py-4 font-extrabold text-right">Profit (EGP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedTableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-[13px] text-slate-500 font-bold">{tablePage * tableItemsPerPage + idx + 1}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-900 font-extrabold">{row.agentName}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-700 font-bold">{row.destination}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-700 text-right font-extrabold">{row.flights}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-700 text-right font-extrabold">{row.passengers}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-900 text-right font-extrabold">{row.revenueEgp.toLocaleString()}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-700 text-right font-bold">{row.revenueUsd.toLocaleString()}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-700 text-right font-bold">{row.expensesEgp.toLocaleString()}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-900 text-right font-extrabold">{row.profitEgp.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white text-[12px] text-slate-500 font-bold" dir="rtl">
                <div>عرض {Math.min(tablePage * tableItemsPerPage + 1, totalTableItems)} إلى {Math.min((tablePage + 1) * tableItemsPerPage, totalTableItems)} من إجمالي {totalTableItems} صف</div>
                <div className="flex gap-1.5 items-center" dir="ltr">
                  <button onClick={() => setTablePage(0)} disabled={tablePage === 0} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-100">«</button>
                  <button onClick={() => setTablePage(p => Math.max(0, p - 1))} disabled={tablePage === 0} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-100">‹</button>
                  
                  {getVisiblePages().map(pageNum => (
                    <button 
                      key={pageNum}
                      onClick={() => setTablePage(pageNum)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg font-extrabold shadow-sm border transition-colors ${tablePage === pageNum ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'text-slate-600 bg-white hover:bg-slate-50 border-slate-100'}`}
                    >
                      {pageNum + 1}
                    </button>
                  ))}

                  <button onClick={() => setTablePage(p => Math.min(totalTablePages - 1, p + 1))} disabled={tablePage >= totalTablePages - 1} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-100">›</button>
                  <button onClick={() => setTablePage(totalTablePages - 1)} disabled={tablePage >= totalTablePages - 1} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-100">»</button>
                </div>
              </div>
            </div>
          </>
        )}
        
      </div>
    </div>
  );
};

export default ReportsPage;
