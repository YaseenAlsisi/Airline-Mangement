import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { previewManifestImport, publishManifestImport, getBatchPreview, deleteManifestRowsBulk, calculateManifestPrices, exportManifestBatch } from '../../api/manifestImport.api';
import { DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon, CheckIcon, FunnelIcon, ArrowUpTrayIcon, TrashIcon, ChevronLeftIcon, TagIcon, BuildingOfficeIcon, CalendarDaysIcon, PaperAirplaneIcon, MapPinIcon, MapIcon, ClockIcon, BriefcaseIcon, MagnifyingGlassIcon, CalculatorIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ManifestEditableGrid } from './components/ManifestEditableGrid';
import { ManifestEditableTable } from './components/ManifestEditableTable';
import { PlaneLoader } from './components/PlaneLoader';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { Pagination } from '../../components/ui/Pagination';

export const ImportDataPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [batch, setBatch] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    passengerCategory: '',
    agentNameRaw: '',
    departureDate: '',
    flightNumber: '',
    destination: '',
    departurePort: '',
    arrivalTime: '',
    serviceType: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterView, setFilterView] = useState('main');
  const filterRef = useRef(null);
  
  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBatch = async (id) => {
      setUploading(true);
      try {
        const res = await getBatchPreview(id);
        const batchData = res.data || res;
        setBatch(batchData);
        setRows(batchData.rows || []);
        sessionStorage.setItem('activeManifestBatchId', id);
      } catch (e) {
        console.error("Failed to load batch", e);
        sessionStorage.removeItem('activeManifestBatchId');
      } finally {
        setUploading(false);
      }
    };

    const urlBatchId = searchParams.get('batchId');
    const sessionBatchId = sessionStorage.getItem('activeManifestBatchId');
    
    if (urlBatchId) {
      loadBatch(urlBatchId);
    } else if (sessionBatchId) {
      loadBatch(sessionBatchId);
    }
  }, [searchParams.get('batchId')]);

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
      setFile(selectedFile);
      setError(null);
      setBatch(null);
      setRows([]);
      setCurrentPage(1);
    } else {
      setFile(null);
      setError(t('import.error.invalidFile', "Please select a valid Excel file (.xlsx or .xls)"));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setBatch(null);

    try {
      const res = await previewManifestImport(file);
      const batchData = res.data || res;
      setBatch(batchData);
      setRows(batchData.rows || []);
      setCurrentPage(1);
      if (batchData.id) {
        sessionStorage.setItem('activeManifestBatchId', batchData.id);
      }
      setToast(t('import.uploadSuccess', 'تم رفع البيانات بنجاح / Data imported successfully'));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      let errorObj = err.response?.data?.error;
      let apiMsg = err.response?.data?.message || err.response?.data?.detail;
      if (errorObj && typeof errorObj === 'object') {
        apiMsg = errorObj.message || apiMsg;
      } else if (typeof errorObj === 'string') {
        apiMsg = errorObj || apiMsg;
      }
      
      let finalError = apiMsg || err.message || t('import.error.uploadFailed', 'An unexpected error occurred');
      if (typeof finalError !== 'string') {
        finalError = JSON.stringify(finalError);
      }
      setError(finalError);
    } finally {
      setUploading(false);
    }
  };

  const handleRowUpdated = (updatedRow) => {
    setRows(rows.map(r => r.id === updatedRow.id ? updatedRow : r));
    // Recalculate valid/invalid rows
    let validCount = 0;
    let invalidCount = 0;
    const newRows = rows.map(r => r.id === updatedRow.id ? updatedRow : r);
    newRows.forEach(r => {
      if (r.validationStatus === 'VALID') validCount++;
      else invalidCount++;
    });
    setBatch(prev => ({ ...prev, validRows: validCount, invalidRows: invalidCount }));
  };

  const handleRowDeleted = (deletedRowId) => {
    const newRows = rows.filter(r => r.id !== deletedRowId);
    setRows(newRows);
    
    // Recalculate valid/invalid rows
    let validCount = 0;
    let invalidCount = 0;
    newRows.forEach(r => {
      if (r.validationStatus === 'VALID') validCount++;
      else invalidCount++;
    });
    setBatch(prev => ({ 
      ...prev, 
      totalRows: newRows.length,
      validRows: validCount, 
      invalidRows: invalidCount 
    }));
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    if (!window.confirm(t('import.bulkDeleteConfirm', `Are you sure you want to delete ${selectedRows.size} selected row(s)?`))) {
      return;
    }
    
    try {
      const rowIds = Array.from(selectedRows);
      await deleteManifestRowsBulk(batch.id, rowIds);
      
      const newRows = rows.filter(r => !selectedRows.has(r.id));
      setRows(newRows);
      setSelectedRows(new Set());
      
      let validCount = 0;
      let invalidCount = 0;
      newRows.forEach(r => {
        if (r.validationStatus === 'VALID') validCount++;
        else invalidCount++;
      });
      setBatch(prev => ({ 
        ...prev, 
        totalRows: newRows.length,
        validRows: validCount, 
        invalidRows: invalidCount 
      }));
      setToast(t('import.bulkDeleteSuccess', 'تم حذف الصفوف المحددة بنجاح'));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      alert(t('import.bulkDeleteError', 'Failed to delete selected rows'));
    }
  };

  const handlePublish = async () => {
    if (!batch) return;
    setPublishing(true);
    setError(null);
    try {
      const res = await publishManifestImport(batch.id);
      const batchData = res.data || res;
      setBatch(batchData);
      sessionStorage.removeItem('activeManifestBatchId');
      
      setToast(t('import.publishSuccess', 'تم نشر البيانات بنجاح / Successfully published!'));
      
      setTimeout(() => {
        setToast(null);
        resetState();
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      let errorObj = err.response?.data?.error;
      let apiMsg = err.response?.data?.message || err.response?.data?.detail;
      if (errorObj && typeof errorObj === 'object') {
        apiMsg = errorObj.message || apiMsg;
      } else if (typeof errorObj === 'string') {
        apiMsg = errorObj || apiMsg;
      }
      
      let finalError = apiMsg || err.message || t('import.error.publishFailed', 'An unexpected error occurred during publish');
      if (typeof finalError !== 'string') {
        finalError = JSON.stringify(finalError);
      }
      setError(finalError);
    } finally {
      setPublishing(false);
    }
  };

  const handleCalculate = async () => {
    if (!batch) return;
    setCalculating(true);
    setError(null);
    try {
      const res = await calculateManifestPrices(batch.id);
      const batchData = res.data || res;
      setBatch(batchData);
      setRows(batchData.rows || []);
      setToast(t('import.calculateSuccess', 'تم حساب الأسعار بنجاح / Prices calculated successfully!'));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t('import.error.calculateFailed', 'حدث خطأ أثناء حساب الأسعار'));
    } finally {
      setCalculating(false);
    }
  };

  const handleExport = async () => {
    if (!batch) return;
    setExporting(true);
    try {
      const blob = await exportManifestBatch(batch.id);
      const url = window.URL.createObjectURL(new Blob([blob.data || blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `manifest_export_${batch.originalFilename || 'data'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setToast(t('import.exportSuccess', 'تم تصدير البيانات بنجاح / Exported successfully!'));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setError(t('import.error.exportFailed', 'حدث خطأ أثناء التصدير'));
    } finally {
      setExporting(false);
    }
  };

  const resetState = () => {
    setBatch(null);
    setRows([]);
    setCurrentPage(1);
    setFile(null);
    setError(null);
    setSelectedRows(new Set());
    setSearchTerm('');
    sessionStorage.removeItem('activeManifestBatchId');
    if (searchParams.has('batchId')) {
      searchParams.delete('batchId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const filteredRows = rows.filter(row => {
    if (searchTerm && row.passengerName && !row.passengerName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filters.passengerCategory && row.passengerCategory !== filters.passengerCategory) return false;
    if (filters.agentNameRaw && row.agentNameRaw !== filters.agentNameRaw) return false;
    if (filters.departureDate && row.departureDate !== filters.departureDate) return false;
    if (filters.flightNumber && row.flightNumber !== filters.flightNumber) return false;
    if (filters.destination && row.destination !== filters.destination) return false;
    if (filters.departurePort && row.departurePort !== filters.departurePort) return false;
    if (filters.arrivalTime && row.arrivalTime !== filters.arrivalTime) return false;
    if (filters.serviceType && row.serviceType !== filters.serviceType) return false;
    return true;
  });

  const handleClear = () => {
    if (window.confirm(t('import.confirmClear', 'Are you sure you want to discard this entire file and start over?'))) {
      resetState();
    }
  };

  const totalRegularPrice = rows.reduce((sum, row) => sum + (Number(row.regularPrice) || 0), 0);
  const totalCommission = rows.reduce((sum, row) => sum + (Number(row.commission) || 0), 0);
  const totalOverallPrice = rows.reduce((sum, row) => sum + (Number(row.totalPrice) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {t('import.title', 'Import Passenger Manifest')}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t('import.subtitle', 'Upload a daily Excel manifest. Preview data, correct any errors, and publish directly to Agent Data.')}
          </p>
        </div>
      </div>

      {!batch || batch.status === 'DRAFT' ? (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div
              className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 ${
                dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-900/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>{t('import.uploadFile', 'Upload a file')}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" />
                  </label>
                  <p className="pl-1">{t('import.dragAndDrop', 'or drag and drop')}</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">.xlsx {t('import.fileLimit', 'up to 10MB')}</p>
              </div>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{t('import.selectedFile', 'Selected file:')}</span> {file.name}
                </div>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400"
                >
                  {uploading ? t('import.processing', 'Processing...') : t('import.startImport', 'Start Import')}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{t('import.errorTitle', 'Error')}</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {batch && (
        <div className="bg-transparent mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                {t('import.previewTitle', 'Manifest Preview')}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                {batch.status === 'PUBLISHED' 
                  ? t('import.statusPublished', 'This batch has been successfully published.') 
                  : t('import.statusDraft', 'Review rows and fix errors before publishing.')}
              </p>
            </div>
            {batch.status === 'DRAFT' && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                >
                  {t('import.clearAll', 'الغاء الجدول بالكامل')}
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing || batch.invalidRows > 0}
                  className="inline-flex items-center rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 hover:bg-blue-600 disabled:bg-blue-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                  title={batch.invalidRows > 0 ? t('import.fixErrorsFirst', 'Please fix invalid rows first') : ''}
                >
                  {publishing ? t('import.publishing', 'Publishing...') : t('import.publishData', 'Publish Data')}
                </button>
              </div>
            )}
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow border">
                <dt className="truncate text-sm font-medium text-gray-500">{t('import.stat.totalRows', 'Total Rows')}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{batch.totalRows}</dd>
              </div>
              <div className="overflow-hidden rounded-lg bg-green-50 px-4 py-5 shadow border border-green-200">
                <dt className="truncate text-sm font-medium text-green-800 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  {t('import.stat.validRows', 'Valid Rows')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-900">{batch.validRows}</dd>
              </div>
              <div className={`overflow-hidden rounded-lg px-4 py-5 shadow border ${batch.invalidRows > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                <dt className={`truncate text-sm font-medium flex items-center gap-2 ${batch.invalidRows > 0 ? 'text-red-800' : 'text-gray-500'}`}>
                  {batch.invalidRows > 0 && <ExclamationTriangleIcon className="w-5 h-5" />}
                  {t('import.stat.invalidRows', 'Invalid Rows')}
                </dt>
                <dd className={`mt-1 text-3xl font-semibold tracking-tight ${batch.invalidRows > 0 ? 'text-red-900' : 'text-gray-900'}`}>
                  {batch.invalidRows}
                </dd>
              </div>
            </dl>

            {/* Financial Stats */}
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
              <div className="overflow-hidden rounded-lg bg-blue-50 px-4 py-5 shadow border border-blue-200">
                <dt className="truncate text-sm font-medium text-blue-800 flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5" />
                  {t('import.stat.totalRegular', 'إجمالي السعر (بدون عمولة)')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-900">
                  {totalRegularPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </dd>
              </div>
              <div className="overflow-hidden rounded-lg bg-purple-50 px-4 py-5 shadow border border-purple-200">
                <dt className="truncate text-sm font-medium text-purple-800 flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5" />
                  {t('import.stat.totalCommission', 'إجمالي العمولة')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-purple-900">
                  {totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </dd>
              </div>
              <div className="overflow-hidden rounded-lg bg-indigo-50 px-4 py-5 shadow border border-indigo-200">
                <dt className="truncate text-sm font-medium text-indigo-800 flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5" />
                  {t('import.stat.totalOverall', 'الإجمالي العام (بالعمولة)')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-900">
                  {totalOverallPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </dd>
              </div>
            </dl>

            {batch.status === 'DRAFT' && rows.length > 0 && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  {/* Left Controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-500">{t('import.showing', 'Showing')}</span>
                      <select 
                        className="bg-indigo-50 border-none text-indigo-700 text-sm rounded-lg focus:ring-indigo-500 block p-2 cursor-pointer font-semibold outline-none"
                        style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234338ca' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: '2.5rem', appearance: 'none', WebkitAppearance: 'none'}}
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        placeholder={t('import.searchPassenger', 'بحث باسم المسافر...')}
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="block w-full sm:w-64 rounded-lg border-0 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all bg-white"
                      />
                    </div>

                    {selectedRows.size > 0 && (
                      <button 
                        onClick={handleBulkDelete}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 text-red-600 px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                        {t('import.deleteSelected', 'حذف المحدد')} ({selectedRows.size})
                      </button>
                    )}

                    <div className="relative inline-block text-left" ref={filterRef}>
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <FunnelIcon className="h-4 w-4 text-slate-500" />
                        {t('import.filter', 'Filter')}
                        {Object.values(filters).some(Boolean) && (
                          <span className="flex h-2 w-2 rounded-full bg-indigo-600 absolute top-1.5 right-1.5"></span>
                        )}
                      </button>

                      {isFilterOpen && (
                        <div className="absolute left-0 z-50 mt-2 w-80 origin-top-left rounded-xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none p-3 transition-all overflow-hidden">
                          
                          {filterView === 'main' && (
                            <div>
                              <h3 className="text-xs font-bold text-slate-800 mb-2">{t('import.addFilter', 'Add Filter')}</h3>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { key: 'passengerCategory', label: 'Category', icon: TagIcon },
                                  { key: 'agentNameRaw', label: 'Agent', icon: BuildingOfficeIcon },
                                  { key: 'departureDate', label: 'Dep. Date', icon: CalendarDaysIcon },
                                  { key: 'flightNumber', label: 'Flight', icon: PaperAirplaneIcon },
                                  { key: 'destination', label: 'Destination', icon: MapPinIcon },
                                  { key: 'departurePort', label: 'Dep. Port', icon: MapIcon },
                                  { key: 'arrivalTime', label: 'Arrival Time', icon: ClockIcon },
                                  { key: 'serviceType', label: 'Service Type', icon: BriefcaseIcon }
                                ].map((item) => (
                                  <button 
                                    key={item.key}
                                    onClick={() => setFilterView(item.key)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${filters[item.key] ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                                  >
                                    <item.icon className={`w-5 h-5 mb-1 ${filters[item.key] ? 'text-indigo-600' : 'text-slate-500'}`} />
                                    <span className={`text-[11px] font-semibold ${filters[item.key] ? 'text-indigo-700' : 'text-slate-600'}`}>
                                      {t(`import.col.${item.key}`, item.label)}
                                    </span>
                                  </button>
                                ))}
                              </div>
                              {Object.values(filters).some(Boolean) && (
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                  <button
                                    onClick={() => {
                                      setFilters({
                                        passengerCategory: '', agentNameRaw: '', departureDate: '', flightNumber: '', destination: '', departurePort: '', arrivalTime: '', serviceType: ''
                                      });
                                    }}
                                    className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-center font-bold transition-colors"
                                  >
                                    {t('import.clearFilters', 'مسح الفلاتر')}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {filterView !== 'main' && (
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setFilterView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeftIcon className="w-5 h-5"/></button>
                                <h3 className="text-sm font-bold text-slate-800">{t(`import.col.${filterView}`, filterView)}</h3>
                              </div>
                              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                <button 
                                  onClick={() => { setFilters({...filters, [filterView]: ''}); setFilterView('main'); }}
                                  className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium ${!filters[filterView] ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                                >
                                  {t('import.all', 'الكل (All)')}
                                </button>
                                {[...new Set(rows.map(r => r[filterView]?.trim()).filter(Boolean))].sort().map(val => (
                                  <button 
                                    key={val}
                                    onClick={() => { setFilters({...filters, [filterView]: val}); setFilterView('main'); }}
                                    className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium ${filters[filterView] === val ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    <button 
                      type="button" 
                      onClick={handleExport}
                      disabled={exporting}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 text-slate-500" />
                      {exporting ? t('import.exporting', 'جاري التصدير...') : t('import.export', 'Export')}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCalculate}
                      disabled={calculating}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CalculatorIcon className="h-4 w-4 text-emerald-600" />
                      {calculating ? t('import.calculating', 'جاري الحساب...') : t('import.calculate', 'Calculate')}
                    </button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                    <button 
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <ListBulletIcon className="w-4 h-4" />
                      {t('import.viewList', 'جدول')}
                    </button>
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                      {t('import.viewGrid', 'مربعات')}
                    </button>
                  </div>
                </div>
                {viewMode === 'grid' ? (
                  <ManifestEditableGrid 
                    batchId={batch.id} 
                    rows={filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)} 
                    onRowUpdated={handleRowUpdated} 
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                  />
                ) : (
                  <ManifestEditableTable 
                    batchId={batch.id} 
                    rows={filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)} 
                    onRowUpdated={handleRowUpdated} 
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                  />
                )}
                
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={Math.ceil(filteredRows.length / rowsPerPage)} 
                  onPageChange={setCurrentPage} 
                />
              </>
            )}
            {batch.status === 'PUBLISHED' && (
               <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-600 flex flex-col items-center justify-center gap-4 border border-gray-200 mt-6">
                 <p className="text-lg font-medium">{t('import.viewInAgents', 'Data is now live. View passenger manifests in the Agent Data page.')}</p>
                 <button 
                   onClick={resetState}
                   className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
                 >
                   {t('import.uploadAnother', 'رفع ملف آخر (Upload Another File)')}
                 </button>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Render Loader Overlay */}
      {uploading && <PlaneLoader text={t('import.processingLoader', 'جاري معالجة البيانات...')} onCancel={() => setUploading(false)} />}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-lg border-l-4 border-green-500 text-slate-800 font-medium">
            <div className="bg-green-100 p-1.5 rounded-full">
              <CheckIcon className="w-5 h-5 text-green-600" />
            </div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportDataPage;