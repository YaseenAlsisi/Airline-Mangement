import React, { useEffect, useState } from 'react';
import { getAgents } from '../../api/agents.api';
import { getAgentManifestSummary } from '../../api/manifestImport.api';
import { useAuthStore } from '../../store/authStore';
import AgentFormModal from './AgentFormModal';
import AgentPassengersModal from './AgentPassengersModal';
import { useTranslation } from 'react-i18next';

export const AgentDataPage = () => {
  const { t } = useTranslation();
  const { hasPermission } = useAuthStore();
  const [agents, setAgents] = useState([]);
  const [summaryMap, setSummaryMap] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  
  const [isPassengersModalOpen, setIsPassengersModalOpen] = useState(false);
  const [viewingAgent, setViewingAgent] = useState(null);

  const canCreate = hasPermission('AGENT_CREATE');
  const canEdit = hasPermission('AGENT_EDIT');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, summaryRes] = await Promise.all([
        getAgents(),
        getAgentManifestSummary()
      ]);
      setAgents(agentsRes.data?.content || []);
      
      const smap = {};
      summaryRes.forEach(s => {
        smap[s.agentId] = s.passengerCount;
      });
      setSummaryMap(smap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">{t('agent.title', 'Agents')}</h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('agent.subtitle', 'A list of all travel agents in the system including their code, name, and passenger counts.')}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {canCreate && (
            <button
              onClick={handleCreate}
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t('agent.addAgent', 'Add agent')}
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-start text-sm font-semibold text-gray-900 sm:pl-6">{t('agent.col.code', 'Code')}</th>
                    <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('agent.col.name', 'Name')}</th>
                    <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('agent.col.email', 'Email')}</th>
                    <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('agent.col.status', 'Status')}</th>
                    <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('agent.col.passengers', 'Total Passengers')}</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr><td colSpan={6} className="py-4 text-center text-sm text-gray-500">{t('common.loading', 'Loading...')}</td></tr>
                  ) : agents.length === 0 ? (
                    <tr><td colSpan={6} className="py-4 text-center text-sm text-gray-500">{t('agent.noneFound', 'No agents found.')}</td></tr>
                  ) : (
                    agents.map((agent) => {
                      const pCount = summaryMap[agent.id] || 0;
                      return (
                        <tr key={agent.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{agent.code}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{agent.name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{agent.email || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              agent.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                              agent.status === 'INACTIVE' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                              'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                            }`}>
                              {agent.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-indigo-600">
                            <button 
                              onClick={() => handleViewPassengers(agent)}
                              className="hover:underline flex items-center gap-1"
                              disabled={pCount === 0}
                            >
                              {pCount}
                            </button>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-end text-sm font-medium sm:pr-6">
                            {canEdit && (
                              <button onClick={() => handleEdit(agent)} className="text-indigo-600 hover:text-indigo-900">
                                {t('common.edit', 'Edit')}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
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