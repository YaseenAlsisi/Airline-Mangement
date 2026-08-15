import React, { useEffect, useState } from 'react';
import { getAgentManifestPassengers } from '../../api/manifestImport.api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export const AgentPassengersModal = ({ agent, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && agent) {
      fetchPassengers();
    }
  }, [isOpen, agent]);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const res = await getAgentManifestPassengers(agent.id, { page: 0, size: 50 });
      setPassengers(res.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                  {t('agent.passengers.title', 'Passengers for')} {agent.name}
                </h3>
                <div className="mt-4">
                  {loading ? (
                    <div className="text-sm text-gray-500">{t('common.loading', 'Loading...')}</div>
                  ) : passengers.length === 0 ? (
                    <div className="text-sm text-gray-500">{t('agent.passengers.none', 'No passengers found for this agent.')}</div>
                  ) : (
                    <div className="overflow-x-auto ring-1 ring-gray-300 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-start text-xs font-semibold text-gray-900">{t('import.col.passengerName', 'Name')}</th>
                            <th className="px-3 py-3 text-start text-xs font-semibold text-gray-900">{t('import.col.passport', 'Passport')}</th>
                            <th className="px-3 py-3 text-start text-xs font-semibold text-gray-900">{t('import.col.departureDate', 'Date')}</th>
                            <th className="px-3 py-3 text-start text-xs font-semibold text-gray-900">{t('import.col.flight', 'Flight')}</th>
                            <th className="px-3 py-3 text-start text-xs font-semibold text-gray-900">{t('import.col.destination', 'Dest')}</th>
                            <th className="px-3 py-3 text-start text-xs font-semibold text-gray-900">{t('import.col.category', 'Category')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {passengers.map(p => (
                            <tr key={p.id}>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900">{p.passengerName}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{p.passportNumber}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{p.departureDate}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{p.flightNumber}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{p.destination}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{p.passengerCategory}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPassengersModal;
