import React, { useState, useEffect } from 'react';
import { getSalesSummary } from '../../api/reports.api';
import { ChartBarIcon, CurrencyDollarIcon, TicketIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await getSalesSummary(startDate, endDate);
      console.log('Report API Response:', res);
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
    // In a real application, this would download a CSV or Excel file
    alert("Export functionality would trigger a download here.");
  };

  return (/*#__PURE__*/
    _jsxDEV("div", { children: [/*#__PURE__*/
      _jsxDEV("div", { className: "sm:flex sm:items-center", children: [/*#__PURE__*/
        _jsxDEV("div", { className: "sm:flex-auto", children: [/*#__PURE__*/
          _jsxDEV("h1", { className: "text-2xl font-bold leading-6 text-gray-900", children: "Sales Reports" }, void 0, false), /*#__PURE__*/
          _jsxDEV("p", { className: "mt-2 text-sm text-gray-700", children: "View aggregated financial data across the entire system." }, void 0, false

          )] }, void 0, true
        ), /*#__PURE__*/
        _jsxDEV("div", { className: "mt-4 sm:ml-16 sm:mt-0 sm:flex-none", children: /*#__PURE__*/
          _jsxDEV("button", {
            onClick: handleExport,
            type: "button",
            className: "inline-flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50", children: [/*#__PURE__*/

            _jsxDEV(DocumentArrowDownIcon, { className: "-ml-0.5 h-5 w-5 text-gray-400", "aria-hidden": "true" }, void 0, false), "Export CSV"] }, void 0, true

          ) }, void 0, false
        )] }, void 0, true
      ), /*#__PURE__*/

      _jsxDEV("div", { className: "mt-6 bg-white shadow sm:rounded-lg mb-8", children: /*#__PURE__*/
        _jsxDEV("div", { className: "px-4 py-5 sm:p-6", children: [/*#__PURE__*/
          _jsxDEV("h3", { className: "text-base font-semibold leading-6 text-gray-900", children: "Filter by Date Range" }, void 0, false), /*#__PURE__*/
          _jsxDEV("form", { onSubmit: handleFilter, className: "mt-5 sm:flex sm:items-center", children: [/*#__PURE__*/
            _jsxDEV("div", { className: "w-full sm:max-w-xs mr-4", children: [/*#__PURE__*/
              _jsxDEV("label", { htmlFor: "startDate", className: "sr-only", children: "Start Date" }, void 0, false), /*#__PURE__*/
              _jsxDEV("input", {
                type: "date",
                name: "startDate",
                id: "startDate",
                value: startDate,
                onChange: (e) => setStartDate(e.target.value),
                className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
              )] }, void 0, true
            ), /*#__PURE__*/
            _jsxDEV("div", { className: "w-full sm:max-w-xs mt-3 sm:mt-0 mr-4", children: [/*#__PURE__*/
              _jsxDEV("label", { htmlFor: "endDate", className: "sr-only", children: "End Date" }, void 0, false), /*#__PURE__*/
              _jsxDEV("input", {
                type: "date",
                name: "endDate",
                id: "endDate",
                value: endDate,
                onChange: (e) => setEndDate(e.target.value),
                className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
              )] }, void 0, true
            ), /*#__PURE__*/
            _jsxDEV("button", {
              type: "submit",
              className: "mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-0 sm:ml-3 sm:w-auto", children:
              "Apply Filter" }, void 0, false

            )] }, void 0, true
          )] }, void 0, true
        ) }, void 0, false
      ),

      loading ? /*#__PURE__*/
      _jsxDEV("div", { className: "text-center py-10 text-gray-500", children: "Loading reports data..." }, void 0, false) :
      summary ? /*#__PURE__*/
      _jsxDEV("div", { children: [/*#__PURE__*/
        _jsxDEV("h3", { className: "text-base font-semibold leading-6 text-gray-900 mb-4", children: "Executive Summary" }, void 0, false), /*#__PURE__*/
        _jsxDEV("dl", { className: "mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3", children: [/*#__PURE__*/

          _jsxDEV("div", { className: "relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6", children: [/*#__PURE__*/
            _jsxDEV("dt", { children: [/*#__PURE__*/
              _jsxDEV("div", { className: "absolute rounded-md bg-blue-500 p-3", children: /*#__PURE__*/
                _jsxDEV(TicketIcon, { className: "h-6 w-6 text-white", "aria-hidden": "true" }, void 0, false) }, void 0, false
              ), /*#__PURE__*/
              _jsxDEV("p", { className: "ml-16 truncate text-sm font-medium text-gray-500", children: "Total Tickets" }, void 0, false)] }, void 0, true
            ), /*#__PURE__*/
            _jsxDEV("dd", { className: "ml-16 flex items-baseline pb-6 sm:pb-7", children: /*#__PURE__*/
              _jsxDEV("p", { className: "text-2xl font-semibold text-gray-900", children: summary.totalTickets }, void 0, false) }, void 0, false
            )] }, void 0, true
          ), /*#__PURE__*/

          _jsxDEV("div", { className: "relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6", children: [/*#__PURE__*/
            _jsxDEV("dt", { children: [/*#__PURE__*/
              _jsxDEV("div", { className: "absolute rounded-md bg-indigo-500 p-3", children: /*#__PURE__*/
                _jsxDEV(ChartBarIcon, { className: "h-6 w-6 text-white", "aria-hidden": "true" }, void 0, false) }, void 0, false
              ), /*#__PURE__*/
              _jsxDEV("p", { className: "ml-16 truncate text-sm font-medium text-gray-500", children: "Gross Sales (Base + Tax)" }, void 0, false)] }, void 0, true
            ), /*#__PURE__*/
            _jsxDEV("dd", { className: "ml-16 flex items-baseline pb-6 sm:pb-7", children: /*#__PURE__*/
              _jsxDEV("p", { className: "text-2xl font-semibold text-gray-900", children: ["$", summary.totalGrossSales.toFixed(2)] }, void 0, true) }, void 0, false
            )] }, void 0, true
          ), /*#__PURE__*/

          _jsxDEV("div", { className: "relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6", children: [/*#__PURE__*/
            _jsxDEV("dt", { children: [/*#__PURE__*/
              _jsxDEV("div", { className: "absolute rounded-md bg-green-500 p-3", children: /*#__PURE__*/
                _jsxDEV(CurrencyDollarIcon, { className: "h-6 w-6 text-white", "aria-hidden": "true" }, void 0, false) }, void 0, false
              ), /*#__PURE__*/
              _jsxDEV("p", { className: "ml-16 truncate text-sm font-medium text-gray-500", children: "Net Payable" }, void 0, false)] }, void 0, true
            ), /*#__PURE__*/
            _jsxDEV("dd", { className: "ml-16 flex items-baseline pb-6 sm:pb-7", children: /*#__PURE__*/
              _jsxDEV("p", { className: "text-2xl font-semibold text-green-600", children: ["$", summary.totalNetPayable.toFixed(2)] }, void 0, true) }, void 0, false
            )] }, void 0, true
          )] }, void 0, true

        ), /*#__PURE__*/

        _jsxDEV("h3", { className: "text-base font-semibold leading-6 text-gray-900 mt-8 mb-4", children: "Financial Breakdown" }, void 0, false), /*#__PURE__*/
        _jsxDEV("div", { className: "overflow-hidden bg-white shadow sm:rounded-lg", children: /*#__PURE__*/
          _jsxDEV("div", { className: "px-4 py-5 sm:p-0", children: /*#__PURE__*/
            _jsxDEV("dl", { className: "sm:divide-y sm:divide-gray-200", children: [/*#__PURE__*/
              _jsxDEV("div", { className: "py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6", children: [/*#__PURE__*/
                _jsxDEV("dt", { className: "text-sm font-medium text-gray-500", children: "Total Base Fares" }, void 0, false), /*#__PURE__*/
                _jsxDEV("dd", { className: "mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0", children: ["$", summary.totalBaseFares.toFixed(2)] }, void 0, true)] }, void 0, true
              ), /*#__PURE__*/
              _jsxDEV("div", { className: "py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6", children: [/*#__PURE__*/
                _jsxDEV("dt", { className: "text-sm font-medium text-gray-500", children: "Total Taxes" }, void 0, false), /*#__PURE__*/
                _jsxDEV("dd", { className: "mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0", children: ["$", summary.totalTaxes.toFixed(2)] }, void 0, true)] }, void 0, true
              ), /*#__PURE__*/
              _jsxDEV("div", { className: "py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-red-50", children: [/*#__PURE__*/
                _jsxDEV("dt", { className: "text-sm font-medium text-red-800", children: "Agent Commissions (Deducted)" }, void 0, false), /*#__PURE__*/
                _jsxDEV("dd", { className: "mt-1 text-sm font-bold text-red-600 sm:col-span-2 sm:mt-0", children: ["- $", summary.totalAgentCommissions.toFixed(2)] }, void 0, true)] }, void 0, true
              ), /*#__PURE__*/
              _jsxDEV("div", { className: "py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-green-50", children: [/*#__PURE__*/
                _jsxDEV("dt", { className: "text-sm font-medium text-green-800", children: "Net Payable (Collected)" }, void 0, false), /*#__PURE__*/
                _jsxDEV("dd", { className: "mt-1 text-sm font-bold text-green-600 sm:col-span-2 sm:mt-0", children: ["$", summary.totalNetPayable.toFixed(2)] }, void 0, true)] }, void 0, true
              )] }, void 0, true
            ) }, void 0, false
          ) }, void 0, false
        )] }, void 0, true

      ) :
      null] }, void 0, true
    ));

};

export default ReportsPage;