import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getBatches, deleteManifestBatches } from '../../api/manifestImport.api';
import { DocumentTextIcon, PencilSquareIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { PlaneLoader } from './components/PlaneLoader';
import { Pagination } from '../../components/ui/Pagination';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const ManifestFilesPage = () => {
  useDocumentTitle('Files History');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await getBatches({ size: 1000, sort: 'createdAt,desc' }); // increased size for client pagination
      const data = res.data || res;
      setBatches(data.content || []);
      setSelectedBatchIds([]); // reset selection on fetch
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError(t('files.errorLoad', 'Failed to load files history'));
    } finally {
      setLoading(false);
    }
  };

  const handleContinueEditing = (batchId) => {
    navigate(`/import?batchId=${batchId}`);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBatchIds(batches.map(b => b.id));
    } else {
      setSelectedBatchIds([]);
    }
  };

  const handleSelectRow = (batchId) => {
    setSelectedBatchIds(prev => 
      prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedBatchIds.length === 0) return;
    if (window.confirm(t('files.confirmBulkDelete', `Are you sure you want to delete ${selectedBatchIds.length} file(s)?`))) {
      setDeleting(true);
      try {
        await deleteManifestBatches(selectedBatchIds);
        await fetchBatches();
        
        // Show Toast
        setToast(t('files.deleteSuccess', 'تم مسح الملفات بنجاح / Files deleted successfully'));
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        console.error(err);
        setError(t('files.errorDelete', 'Failed to delete the selected files'));
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {t('files.title', 'Excel Files History')}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t('files.subtitle', 'View previously uploaded manifest files, check their status, or continue editing drafts.')}
          </p>
        </div>
        
        {/* Bulk Actions Top Bar */}
        {selectedBatchIds.length > 0 && (
          <div className="mt-4 flex md:ml-4 md:mt-0 items-center gap-4 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            <span className="text-sm font-medium text-red-800">
              {selectedBatchIds.length} {t('files.selected', 'Selected')}
            </span>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              {t('files.deleteAll', 'Delete Selected')}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={batches.length > 0 && selectedBatchIds.length === batches.length}
                  />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('files.col.fileName', 'File Name')}
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('files.col.date', 'Date Uploaded')}
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('files.col.status', 'Status')}
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('files.col.totalRows', 'Total Rows')}
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('files.col.stats', 'Valid / Invalid')}
                </th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    {t('common.loading', 'Loading...')}
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    {t('files.noFiles', 'No files found.')}
                  </td>
                </tr>
              ) : (
                batches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((batch) => (
                  <tr key={batch.id} className={`transition-colors ${selectedBatchIds.includes(batch.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                        checked={selectedBatchIds.includes(batch.id)}
                        onChange={() => handleSelectRow(batch.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-6 h-6 text-indigo-500" />
                        <span className="text-sm font-medium text-slate-900">{batch.originalFilename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(batch.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {batch.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          <CheckCircleIcon className="w-4 h-4" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                      {batch.totalRows}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                          <CheckCircleIcon className="w-4 h-4" /> {batch.validRows}
                        </span>
                        <span className={`flex items-center gap-1 text-sm font-medium ${batch.invalidRows > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          <ExclamationTriangleIcon className="w-4 h-4" /> {batch.invalidRows}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {batch.status === 'DRAFT' && (
                        <button
                          onClick={() => handleContinueEditing(batch.id)}
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                          {t('files.continueEditing', 'Continue Editing')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {batches.length > itemsPerPage && (
          <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
            <Pagination 
              currentPage={currentPage} 
              totalPages={Math.ceil(batches.length / itemsPerPage)} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {deleting && <PlaneLoader text={t('files.deletingLoader', 'جاري المسح...')} />}

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

export default ManifestFilesPage;
