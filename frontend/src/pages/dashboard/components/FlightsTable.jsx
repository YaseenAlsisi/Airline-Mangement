import React from 'react';
import { useTranslation } from 'react-i18next';

export const FlightsTable = ({ flights }) => {
  const { t } = useTranslation();

  if (!flights || flights.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">{t('dashboard.tables.todaysFlights', 'Flights Overview')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">{t('dashboard.tables.flightNumber', 'Flight')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.departureDate', 'Time')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.from', 'From')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.to', 'To')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.passengers', 'Pax')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.serviceType', 'Type')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flights.map((flight, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-900">{flight.flightNumber}</td>
                <td className="px-5 py-3 text-slate-600">{flight.time}</td>
                <td className="px-5 py-3 text-slate-600">{flight.from}</td>
                <td className="px-5 py-3 text-slate-600">{flight.to}</td>
                <td className="px-5 py-3 text-slate-600 font-semibold">{flight.passengers}</td>
                <td className="px-5 py-3 text-slate-600">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-semibold">{flight.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
