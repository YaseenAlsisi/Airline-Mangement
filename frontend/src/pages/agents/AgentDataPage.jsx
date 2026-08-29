import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllManifestPassengers, resetManifestData } from '../../api/manifestImport.api';
import { getAllAgentPayments } from '../../api/agentPayment.api';
import { getAgents, deleteAgent } from '../../api/agents.api';
import { uploadAgentAccountImport } from '../../api/agentBalance.api';
import { useAuthStore } from '../../store/authStore';
import AgentFormModal from './AgentFormModal';
import AgentPassengersModal from './AgentPassengersModal';
import AgentPaymentModal from './AgentPaymentModal';
import AgentPaymentHistoryModal from './AgentPaymentHistoryModal';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Pagination } from '../../components/ui/Pagination';
import { exportAgentsToExcel, exportBalancesReportToExcel } from '../../utils/excelExportUtils';
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon, BuildingOfficeIcon, CalendarDaysIcon, ChevronLeftIcon, ArrowDownTrayIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

export const AgentDataPage = () => {
  useDocumentTitle('Agent Data');
  const { t } = useTranslation();
  const { hasPermission } = useAuthStore();
  
  const [allPassengers, setAllPassengers] = useState([]);
  const [allAgentPayments, setAllAgentPayments] = useState([]);
  const [allExplicitAgents, setAllExplicitAgents] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterName, setSelectedFilterName] = useState('');
  const [selectedFilterDate, setSelectedFilterDate] = useState('');
  
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const [isPassengersModalOpen, setIsPassengersModalOpen] = useState(false);
  const [viewingAgent, setViewingAgent] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAgentGroup, setPaymentAgentGroup] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyAgentGroup, setHistoryAgentGroup] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterView, setFilterView] = useState('main');
  const filterRef = useRef(null);

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadAgentAccountImport(file);
      alert(t('agent.importSuccess', 'تم رفع الملف واستيراد الأرصدة بنجاح! / File imported successfully!'));
      loadData(); // refresh data
    } catch (err) {
      console.error(err);
      alert(t('agent.importError', 'حدث خطأ أثناء رفع الملف / Error importing file'));
    } finally {
      setIsUploading(false);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const canEdit = hasPermission('AGENT_EDIT');

  const fetchAllPassengers = async () => {
    setLoadingPassengers(true);
    try {
      const res = await getAllManifestPassengers({ page: 0, size: 50000 });
      const rawData = res.data?.content || res.content || [];

      const uniqueData = rawData;

      setAllPassengers(uniqueData);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllPayments = async () => {
    try {
      const res = await getAllAgentPayments();
      const payments = res.content || res.data || res || [];
      setAllAgentPayments(Array.isArray(payments) ? payments : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllExplicitAgents = async () => {
    try {
      const res = await getAgents({ size: 5000 });
      const agents = res.data?.data?.content || res.data?.content || res.content || [];
      setAllExplicitAgents(Array.isArray(agents) ? agents : []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoadingPassengers(true);
    await Promise.all([fetchAllPassengers(), fetchAllPayments(), fetchAllExplicitAgents()]);
    setLoadingPassengers(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilterName, selectedFilterDate, itemsPerPage, viewMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const displayedPassengers = allPassengers.filter(p => {
    const agentName = p.agentNameRaw || 'Unknown';
    if (searchTerm && !agentName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedFilterName && agentName !== selectedFilterName) return false;
    if (selectedFilterDate && p.departureDate !== selectedFilterDate) return false;
    return true;
  });

  const agentGroupsMap = new Map();
  
    // Pre-fill with explicit agents
    allExplicitAgents.forEach(agent => {
    const existing = agentGroupsMap.get(agent.name);
    // If an ACTIVE agent is already mapped, do not overwrite it with a DELETED one of the same name.
    if (existing && !existing.isDeleted && agent.status === 'DELETED') {
      return; 
    }
    
    agentGroupsMap.set(agent.name, {
      id: agent.id,
      agentName: agent.name,
      isDeleted: agent.status === 'DELETED',
      passengerCount: 0,
      debitUsd: 0,
      creditUsd: 0,
      debitEgp: 0,
      creditEgp: 0,
      passengers: [],
      payments: [],
      fullAgentData: agent
    });
  });

  displayedPassengers.forEach(p => {
    const agentName = p.agentNameRaw || 'Unknown';
    if (!agentGroupsMap.has(agentName)) {
      const explicitAgent = allExplicitAgents.find(a => a.name.toLowerCase() === agentName.toLowerCase());
      agentGroupsMap.set(agentName, {
        id: explicitAgent ? explicitAgent.id : null,
        fullAgentData: explicitAgent || null,
        isDeleted: explicitAgent ? explicitAgent.status === 'DELETED' : false,
        agentName,
        passengerCount: 0,
        debitUsd: 0,
        creditUsd: 0,
        debitEgp: 0,
        creditEgp: 0,
        passengers: [],
        payments: []
      });
    }
    const group = agentGroupsMap.get(agentName);
    group.passengerCount += 1;
    group.passengers.push(p);
    
    const debitEgp = p.totalPrice != null ? Number(p.totalPrice) : (Number(p.debitEgp) || 0);
    group.debitEgp += debitEgp;
    group.debitUsd += (Number(p.debitUsd) || 0);
    if (Number(p.creditUsd) > 0) {
      group.creditUsd += Number(p.creditUsd);
    }
    if (Number(p.creditEgp) > 0) {
      group.creditEgp += Number(p.creditEgp);
    }
  });

  allAgentPayments.forEach(payment => {
    const agentName = payment.agentNameRaw;
    if (agentGroupsMap.has(agentName)) {
      const group = agentGroupsMap.get(agentName);
      const currency = payment.currency || group.fullAgentData?.currency || 'EGP';
      const isDebit = payment.paymentType === 'DEBIT';
      
      if (currency === 'USD') {
        if (isDebit) group.debitUsd += (Number(payment.amount) || 0);
        else group.creditUsd += (Number(payment.amount) || 0);
      } else {
        if (isDebit) group.debitEgp += (Number(payment.amount) || 0);
        else group.creditEgp += (Number(payment.amount) || 0);
      }
      
      if (!group.payments) group.payments = [];
      group.payments.push(payment);
    }
  });

  const agentGroups = Array.from(agentGroupsMap.values())
    .filter(a => {
      // Completely hide deleted agents if their balance is zero in both currencies
      const diffEgp = a.debitEgp - a.creditEgp;
      const diffUsd = a.debitUsd - a.creditUsd;
      if (a.isDeleted && diffEgp === 0 && diffUsd === 0) {
        return false;
      }
      if (searchTerm && !a.agentName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedFilterName && a.agentName !== selectedFilterName) return false;
      return true;
    })
    .sort((a, b) => a.agentName.localeCompare(b.agentName));

  const totalPages = Math.ceil(agentGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgents = agentGroups.slice(startIndex, startIndex + itemsPerPage);

  const totalAgentsCount = agentGroups.filter(g => g.passengerCount > 0 && !g.isDeleted).length;
  const totalDebitEgpOverall = agentGroups.reduce((sum, g) => {
    const bal = g.debitEgp - g.creditEgp;
    return bal > 0 ? sum + bal : sum;
  }, 0);
  const totalDebitUsdOverall = agentGroups.reduce((sum, g) => {
    const bal = g.debitUsd - g.creditUsd;
    return bal > 0 ? sum + bal : sum;
  }, 0);

  const handleViewDetails = (agentGroup) => {
    setViewingAgent(agentGroup);
    setIsPassengersModalOpen(true);
  };

  const handleOpenHistory = (agentGroup) => {
    setHistoryAgentGroup(agentGroup);
    setIsHistoryModalOpen(true);
  };

  const handleOpenPayment = (agentGroup) => {
    setPaymentAgentGroup(agentGroup);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentApplied = async () => {
    try {
      const res = await getAllAgentPayments();
      const payments = res.content || res.data || res || [];
      setAllAgentPayments(Array.isArray(payments) ? payments : []);
    } catch (e) {
      console.error('Failed to refresh payments', e);
    }
  };

  const handleEditAgent = (agentGroup) => {
    if (agentGroup.fullAgentData) {
      setEditingAgent(agentGroup.fullAgentData);
      setIsFormModalOpen(true);
    }
  };

  const handleDeleteAgent = async (agentGroup) => {
    if (!agentGroup.id) return;
    if (window.confirm(t('agent.confirmDelete', 'Are you sure you want to delete this agent?'))) {
      try {
        await deleteAgent(agentGroup.id);
        
        // Refresh all agents
        const res = await getAgents({ size: 5000 });
        const agents = res.data?.data?.content || res.data?.content || res.content || [];
        setAllExplicitAgents(Array.isArray(agents) ? agents : []);
        
      } catch (e) {
        console.error(e);
        alert(t('agent.deleteError', 'Failed to delete agent. It may have associated payments or passengers.'));
      }
    }
  };

  const getSummaryStatus = (debit, credit) => {
    const diff = debit - credit;
    if (diff > 0) return { text: t('agent.owesCompany', 'Agent owes'), color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (diff < 0) return { text: t('agent.companyOwes', 'Company owes'), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    return { text: t('agent.settled', 'Settled'), color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
  };

  const renderFilterOptions = (filterKey) => {
    const options = filterKey === 'agentNameRaw' 
      ? agentGroups.map(g => g.agentName).sort((a, b) => a.localeCompare(b))
      : [...new Set(allPassengers.map(p => p.departureDate).filter(Boolean))].sort();

    const currentValue = filterKey === 'agentNameRaw' ? selectedFilterName : selectedFilterDate;
    const setValue = filterKey === 'agentNameRaw' ? setSelectedFilterName : setSelectedFilterDate;

    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setFilterView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeftIcon className="w-5 h-5"/></button>
          <h3 className="text-sm font-bold text-slate-800">{filterKey === 'agentNameRaw' ? t('agent.filterByName', 'Agent') : t('import.col.departureDate', 'Date')}</h3>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button 
            onClick={() => { setValue(''); setFilterView('main'); }}
            className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium ${!currentValue ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            {t('common.all', 'All')}
          </button>
          {options.map(val => (
            <button 
              key={val}
              onClick={() => { setValue(val); setFilterView('main'); }}
              className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium ${currentValue === val ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{t('agent.totalAgents', 'Total Agents')}</p>
            <h3 className="text-3xl font-black text-slate-800">{totalAgentsCount}</h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <BuildingOfficeIcon className="w-7 h-7 text-indigo-600" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{t('agent.totalDebit', 'Total Debit')}</p>
            <h3 className="text-xl font-black text-slate-800">
              {totalDebitEgpOverall.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-sm text-slate-400 font-medium ml-1">EGP</span>
            </h3>
            {totalDebitUsdOverall > 0 && (
              <h3 className="text-xl font-black text-slate-800 mt-1">
                {totalDebitUsdOverall.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-sm text-slate-400 font-medium ml-1">USD</span>
              </h3>
            )}
          </div>
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-orange-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">{t('common.showing', 'Showing')}</span>
            <select 
              className="bg-indigo-50 border-none text-indigo-700 text-sm rounded-lg focus:ring-indigo-500 block p-2 cursor-pointer font-semibold outline-none"
              style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234338ca' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: '2.5rem', appearance: 'none', WebkitAppearance: 'none'}}
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={() => exportAgentsToExcel(agentGroups)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {t('agent.exportExcel', 'Export to Excel')}
          </button>

          <button
            onClick={() => setIsFormModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <BuildingOfficeIcon className="h-5 w-5" />
            {t('agent.addAgent', 'Add Agent')}
          </button>



          <button
            onClick={() => {
              const priceStr = window.prompt(t('agent.enterTicketPrice', 'أدخل سعر التذكرة (Enter Ticket Price)'), '44000');
              if (priceStr !== null) {
                const price = Number(priceStr);
                if (!isNaN(price) && price > 0) {
                  exportBalancesReportToExcel(agentGroups, price);
                } else {
                  alert(t('agent.invalidPrice', 'السعر غير صحيح (Invalid price)'));
                }
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <DocumentChartBarIcon className="h-5 w-5" />
            {t('agent.exportBalances', 'تقرير الأرصدة')}
          </button>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder={t('agent.searchAgent', 'Search agent...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full sm:w-64 rounded-lg border-0 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all bg-white"
            />
          </div>

          <div className="relative inline-block text-left" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors"
            >
              <FunnelIcon className="h-4 w-4 text-slate-500" />
              {t('agent.filter', 'Filter')}
              {(selectedFilterName || selectedFilterDate) && (
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 absolute top-1.5 right-1.5"></span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 z-50 mt-2 w-72 origin-top-left rounded-xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none p-3 transition-all overflow-hidden">
                {filterView === 'main' ? (
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 mb-2">{t('import.addFilter', 'Add Filter')}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setFilterView('agentNameRaw')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedFilterName ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                      >
                        <BuildingOfficeIcon className={`w-5 h-5 mb-1 ${selectedFilterName ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className={`text-[11px] font-semibold ${selectedFilterName ? 'text-indigo-700' : 'text-slate-600'}`}>{t('agent.filterByName', 'Agent')}</span>
                      </button>
                      <button 
                        onClick={() => setFilterView('departureDate')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedFilterDate ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                      >
                        <CalendarDaysIcon className={`w-5 h-5 mb-1 ${selectedFilterDate ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className={`text-[11px] font-semibold ${selectedFilterDate ? 'text-indigo-700' : 'text-slate-600'}`}>{t('import.col.departureDate', 'Dep. Date')}</span>
                      </button>
                    </div>
                    {(selectedFilterName || selectedFilterDate) && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => { setSelectedFilterName(''); setSelectedFilterDate(''); }}
                          className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-center font-bold transition-colors"
                        >
                          {t('import.clearFilters', 'مسح الفلاتر')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  renderFilterOptions(filterView)
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Squares2X2Icon className="w-4 h-4" />
            {t('agent.grid', 'Grid')}
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ListBulletIcon className="w-4 h-4" />
            {t('agent.list', 'List')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loadingPassengers ? (
        <div className="py-20 text-center text-sm text-slate-500">{t('common.loading', 'Loading...')}</div>
      ) : agentGroups.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">{t('agent.noneFound', 'No agents found.')}</div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="mb-8">
              {/* Manual Masonry Implementation */}
              {(() => {
                const colXl = [[], [], [], []];
                const colLg = [[], [], []];
                const colMd = [[], []];
                
                paginatedAgents.forEach((agent, i) => {
                  colXl[i % 4].push(agent);
                  colLg[i % 3].push(agent);
                  colMd[i % 2].push(agent);
                });

                const renderCard = (agentGroup, idx) => {
                  const diffEgp = agentGroup.debitEgp - agentGroup.creditEgp;
                  const statusEgp = getSummaryStatus(agentGroup.debitEgp, agentGroup.creditEgp);
                  
                  const diffUsd = agentGroup.debitUsd - agentGroup.creditUsd;
                  const statusUsd = getSummaryStatus(agentGroup.debitUsd, agentGroup.creditUsd);

                  const hasEgp = agentGroup.debitEgp > 0 || agentGroup.creditEgp > 0;
                  const hasUsd = agentGroup.debitUsd > 0 || agentGroup.creditUsd > 0;
                  
                  return (
                    <div key={agentGroup.id || idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 truncate mb-1" title={agentGroup.agentName}>
                        {agentGroup.agentName}
                        {agentGroup.isDeleted && (
                          <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            {t('common.deleted', 'Deleted')}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500">{agentGroup.passengerCount} {t('dashboard.kpi.totalPassengers', 'Passengers')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('agent.debit', 'Debit')}</p>
                        {hasEgp && <p className="text-sm font-bold text-slate-800">{agentGroup.debitEgp.toLocaleString()} EGP</p>}
                        {hasUsd && <p className="text-sm font-bold text-slate-800">{agentGroup.debitUsd.toLocaleString()} USD</p>}
                        {!hasEgp && !hasUsd && <p className="text-sm font-bold text-slate-800">0 EGP</p>}
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('agent.credit', 'Credit')}</p>
                        {hasEgp && <p className="text-sm font-bold text-slate-800">{agentGroup.creditEgp.toLocaleString()} EGP</p>}
                        {hasUsd && <p className="text-sm font-bold text-slate-800">{agentGroup.creditUsd.toLocaleString()} USD</p>}
                        {!hasEgp && !hasUsd && <p className="text-sm font-bold text-slate-800">0 EGP</p>}
                      </div>
                    </div>
                    
                    <div className="mt-auto mb-6 flex flex-col gap-2">
                      {hasEgp && (
                        <div className={`rounded-xl p-3 text-center border ${statusEgp.bg} ${statusEgp.border}`}>
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${statusEgp.color}`}>Summary (EGP)</p>
                          <p className={`text-lg font-bold ${statusEgp.color}`}>{Math.abs(diffEgp).toLocaleString()} EGP</p>
                          <p className={`text-[10px] mt-1 ${statusEgp.color} opacity-80`}>{statusEgp.text}</p>
                        </div>
                      )}
                      {hasUsd && (
                        <div className={`rounded-xl p-3 text-center border ${statusUsd.bg} ${statusUsd.border}`}>
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${statusUsd.color}`}>Summary (USD)</p>
                          <p className={`text-lg font-bold ${statusUsd.color}`}>{Math.abs(diffUsd).toLocaleString()} USD</p>
                          <p className={`text-[10px] mt-1 ${statusUsd.color} opacity-80`}>{statusUsd.text}</p>
                        </div>
                      )}
                      {!hasEgp && !hasUsd && (
                        <div className={`rounded-xl p-3 text-center border bg-slate-50 border-slate-200`}>
                          <p className={`text-lg font-bold text-slate-600`}>0 EGP</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => handleViewDetails(agentGroup)}
                        className="w-full py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-md"
                      >
                        {t('agent.viewDetails', 'View Details')}
                      </button>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => handleOpenHistory(agentGroup)}
                        className={`${agentGroup.isDeleted ? 'w-full' : 'w-1/2'} py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition-colors shadow-sm`}
                      >
                        {t('agent.paymentHistory', 'History')}
                      </button>
                      {!agentGroup.isDeleted && (
                        <button 
                          onClick={() => handleOpenPayment(agentGroup)}
                          className="w-1/2 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold text-xs hover:bg-emerald-200 transition-colors shadow-sm"
                        >
                          {t('agent.addPayment', 'Payment')}
                        </button>
                      )}
                    </div>

                    {agentGroup.id && canEdit && !agentGroup.isDeleted && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditAgent(agentGroup)}
                          className="w-1/2 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors shadow-sm"
                        >
                          {t('common.edit', 'Edit')}
                        </button>
                        <button 
                          onClick={() => handleDeleteAgent(agentGroup)}
                          className="w-1/2 py-1.5 rounded-lg bg-red-50 text-red-700 font-semibold text-xs hover:bg-red-100 transition-colors shadow-sm"
                        >
                          {t('common.delete', 'Delete')}
                        </button>
                      </div>
                    )}
                  </div>
                  );
                };

                const Col = ({ items }) => (
                  <div className="flex flex-col gap-6 w-full">
                    {items.map((ag, i) => renderCard(ag, i))}
                  </div>
                );

                return (
                  <>
                    {/* Mobile: 1 Column */}
                    <div className="grid grid-cols-1 gap-6 md:hidden">
                      <Col items={paginatedAgents} />
                    </div>
                    {/* Tablet: 2 Columns */}
                    <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 items-start">
                      <Col items={colMd[0]} />
                      <Col items={colMd[1]} />
                    </div>
                    {/* Desktop: 3 Columns */}
                    <div className="hidden lg:grid xl:hidden grid-cols-3 gap-6 items-start">
                      <Col items={colLg[0]} />
                      <Col items={colLg[1]} />
                      <Col items={colLg[2]} />
                    </div>
                    {/* Large Desktop: 4 Columns */}
                    <div className="hidden xl:grid grid-cols-4 gap-6 items-start">
                      <Col items={colXl[0]} />
                      <Col items={colXl[1]} />
                      <Col items={colXl[2]} />
                      <Col items={colXl[3]} />
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">{t('agent.col.name', 'Agent')}</th>
                      <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">{t('agent.debit', 'Debit')}</th>
                      <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">{t('agent.credit', 'Credit')}</th>
                      <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">{t('agent.summary', 'Summary')}</th>
                      <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">{t('dashboard.kpi.totalPassengers', 'Passengers')}</th>
                      <th className="px-6 py-4 text-end text-sm font-semibold text-slate-900">{t('import.col.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {paginatedAgents.map((agentGroup, idx) => {
                      const diffEgp = agentGroup.debitEgp - agentGroup.creditEgp;
                      const statusEgp = getSummaryStatus(agentGroup.debitEgp, agentGroup.creditEgp);
                      const diffUsd = agentGroup.debitUsd - agentGroup.creditUsd;
                      const statusUsd = getSummaryStatus(agentGroup.debitUsd, agentGroup.creditUsd);

                      const hasEgp = agentGroup.debitEgp > 0 || agentGroup.creditEgp > 0;
                      const hasUsd = agentGroup.debitUsd > 0 || agentGroup.creditUsd > 0;

                      return (
                        <tr key={idx} className={`hover:bg-slate-50 transition-colors ${agentGroup.isDeleted ? 'opacity-75' : ''}`}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900">
                            {agentGroup.agentName}
                            {agentGroup.isDeleted && (
                              <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                {t('common.deleted', 'Deleted')}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">
                            {hasEgp && <div>{agentGroup.debitEgp.toLocaleString()} EGP</div>}
                            {hasUsd && <div>{agentGroup.debitUsd.toLocaleString()} USD</div>}
                            {!hasEgp && !hasUsd && <div>0 EGP</div>}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">
                            {hasEgp && <div>{agentGroup.creditEgp.toLocaleString()} EGP</div>}
                            {hasUsd && <div>{agentGroup.creditUsd.toLocaleString()} USD</div>}
                            {!hasEgp && !hasUsd && <div>0 EGP</div>}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {hasEgp && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusEgp.bg} ${statusEgp.color} ${statusEgp.border} border w-max`}>
                                  {statusEgp.text}: {Math.abs(diffEgp).toLocaleString()} EGP
                                </span>
                              )}
                              {hasUsd && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusUsd.bg} ${statusUsd.color} ${statusUsd.border} border w-max`}>
                                  {statusUsd.text}: {Math.abs(diffUsd).toLocaleString()} USD
                                </span>
                              )}
                              {!hasEgp && !hasUsd && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border-slate-200 border w-max`}>
                                  0 EGP
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">{agentGroup.passengerCount}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-end text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleViewDetails(agentGroup)}
                                className="text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                {t('agent.viewDetails', 'View Details')}
                              </button>
                              <button 
                                onClick={() => handleOpenHistory(agentGroup)}
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                              >
                                {t('agent.paymentHistory', 'History')}
                              </button>
                              {!agentGroup.isDeleted && (
                                <button 
                                  onClick={() => handleOpenPayment(agentGroup)}
                                  className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                                >
                                  {t('agent.addPayment', 'Add Payment')}
                                </button>
                              )}
                              {agentGroup.id && canEdit && !agentGroup.isDeleted && (
                                <>
                                  <button 
                                    onClick={() => handleEditAgent(agentGroup)}
                                    className="text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                                  >
                                    {t('common.edit', 'Edit')}
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteAgent(agentGroup)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                                  >
                                    {t('common.delete', 'Delete')}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
        </>
      )}

      <AgentFormModal
        isOpen={isFormModalOpen}
        agent={editingAgent}
        onClose={async (refresh) => {
          setIsFormModalOpen(false);
          setEditingAgent(null);
          if (refresh) {
            setLoadingPassengers(true);
            try {
              const res = await getAgents({ size: 5000 });
              const agents = res.data?.data?.content || res.data?.content || res.content || [];
              setAllExplicitAgents(Array.isArray(agents) ? agents : []);
            } finally {
              setLoadingPassengers(false);
            }
          }
        }}
      />

      <AgentPassengersModal
        isOpen={isPassengersModalOpen}
        agent={viewingAgent ? (agentGroups.find(g => g.agentName === viewingAgent.agentName) || viewingAgent) : null}
        onDataChanged={async () => {
          await fetchAllPassengers();
        }}
        onClose={() => {
          setIsPassengersModalOpen(false);
          setViewingAgent(null);
        }}
      />

      <AgentPaymentModal
        isOpen={isPaymentModalOpen}
        agentGroup={paymentAgentGroup}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentAgentGroup(null);
        }}
        onPaymentApplied={handlePaymentApplied}
      />

      <AgentPaymentHistoryModal
        isOpen={isHistoryModalOpen}
        agentGroup={historyAgentGroup}
        payments={allAgentPayments}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryAgentGroup(null);
        }}
        onPaymentsChanged={handlePaymentApplied}
      />
    </div>
  );
};

export default AgentDataPage;
