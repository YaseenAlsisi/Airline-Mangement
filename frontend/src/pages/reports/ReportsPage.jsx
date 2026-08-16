import React, { useState, useEffect } from 'react';
import { getSalesSummary } from '../../api/reports.api';
import { ChartBarIcon, CurrencyDollarIcon, TicketIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

export const ReportsPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('Reports'));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await getSalesSummary(startDate, endDate);
      setSummary(res.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchSummary();
  };

  const handleExport = () => {
    alert(t('Export functionality would trigger a download here.'));
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-slate-900">{t('Sales Reports')}</h1>
          <p className="mt-2 text-sm text-slate-700">
            {t('View aggregated financial data across the entire system.')}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={handleExport}
            type="button"
            className="inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <DocumentArrowDownIcon className="-ml-0.5 h-5 w-5 text-slate-400" aria-hidden="true" />
            {t('Export CSV')}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-sm sm:rounded-lg mb-8 border border-slate-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-slate-900">{t('Filter by Date Range')}</h3>
          <form onSubmit={handleFilter} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs mr-4">
              <label htmlFor="startDate" className="sr-only">{t('Start Date')}</label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="w-full sm:max-w-xs mt-3 sm:mt-0 mr-4">
              <label htmlFor="endDate" className="sr-only">{t('End Date')}</label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <button
              type="submit"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto"
            >
              {t('Apply Filter')}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">{t('Loading report data...')}</div>
      ) : summary ? (
        <div>
          <h3 className="text-base font-semibold leading-6 text-slate-900 mb-4">{t('Executive Summary')}</h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow-sm border border-slate-200 sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-md bg-blue-500 p-3">
                  <TicketIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-slate-500">{t('Total Tickets')}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-slate-900">{summary.totalTickets}</p>
              </dd>
            </div>

            <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow-sm border border-slate-200 sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-slate-500">{t('Gross Sales (Base + Tax)')}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-slate-900">${summary.totalGrossSales?.toFixed(2) || '0.00'}</p>
              </dd>
            </div>

            <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow-sm border border-slate-200 sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-md bg-green-500 p-3">
                  <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-slate-500">{t('Net Revenue')}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-slate-900">${summary.totalRevenue?.toFixed(2) || '0.00'}</p>
              </dd>
            </div>
          </dl>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">{t('Revenue by PNR Status')}</h3>
            <div className="space-y-4">
              {summary.revenueByStatus && Object.entries(summary.revenueByStatus).map(([status, amount]) => (
                <div key={status} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-600 font-medium">{t(status)}</span>
                  <span className="text-sm font-bold text-slate-900">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              {(!summary.revenueByStatus || Object.keys(summary.revenueByStatus).length === 0) && (
                <div className="text-sm text-slate-500 italic py-2">{t('No revenue data available for the selected period.')}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500">{t('No report data available.')}</div>
      )}
    </div>
  );
};

export default ReportsPage;
