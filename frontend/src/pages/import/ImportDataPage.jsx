import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { previewManifestImport, publishManifestImport, getBatchPreview, deleteManifestRowsBulk } from '../../api/manifestImport.api';
import { DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon, CheckIcon, FunnelIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
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
  const [batch, setBatch] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState(new Set());
  
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
      }, 4000);
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

  const resetState = () => {
    setBatch(null);
    setRows([]);
    setCurrentPage(1);
    setFile(null);
    setError(null);
    setSelectedRows(new Set());
    sessionStorage.removeItem('activeManifestBatchId');
    if (searchParams.has('batchId')) {
      searchParams.delete('batchId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleClear = () => {
    if (window.confirm(t('import.confirmClear', 'Are you sure you want to discard this entire file and start over?'))) {
      resetState();
    }
  };

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
                  {publishing ? t('import.publishing', 'Publishing...') : t('import.publishData', 'Publish Data to Agents')}
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

                    {selectedRows.size > 0 && (
                      <button 
                        onClick={handleBulkDelete}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 text-red-600 px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                        {t('import.deleteSelected', 'حذف المحدد')} ({selectedRows.size})
                      </button>
                    )}

                    <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors">
                      <FunnelIcon className="h-4 w-4 text-slate-500" />
                      {t('import.filter', 'Filter')}
                    </button>
                    <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors">
                      <ArrowUpTrayIcon className="h-4 w-4 text-slate-500" />
                      {t('import.export', 'Export')}
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
                    rows={rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)} 
                    onRowUpdated={handleRowUpdated} 
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                  />
                ) : (
                  <ManifestEditableTable 
                    batchId={batch.id} 
                    rows={rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)} 
                    onRowUpdated={handleRowUpdated} 
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                  />
                )}
                
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={Math.ceil(rows.length / rowsPerPage)} 
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