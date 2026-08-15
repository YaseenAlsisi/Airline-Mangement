import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  TableCellsIcon, 
  DocumentArrowDownIcon,
  FunnelIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartPieIcon,
  UsersIcon,
  PaperAirplaneIcon,
  ArrowUpIcon,
  ChartBarIcon,
  MapPinIcon,
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function SalesReportsDashboard() {
  // Empty data as requested
  const [data, setData] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    agent: '',
    destination: '',
    airline: '',
    serviceType: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    // Logic to apply filters when real data is connected
  };

  const resetFilters = () => {
    setFilters({ fromDate: '', toDate: '', agent: '', destination: '', airline: '', serviceType: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans text-slate-800" dir="ltr">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-sm text-slate-500 mt-1">View aggregated financial and operational data across the entire system.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <DocumentTextIcon className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors shadow-sm">
            <TableCellsIcon className="w-4 h-4" /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] text-white rounded-lg text-sm font-medium hover:bg-[#dc2626] transition-colors shadow-sm">
            <DocumentArrowDownIcon className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Filter Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
            <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
            <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Agent</label>
            <select name="agent" value={filters.agent} onChange={handleFilterChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] bg-white">
              <option value="">All Agents</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Destination</label>
            <select name="destination" value={filters.destination} onChange={handleFilterChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] bg-white">
              <option value="">All Destinations</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Airline</label>
            <select name="airline" value={filters.airline} onChange={handleFilterChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] bg-white">
              <option value="">All Airlines</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Service Type</label>
            <select name="serviceType" value={filters.serviceType} onChange={handleFilterChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] bg-white">
              <option value="">All Service Types</option>
            </select>
          </div>
          <div className="xl:col-span-2 flex gap-3 justify-end">
            <button onClick={applyFilters} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6366f1] text-white rounded-lg text-sm font-medium hover:bg-[#4f46e5] transition-colors shadow-sm w-full md:w-auto">
              <FunnelIcon className="w-4 h-4" /> Apply Filter
            </button>
            <button onClick={resetFilters} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm w-full md:w-auto">
              <ArrowPathIcon className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Revenue (EGP)" value="0" percent="0%" bgClass="bg-[#ecfdf5]" iconBg="bg-[#d1fae5]" iconColor="text-[#10b981]" textClass="text-[#065f46]" Icon={BanknotesIcon} />
        <KPICard title="Total Revenue (USD)" value="0" percent="0%" bgClass="bg-[#eff6ff]" iconBg="bg-[#dbeafe]" iconColor="text-[#3b82f6]" textClass="text-[#1e3a8a]" Icon={CurrencyDollarIcon} />
        <KPICard title="Total Expenses" value="0" percent="0%" bgClass="bg-[#fef2f2]" iconBg="bg-[#fee2e2]" iconColor="text-[#ef4444]" textClass="text-[#991b1b]" Icon={CreditCardIcon} />
        <KPICard title="Net Profit" value="0" percent="0%" bgClass="bg-[#faf5ff]" iconBg="bg-[#f3e8ff]" iconColor="text-[#a855f7]" textClass="text-[#4c1d95]" Icon={ChartPieIcon} />
        <KPICard title="Total Passengers" value="0" percent="0%" bgClass="bg-[#fffbeb]" iconBg="bg-[#fef3c7]" iconColor="text-[#f59e0b]" textClass="text-[#92400e]" Icon={UsersIcon} />
        <KPICard title="Total Flights" value="0" percent="0%" bgClass="bg-[#ecfeff]" iconBg="bg-[#cffafe]" iconColor="text-[#06b6d4]" textClass="text-[#155e75]" Icon={PaperAirplaneIcon} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <ChartBarIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800">Daily Revenue</h3>
          </div>
          <div className="flex-1 flex items-center justify-center h-64 border border-dashed border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-400 font-medium">No Data Available</p>
          </div>
        </div>

        {/* Revenue by Destination */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <MapPinIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800">Revenue by Destination</h3>
          </div>
          <div className="flex-1 flex items-center justify-center h-64 border border-dashed border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-400 font-medium">No Data Available</p>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Service Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <ChartPieIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800">Service Type Distribution</h3>
          </div>
          <div className="flex-1 flex items-center justify-center h-64 border border-dashed border-slate-200 rounded-lg bg-slate-50 mt-4">
            <p className="text-sm text-slate-400 font-medium">No Data Available</p>
          </div>
        </div>

        {/* Top 5 Agents */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrophyIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800">Top 5 Agents by Revenue</h3>
          </div>
          <div className="flex-1 flex items-center justify-center h-64 border border-dashed border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-400 font-medium">No Data Available</p>
          </div>
        </div>
      </div>

      {/* Detailed Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <TableCellsIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-base font-bold text-slate-800">Detailed Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="px-5 py-4 w-12">#</th>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Destination</th>
                <th className="px-5 py-4">Airline</th>
                <th className="px-5 py-4">Service Type</th>
                <th className="px-5 py-4 text-center">Flights</th>
                <th className="px-5 py-4 text-center">Passengers</th>
                <th className="px-5 py-4 text-right">Revenue (EGP)</th>
                <th className="px-5 py-4 text-right">Revenue (USD)</th>
                <th className="px-5 py-4 text-right">Expenses</th>
                <th className="px-5 py-4 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              <tr>
                <td colSpan="11" className="p-8 text-center text-slate-500 font-medium">No data found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white">
          <div>
            Showing 0 to 0 of 0 entries
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, percent, bgClass, iconBg, iconColor, textClass, Icon }) {
  return (
    <div className={`${bgClass} rounded-xl p-5 border border-white/60 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
      <div className="flex items-start gap-4 mb-3">
        <div className={`${iconBg} ${iconColor} p-2.5 rounded-lg shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className={`text-xs font-bold ${textClass} mb-1 opacity-90`}>{title}</h4>
          <div className={`text-2xl font-black ${textClass} tracking-tight`}>{value}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 ml-14">
        <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
          <ArrowUpIcon className="w-3 h-3 mr-0.5" strokeWidth={3} /> {percent}
        </span>
        <span className={`text-[10px] ${textClass} opacity-70 font-medium`}>vs previous period</span>
      </div>
    </div>
  );
}
