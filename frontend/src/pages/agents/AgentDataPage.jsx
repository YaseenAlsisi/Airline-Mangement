import React, { useEffect, useState } from 'react';
import { getAgents } from '../../api/agents.api';
import { getAgentManifestSummary, getAgentManifestPassengers, getAllManifestPassengers, updatePublishedPassenger, resetManifestData, deletePublishedPassenger } from '../../api/manifestImport.api';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [allPassengers, setAllPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSavingInline, setIsSavingInline] = useState(false);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilterName, selectedFilterDate]);

  const displayedPassengers = allPassengers.filter(p => {
    if (selectedFilterName && p.agentNameRaw !== selectedFilterName) return false;
    if (selectedFilterDate && p.departureDate !== selectedFilterDate) return false;
    return true;
  });

  const totalPages = Math.ceil(displayedPassengers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPassengers = displayedPassengers.slice(startIndex, endIndex);

  const totalDebitUsd = displayedPassengers.reduce((sum, p) => sum + (p.debitUsd || 0), 0);
  const totalCreditUsd = displayedPassengers.reduce((sum, p) => sum + (p.creditUsd || 0), 0);
  const totalNetUsd = totalDebitUsd - totalCreditUsd;

  const totalDebitEgp = displayedPassengers.reduce((sum, p) => sum + (p.debitEgp || 0), 0);
  const totalCreditEgp = displayedPassengers.reduce((sum, p) => sum + (p.creditEgp || 0), 0);
  const totalNetEgp = totalDebitEgp - totalCreditEgp;

  const handleExportExcel = () => {
    Promise.all([
      import('exceljs'),
      import('file-saver')
    ]).then(([ExcelJS, FileSaver]) => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Agents Report', {
        views: [{ rightToLeft: true }]
      });

      // Columns
      worksheet.columns = [
        { header: 'م', key: 'index', width: 10 },
        { header: 'اسم الراكب', key: 'passengerName', width: 30 },
        { header: 'رقم الجواز', key: 'passportNumber', width: 20 },
        { header: 'النوع', key: 'passengerCategory', width: 15 },
        { header: 'الوكيل', key: 'agentNameRaw', width: 25 },
        { header: 'تاريخ المغادرة', key: 'departureDate', width: 15 },
        { header: 'رقم الرحلة', key: 'flightNumber', width: 15 },
        { header: 'الوجهة', key: 'destination', width: 15 },
        { header: 'جهة المغادرة', key: 'departurePort', width: 15 },
        { header: 'تاريخ الميلاد', key: 'birthDate', width: 15 },
        { header: 'ميعاد الوصول', key: 'arrivalTime', width: 15 },
        { header: 'نوع الخدمة', key: 'serviceType', width: 15 },
        { header: 'ملاحظة', key: 'note2', width: 25 },
        { header: 'مدين دولار', key: 'debitUsd', width: 15 },
        { header: 'دائن دولار', key: 'creditUsd', width: 15 },
        { header: 'مدين مصري', key: 'debitEgp', width: 15 },
        { header: 'دائن مصري', key: 'creditEgp', width: 15 },
        { header: 'تاريخ دائن مصري', key: 'creditEgpDate', width: 25 }
      ];

      // Add Data
      displayedPassengers.forEach((p, index) => {
        worksheet.addRow({
          index: index + 1,
          passengerName: p.passengerName || '-',
          passportNumber: p.passportNumber || '-',
          passengerCategory: p.passengerCategory || '-',
          agentNameRaw: p.agentNameRaw || '-',
          departureDate: p.departureDate || '-',
          flightNumber: p.flightNumber || '-',
          destination: p.destination || '-',
          departurePort: p.departurePort || '-',
          birthDate: p.birthDate || '-',
          arrivalTime: p.arrivalTime || '-',
          serviceType: p.serviceType || '-',
          note2: p.note2 || '-',
          debitUsd: p.debitUsd || 0,
          creditUsd: p.creditUsd || 0,
          debitEgp: p.debitEgp || 0,
          creditEgp: p.creditEgp || 0,
          creditEgpDate: p.creditEgpDate ? new Date(p.creditEgpDate).toLocaleString() : '-'
        });
      });

      // Add total row
      worksheet.addRow({
        index: 'الإجمالي',
        passengerName: '',
        passportNumber: '',
        passengerCategory: '',
        agentNameRaw: '',
        departureDate: '',
        flightNumber: '',
        destination: '',
        departurePort: '',
        birthDate: '',
        arrivalTime: '',
        serviceType: '',
        note2: '',
        debitUsd: totalDebitUsd,
        creditUsd: totalCreditUsd,
        debitEgp: totalDebitEgp,
        creditEgp: totalCreditEgp,
        creditEgpDate: ''
      });

      // Styling: font Cairo, center alignment for all
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Cairo', size: 14 };
        });
      });

      // Header row styling
      const headerRow = worksheet.getRow(1);
      headerRow.height = 30; // Make header row a bit taller
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDAEAFF' } // #daeaff
        };
        cell.font = {
          name: 'Cairo',
          size: 14,
          bold: true,
          color: { argb: 'FF304ACE' } // #304ace
        };
      });

      // Generate File
      workbook.xlsx.writeBuffer().then((buffer) => {
        const fileName = `Export_${selectedFilterName || 'All'}_${selectedFilterDate || 'All'}.xlsx`;
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(blob, fileName);
      });
    });
  };

  const handleResetData = async () => {
    if (window.confirm(t('agent.confirmReset', 'Are you sure you want to completely clear the data from the Agent page? This action cannot be undone.'))) {
      try {
        await resetManifestData();
        setAllPassengers([]);
      } catch (err) {
        console.error(err);
        alert('Failed to reset data');
      }
    }
  };

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
      window.location.reload(); // Simple refresh for now, or could re-fetch all passengers
    }
  };

  const handleEditPassenger = (passenger) => {
    if (!canEdit) return;
    setEditingRowId(passenger.id);
    setEditFormData({
      passengerName: passenger.passengerName || '',
      birthDate: passenger.birthDate || '',
      nationalId: passenger.nationalId || '',
      passportNumber: passenger.passportNumber || '',
      agentNameRaw: passenger.agentNameRaw || '',
      departureDate: passenger.departureDate || '',
      flightNumber: passenger.flightNumber || '',
      departurePort: passenger.departurePort || '',
      destination: passenger.destination || '',
      arrivalTime: passenger.arrivalTime || '',
      passengerCategory: passenger.passengerCategory || '',
      serviceType: passenger.serviceType || '',
      investmentSupplier: passenger.investmentSupplier || '',
      note2: passenger.note2 || '',
      note3: passenger.note3 || '',
      note4: passenger.note4 || '',
      debitUsd: passenger.debitUsd || 0,
      creditUsd: passenger.creditUsd || 0,
      debitEgp: passenger.debitEgp || 0,
      creditEgp: passenger.creditEgp || 0,
    });
  };

  const handleInlineChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveInline = async () => {
    setIsSavingInline(true);
    try {
      // Sanitize empty strings to null for dates/times to avoid backend parsing errors
      const sanitizedData = { ...editFormData };
      if (sanitizedData.birthDate === '') sanitizedData.birthDate = null;
      if (sanitizedData.departureDate === '') sanitizedData.departureDate = null;
      if (sanitizedData.arrivalTime === '') sanitizedData.arrivalTime = null;

      const res = await updatePublishedPassenger(editingRowId, sanitizedData);

      // Update local state without full reload
      setAllPassengers(prev => prev.map(p => {
        if (p.id === editingRowId) {
          // res is already the data payload due to the axios response interceptor in client.js
          return { ...p, ...res };
        }
        return p;
      }));
      setEditingRowId(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error?.message || err.message || 'Error updating passenger');
    } finally {
      setIsSavingInline(false);
    }
  };

  const handleCancelInline = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  const handleQuickNote = async (passenger) => {
    const currentNote = passenger.note2 || '';
    const newNote = window.prompt(t('common.note', 'Note') + ':', currentNote);
    if (newNote !== null && newNote !== currentNote) {
      try {
        const res = await updatePublishedPassenger(passenger.id, {
          ...passenger,
          note2: newNote
        });
        setAllPassengers(prev => prev.map(p => p.id === passenger.id ? { ...p, ...res } : p));
      } catch (err) {
        console.error(err);
        alert('Failed to update note');
      }
    }
  };

  const handleDeletePassenger = async (passenger) => {
    if (window.confirm(t('agent.confirmDeletePassenger', `Are you sure you want to delete passenger ${passenger.passengerName}?`))) {
      try {
        await deletePublishedPassenger(passenger.id);
        setAllPassengers(prev => prev.filter(p => p.id !== passenger.id));
      } catch (err) {
        console.error("Error deleting passenger", err);
        alert(t('common.error', 'An error occurred'));
      }
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

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              <div className="text-sm font-semibold tracking-wide text-indigo-300 mb-2 uppercase">{t('agent.totalPassengers', 'Total Passengers')}</div>
              <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{allPassengers.length}</div>
            </div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 min-w-[180px] shadow-2xl hover:bg-white/10 transition-colors duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <div className="text-sm font-semibold tracking-wide text-purple-300 mb-2 uppercase">{t('agent.uniqueAgents', 'Unique Agents')}</div>
              <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{new Set(allPassengers.map(p => p.agentNameRaw).filter(Boolean)).size}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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

            <button
              onClick={handleExportExcel}
              className="group flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 ring-1 ring-inset ring-emerald-500/30 hover:bg-emerald-100 transition-colors cursor-pointer ml-auto sm:ml-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-600">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v4.325L9.57 11.64a.75.75 0 00-1.14 1.02l3 3.5a.75.75 0 001.14 0l3-3.5a.75.75 0 10-1.14-1.02l-1.68 1.685V9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-emerald-700">{t('agent.exportExcel', 'Export Excel')}</span>
            </button>

            <button
              onClick={handleResetData}
              className="group flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 ring-1 ring-inset ring-red-500/30 hover:bg-red-100 transition-colors cursor-pointer ml-auto sm:ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-red-700">{t('agent.resetData', 'Reset Data')}</span>
            </button>

            <div className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-2 ring-1 ring-inset ring-green-500/20 shadow-sm transition-all duration-300 hover:shadow-md hover:from-green-100 hover:to-emerald-100">
              <span className="text-sm font-medium text-slate-600">{t('agent.netUsd', 'Net USD')}</span>
              <span className="text-lg font-bold text-green-700 tabular-nums tracking-tight">${totalNetUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-2 ring-1 ring-inset ring-orange-500/20 shadow-sm transition-all duration-300 hover:shadow-md hover:from-orange-100 hover:to-amber-100">
              <span className="text-sm font-medium text-slate-600">{t('agent.netEgp', 'Net EGP')}</span>
              <span className="text-lg font-bold text-orange-700 tabular-nums tracking-tight">{totalNetEgp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP</span>
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
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.departurePort', 'Dep. Port')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.birthDate', 'Birth Date')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.arrivalTime', 'Arrival Time')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.serviceType', 'Service Type')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.debitUsd', 'Debit USD')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.creditUsd', 'Credit USD')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('agent.netUsd', 'Net USD')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.debitEgp', 'Debit EGP')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.creditEgp', 'Credit EGP')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('import.col.creditEgpDate', 'Credit Date EGP')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('agent.netEgp', 'Net EGP')}</th>
                    <th className="px-3 py-3.5 text-start text-sm font-semibold text-gray-900">{t('common.note', 'Note')}</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loadingPassengers ? (
                    <tr><td colSpan={20} className="py-4 text-center text-sm text-gray-500">{t('common.loading', 'Loading...')}</td></tr>
                  ) : paginatedPassengers.length === 0 ? (
                    <tr><td colSpan={20} className="py-4 text-center text-sm text-gray-500">{t('agent.passengers.none', 'No passengers found.')}</td></tr>
                  ) : (
                    paginatedPassengers.map(p => {
                      const isEditing = editingRowId === p.id;
                      return (
                        <tr key={p.id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {isEditing ? <input type="text" name="passengerName" value={editFormData.passengerName} onChange={handleInlineChange} className="block w-full rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.passengerName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="text" name="passportNumber" value={editFormData.passportNumber} onChange={handleInlineChange} className="block w-24 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.passportNumber}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="text" name="passengerCategory" value={editFormData.passengerCategory} onChange={handleInlineChange} className="block w-20 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.passengerCategory}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="text" name="agentNameRaw" value={editFormData.agentNameRaw} onChange={handleInlineChange} className="block w-32 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.agentNameRaw}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="date" name="departureDate" value={editFormData.departureDate} onChange={handleInlineChange} className="block w-36 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.departureDate}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="text" name="flightNumber" value={editFormData.flightNumber} onChange={handleInlineChange} className="block w-20 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.flightNumber}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="text" name="destination" value={editFormData.destination} onChange={handleInlineChange} className="block w-20 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.destination}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="text" name="departurePort" value={editFormData.departurePort} onChange={handleInlineChange} className="block w-20 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.departurePort}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="date" name="birthDate" value={editFormData.birthDate} onChange={handleInlineChange} className="block w-36 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.birthDate}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="time" name="arrivalTime" step="1" value={editFormData.arrivalTime} onChange={handleInlineChange} className="block w-28 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.arrivalTime}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="text" name="serviceType" value={editFormData.serviceType} onChange={handleInlineChange} className="block w-20 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.serviceType}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="number" step="0.01" name="debitUsd" value={editFormData.debitUsd} onChange={handleInlineChange} className="block w-20 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.debitUsd}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="number" step="0.01" name="creditUsd" value={editFormData.creditUsd} onChange={handleInlineChange} className="block w-20 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.creditUsd}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">
                            {isEditing ? ((parseFloat(editFormData.debitUsd) || 0) - (parseFloat(editFormData.creditUsd) || 0)) : ((p.debitUsd || 0) - (p.creditUsd || 0))}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="number" step="0.01" name="debitEgp" value={editFormData.debitEgp} onChange={handleInlineChange} className="block w-24 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.debitEgp}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {isEditing ? <input type="number" step="0.01" name="creditEgp" value={editFormData.creditEgp} onChange={handleInlineChange} className="block w-24 rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" /> : p.creditEgp}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {p.creditEgpDate ? new Date(p.creditEgpDate).toLocaleString() : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">
                            {isEditing ? ((parseFloat(editFormData.debitEgp) || 0) - (parseFloat(editFormData.creditEgp) || 0)) : ((p.debitEgp || 0) - (p.creditEgp || 0))}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                            {isEditing ? (
                              <input type="text" name="note2" value={editFormData.note2} onChange={handleInlineChange} className="block w-full rounded-md border-0 py-1 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate" title={p.note2}>{p.note2 || '-'}</span>
                                {canEdit && (
                                  <button onClick={() => handleQuickNote(p)} className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 transition-colors">
                                    {t('common.note', 'Note')}
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {canEdit && (
                              isEditing ? (
                                <div className="flex gap-2 justify-end">
                                  <button onClick={handleSaveInline} disabled={isSavingInline} className="text-green-600 hover:text-green-900 disabled:opacity-50">
                                    {isSavingInline ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                                  </button>
                                  <button onClick={handleCancelInline} disabled={isSavingInline} className="text-gray-600 hover:text-gray-900">
                                    {t('common.cancel', 'Cancel')}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 justify-end">
                                  <button
                                    onClick={() => handleEditPassenger(p)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    {t('common.edit', 'Edit')}<span className="sr-only">, {p.passengerName}</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeletePassenger(p)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    {t('common.delete', 'Delete')}<span className="sr-only">, {p.passengerName}</span>
                                  </button>
                                </div>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {t('common.showing', 'Showing')} <span className="font-medium">{startIndex + 1}</span> {t('common.to', 'to')} <span className="font-medium">{Math.min(endIndex, displayedPassengers.length)}</span> {t('common.of', 'of')}{' '}
                        <span className="font-medium">{displayedPassengers.length}</span> {t('common.results', 'results')}
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">{t('common.previous', 'Previous')}</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                          {t('reports.page', 'Page')} {currentPage} {t('reports.of', 'of')} {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">{t('common.next', 'التالي')}</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
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