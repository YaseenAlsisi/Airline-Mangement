import React from 'react';
import { useTranslation } from 'react-i18next';
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const DashboardFilters = ({ 
  filters, 
  setFilters, 
  filterOptions, 
  onRefresh, 
  isLoading 
}) => {
  const { t } = useTranslation();

  const handleDatePresetChange = (e) => {
    const preset = e.target.value;
    const now = new Date();
    let startDate = '';
    let endDate = '';

    if (preset === 'today') {
      startDate = now.toISOString().split('T')[0];
      endDate = startDate;
    } else if (preset === 'thisWeek') {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
    } else if (preset === 'lastMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
    }

    setFilters(prev => ({ ...prev, datePreset: preset, startDate, endDate }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      datePreset: '',
      startDate: '',
      endDate: '',
      agent: '',
      destination: '',
      serviceType: ''
    });
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">{t('dashboard.filters.title', 'Filters')}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Date Preset */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{t('dashboard.filters.datePreset', 'Date Preset')}</label>
          <select 
            name="datePreset" 
            value={filters.datePreset} 
            onChange={handleDatePresetChange}
            className="w-full rounded-lg border-0 py-2 px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">{t('dashboard.filters.customRange', 'Custom')}</option>
            <option value="today">{t('dashboard.filters.today', 'Today')}</option>
            <option value="thisWeek">{t('dashboard.filters.thisWeek', 'This Week')}</option>
            <option value="thisMonth">{t('dashboard.filters.thisMonth', 'This Month')}</option>
            <option value="lastMonth">{t('dashboard.filters.lastMonth', 'Last Month')}</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{t('dashboard.filters.startDate', 'Start Date')}</label>
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleChange}
            className="w-full rounded-lg border-0 py-2 px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{t('dashboard.filters.endDate', 'End Date')}</label>
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleChange}
            className="w-full rounded-lg border-0 py-2 px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Agent */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{t('dashboard.filters.agent', 'Agent')}</label>
          <select 
            name="agent" 
            value={filters.agent} 
            onChange={handleChange}
            className="w-full rounded-lg border-0 py-2 px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">{t('dashboard.filters.allAgents', 'All Agents')}</option>
            {filterOptions?.agents?.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{t('dashboard.filters.destination', 'Destination')}</label>
          <select 
            name="destination" 
            value={filters.destination} 
            onChange={handleChange}
            className="w-full rounded-lg border-0 py-2 px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">{t('dashboard.filters.allDestinations', 'All Destinations')}</option>
            {filterOptions?.destinations?.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

      </div>

      <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {t('dashboard.filters.reset', 'Reset')}
        </button>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('dashboard.refreshData', 'Apply & Refresh')}
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;
