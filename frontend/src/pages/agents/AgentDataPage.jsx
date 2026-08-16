import React, { useEffect, useState } from 'react';
import { getAgents } from '../../api/agents.api';
import { getAgentManifestSummary, getAgentManifestPassengers, getAllManifestPassengers } from '../../api/manifestImport.api';
import { useAuthStore } from '../../store/authStore';
import AgentFormModal from './AgentFormModal';
import AgentPassengersModal from './AgentPassengersModal';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const AgentDataPage = () => {
  useDocumentTitle('Agent Data');
  const { t } = useTranslation();
  const { hasPermission } = useAuthStore();
  const [selectedFilterName, setSelectedFilterName] = useState('');
  const [selectedFilterDate, setSelectedFilterDate] = useState('');
  const [allPassengers, setAllPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  
  const [isPassengersModalOpen, setIsPassengersModalOpen] = useState(false);
  const [viewingAgent, setViewingAgent] = useState(null);

  const canCreate = hasPermission('AGENT_CREATE');
  const canEdit = hasPermission('AGENT_EDIT');

  useEffect(() => {
    const fetchAllPassengers = async () => {
      setLoadingPassengers(true);
      try {
        const res = await getAllManifestPassengers({ page: 0, size: 5000 });
        const rawData = res.data?.content || res.content || [];
        
        // Frontend deduplication to hide old database duplicates
        // We iterate backwards to keep the most recently uploaded records if there are duplicates
        const seenPassports = new Set();
        const seenNames = new Set();
        const uniqueData = [];
        
        for (let i = rawData.length - 1; i >= 0; i--) {
          const p = rawData[i];
          const passKey = p.passportNumber ? `${p.passportNumber}_${p.departureDate}` : null;
          const nameKey = p.passengerName ? `${p.passengerName}_${p.departureDate}` : null;
          
          let isDup = false;
          if (passKey && seenPassports.has(passKey)) isDup = true;
          if (nameKey && seenNames.has(nameKey)) isDup = true;
          
          if (!isDup) {
            uniqueData.unshift(p); // Add to beginning to preserve original order
            if (passKey) seenPassports.add(passKey);
            if (nameKey) seenNames.add(nameKey);
          }
        }
        
        setAllPassengers(uniqueData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPassengers(false);
      }
    };
    fetchAllPassengers();
  }, []);

  const displayedPassengers = allPassengers.filter(p => {
    if (selectedFilterName && p.agentNameRaw !== selectedFilterName) return false;
    if (selectedFilterDate && p.departureDate !== selectedFilterDate) return false;
    return true;
  });

  const totalDebitUsd = displayedPassengers.reduce((sum, p) => sum + (p.debitUsd || 0), 0);
  const totalDebitEgp = displayedPassengers.reduce((sum, p) => sum + (p.debitEgp || 0), 0);

  const handleEdit = (agent) => {
    if (!canEdit) return;
    setEditingAgent(agent);
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAgent(null);
    setIsFormModalOpen(true);
  };

  const handleFormModalClose = (shouldRefresh) => {
    setIsFormModalOpen(false);
    if (shouldRefresh) {
      fetchData();
    }
  };

  const handleViewPassengers = (agent) => {
    setViewingAgent(agent);
    setIsPassengersModalOpen(true);
  };

  const handlePassengersModalClose = () => {
    setIsPassengersModalOpen(false);
    setViewingAgent(null);
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] px-6 py-12 sm:px-14 sm:py-16 shadow-2xl mb-12 ring-1 ring-white/10 group">
        {/* Deep background gradients & massive glowing blurs */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent mix-blend-overlay pointer-events-none transition-opacity duration-1000 group-hover:opacity-70"></div>
        <div className="absolute -top-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none mix-blend-screen transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none mix-blend-screen transition-transform duration-1000 group-hover:scale-110"></div>
        
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAyNEwyNCAwTTI0IDI0TDAgMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] pointer-events-none"></div>

        <div className="relative z-10 sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_40px_rgba(99,102,241,0.4)] ring-1 ring-white/20 transform hover:scale-105 hover:rotate-3 transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 sm:text-5xl pb-1 drop-shadow-sm">
                  {t('agent.title', 'Agents & Passengers')}
                </h1>
                <p className="mt-3 max-w-2xl text-lg text-indigo-200/70 font-medium leading-relaxed">
                  {t('agent.subtitle', 'A comprehensive list of all travel agents in the system and their passengers. Use the filters below to instantly track passenger counts and financial totals.')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-0 flex gap-5 opacity-95 hidden lg:flex">
             <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 min-w-[180px] shadow-2xl hover:bg-white/10 transition-colors duration-300 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
               <div className="text-sm font-semibold tracking-wide text-indigo-300 mb-2 uppercase">Total Passengers</div>
               <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{allPassengers.length}</div>
             </div>
             <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 min-w-[180px] shadow-2xl hover:bg-white/10 transition-colors duration-300 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
               <div className="text-sm font-semibold tracking-wide text-purple-300 mb-2 uppercase">Unique Agents</div>
               <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{new Set(allPassengers.map(p => p.agentNameRaw).filter(Boolean)).size}</div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flow-root">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="agent-filter" className="block text-sm font-medium leading-6 text-gray-900">
              {t('agent.filterByName', 'Select Agent')}
            </label>
            <select
              id="agent-filter"
              name="agent-filter"
              value={selectedFilterName}
              onChange={(e) => setSelectedFilterName(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-colors hover:border-indigo-400 cursor-pointer"
            >
              <option value="">{t('common.allAgents', 'All Agents')}</option>
              {[...new Set(allPassengers.map(p => p.agentNameRaw).filter(Boolean))].sort().map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:max-w-xs">
            <label htmlFor="date-filter" className="block text-sm font-medium leading-6 text-gray-900">
              {t('import.col.departureDate', 'Dep. Date')}
            </label>
            <select
              id="date-filter"
              name="date-filter"
              value={selectedFilterDate}
              onChange={(e) => setSelectedFilterDate(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-colors hover:border-indigo-400 cursor-pointer"
            >
              <option value="">{t('common.allDates', 'All Dates')}</option>
              {[...new Set(allPassengers.map(p => p.departureDate).filter(Boolean))].sort().map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 pb-[3px]">
            <div className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-2 ring-1 ring-inset ring-indigo-500/20 shadow-sm transition-all duration-300 hover:shadow-md hover:from-indigo-100 hover:to-blue-100">
              <div className="rounded-full bg-indigo-100 p-1 group-hover:bg-indigo-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-600">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-600">{t('agent.totalPassengers', 'Total Passengers')}</span>
              <span className="text-lg font-bold text-indigo-700 tabular-nums tracking-tight">{displayedPassengers.length}</span>
            </div>

            <div className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-2 ring-1 ring-inset ring-green-500/20 shadow-sm transition-all duration-300 hover:shadow-md hover:from-green-100 hover:to-emerald-100">
              <span className="text-sm font-medium text-slate-600">{t('import.col.debitUsd', 'مدين دولار')}</span>
              <span className="text-lg font-bold text-green-700 tabular-nums tracking-tight">${totalDebitUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-2 ring-1 ring-inset ring-orange-500/20 shadow-sm transition-all duration-300 hover:shadow-md hover:from-orange-100 hover:to-amber-100">
              <span className="text-sm font-medium text-slate-600">{t('import.col.debitEgp', 'مدين مصري')}</span>
              <span className="text-lg font-bold text-orange-700 tabular-nums tracking-tight">{totalDebitEgp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP</span>
            </div>
          </div>
        </div>
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.passengerName', 'Passenger Name')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.passport', 'Passport')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.category', 'Category')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.agentExcel', 'Agent (Excel)')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.departureDate', 'Dep. Date')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.flight', 'Flight')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.destination', 'Destination')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.departurePort', 'المنفذ')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.birthDate', 'تاريخ الميلاد')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.arrivalTime', 'ميعاد الوصول')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.serviceType', 'نوع الخدمة')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.debitUsd', 'مدين دولار')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.creditUsd', 'دائن دولار')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.debitEgp', 'مدين مصري')}</th>
                      <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.creditEgp', 'دائن مصري')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loadingPassengers ? (
                      <tr><td colSpan={15} className="py-4 text-center text-sm text-gray-500">{t('common.loading', 'Loading...')}</td></tr>
                    ) : displayedPassengers.length === 0 ? (
                      <tr><td colSpan={15} className="py-4 text-center text-sm text-gray-500">{t('agent.passengers.none', 'No passengers found.')}</td></tr>
                    ) : (
                      displayedPassengers.map(p => (
                        <tr key={p.id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{p.passengerName}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.passportNumber}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.passengerCategory}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.agentNameRaw}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.departureDate}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.flightNumber}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.destination}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.departurePort}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.birthDate}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.arrivalTime}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.serviceType}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.debitUsd}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.creditUsd}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.debitEgp}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.creditEgp}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>

      <AgentFormModal
        isOpen={isFormModalOpen}
        agent={editingAgent}
        onClose={handleFormModalClose}
      />
      
      <AgentPassengersModal 
        isOpen={isPassengersModalOpen}
        agent={viewingAgent}
        onClose={handlePassengersModalClose}
      />
    </div>
  );
};

export default AgentDataPage;