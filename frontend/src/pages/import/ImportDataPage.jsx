import React, { useState, useRef } from 'react';
import { previewManifestImport, publishManifestImport } from '../../api/manifestImport.api';
import { DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ManifestEditableGrid } from './components/ManifestEditableGrid';

export const ImportDataPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [batch, setBatch] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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
      setBatch(res);
      setRows(res.rows || []);
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

  const handlePublish = async () => {
    if (!batch) return;
    setPublishing(true);
    setError(null);
    try {
      const res = await publishManifestImport(batch.id);
      setBatch(res);
      alert(t('import.publishSuccess', 'Successfully published manifest data!'));
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

  const handleClear = () => {
    if (window.confirm(t('import.confirmClear', 'Are you sure you want to discard this entire file and start over?'))) {
      setBatch(null);
      setRows([]);
      setFile(null);
      setError(null);
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
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {t('import.previewTitle', 'Manifest Preview')}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
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
                  className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                >
                  {t('import.clearAll', 'الغاء الجدول بالكامل')}
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing || batch.invalidRows > 0}
                  className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
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
              <ManifestEditableGrid batchId={batch.id} rows={rows} onRowUpdated={handleRowUpdated} />
            )}
            {batch.status === 'PUBLISHED' && (
               <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-600">
                 {t('import.viewInAgents', 'Data is now live. View passenger manifests in the Agent Data page.')}
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportDataPage;