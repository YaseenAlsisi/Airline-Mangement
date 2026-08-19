import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const LatestBatchesTable = ({ batches }) => {
  const { t } = useTranslation();

  if (!batches || batches.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">{t('dashboard.tables.latestManifestFiles', 'Latest Manifest Files')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">{t('dashboard.tables.fileName', 'File Name')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.status', 'Status')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.totalRows', 'Rows')}</th>
              <th className="px-5 py-3">{t('dashboard.tables.validRows', 'Valid')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batches.map((batch, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-900 truncate max-w-[150px]">{batch.fileName}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${batch.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {batch.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">{batch.totalRows}</td>
                <td className="px-5 py-3 text-emerald-600 font-semibold">{batch.validRows}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DataHealthPanel = ({ issues }) => {
  const { t } = useTranslation();

  if (!issues || issues.length === 0) return (
    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 h-full flex flex-col items-center justify-center">
      <CheckCircleIcon className="w-10 h-10 text-emerald-500 mb-2" />
      <h3 className="text-sm font-bold text-emerald-800">{t('dashboard.empty.noIssues', 'No Data Issues Found')}</h3>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-amber-50">
        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
        <h3 className="text-sm font-bold text-amber-800">{t('dashboard.tables.dataIssues', 'Data Issues Summary')}</h3>
      </div>
      <div className="p-5 flex-1 overflow-y-auto">
        <ul className="space-y-4">
          {issues.map((issue, idx) => (
            <li key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {issue.severity === 'ERROR' ? (
                  <XCircleIcon className="w-4 h-4 text-rose-500" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm text-slate-700 font-medium">{issue.issueType}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${issue.severity === 'ERROR' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                {issue.count} {t('dashboard.tables.count', 'Rows')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
