import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getBatches } from '../../api/manifestImport.api';
import { DocumentTextIcon, PencilSquareIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const ManifestFilesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await getBatches({ size: 50, sort: 'createdAt,desc' });
      // Depending on axios response interceptor, data might be unwrapped
      const data = res.data || res;
      setBatches(data.content || []);
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
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    {t('common.loading', 'Loading...')}
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    {t('files.noFiles', 'No files found.')}
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
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
      </div>
    </div>
  );
};

export default ManifestFilesPage;
