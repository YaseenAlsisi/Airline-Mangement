import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateManifestRow } from '../../../api/manifestImport.api';
import { 
  PencilSquareIcon, XMarkIcon, CheckIcon, ExclamationCircleIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

const CategoryPill = ({ category, options }) => {
  if (!category) return <span>-</span>;
  
  // Extract just the English part for the pill, or keep it short
  const rawLabel = options.find(o => o.value === category)?.label || category;
  const shortLabel = rawLabel.split(' - ')[1] || rawLabel;

  let colorClass = "bg-slate-100 text-slate-700";
  if (category === 'ADULT') colorClass = "bg-green-100 text-green-700";
  else if (category.includes('CHILD')) colorClass = "bg-orange-100 text-orange-700";
  else if (category === 'LADIES') colorClass = "bg-pink-100 text-pink-700";
  else if (category === 'INFANT') colorClass = "bg-purple-100 text-purple-700";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${colorClass}`}>
      {shortLabel}
    </span>
  );
};

export const ManifestEditableTable = ({ batchId, rows, onRowUpdated, selectedRows, setSelectedRows }) => {
  const { t } = useTranslation();
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const handleEditClick = (row) => {
    setEditingRowId(row.id);
    setEditFormData({ ...row });
  };

  const handleCancelClick = () => {
    setEditingRowId(null);
  };

  const handleSaveClick = async (rowId) => {
    setSaving(true);
    try {
      const updatedRow = await updateManifestRow(batchId, rowId, editFormData);
      onRowUpdated(updatedRow);
      setEditingRowId(null);
    } catch (e) {
      console.error(e);
      alert(t('import.saveError', 'Failed to save row changes'));
    } finally {
      setSaving(false);
    }
  };

  const toggleSelection = (rowId) => {
    const next = new Set(selectedRows);
    if (next.has(rowId)) next.delete(rowId);
    else next.add(rowId);
    setSelectedRows(next);
  };

  const toggleSelectAll = () => {
    if (rows.length === 0) return;
    const allSelected = rows.every(r => selectedRows.has(r.id));
    const next = new Set(selectedRows);
    if (allSelected) {
      rows.forEach(r => next.delete(r.id));
    } else {
      rows.forEach(r => next.add(r.id));
    }
    setSelectedRows(next);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const categoryOptions = [
    { value: 'ADULT', label: 'بالغ - Adult' },
    { value: 'CHILD', label: 'طفل - Child' },
    { value: 'CHILD_UNDER_8', label: 'طفل تحت 8 سنوات - Child under 8' },
    { value: 'LADIES', label: 'سيدة - Ladies' },
    { value: 'INFANT', label: 'رضيع - Infant' },
  ];

  return (
    <div className="mt-6 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer w-4 h-4"
                  checked={rows.length > 0 && rows.every(r => selectedRows.has(r.id))}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-4 px-2">#</th>
              <th className="py-4 px-4">{t('import.col.passengerName', 'Passenger Name')}</th>
              <th className="py-4 px-4">{t('import.col.passport', 'Passport')}</th>
              <th className="py-4 px-4">{t('import.col.category', 'Category')}</th>
              <th className="py-4 px-4">{t('import.col.agent', 'Agent (Excel)')}</th>
              <th className="py-4 px-4">{t('import.col.departureDate', 'Dep. Date')}</th>
              <th className="py-4 px-4">{t('import.col.flight', 'Flight')}</th>
              <th className="py-4 px-4">{t('import.col.destination', 'Destination')}</th>
              <th className="py-4 px-4">{t('import.col.departurePort', 'Dep. Port')}</th>
              <th className="py-4 px-4">{t('import.col.birthDate', 'Birth Date')}</th>
              <th className="py-4 px-4">{t('import.col.arrivalTime', 'Arrival Time')}</th>
              <th className="py-4 px-4">{t('import.col.serviceType', 'Service Type')}</th>
              <th className="py-4 px-4">{t('import.col.regularPrice', 'Regular Price')}</th>
              <th className="py-4 px-4">{t('import.col.commission', 'Commission')}</th>
              <th className="py-4 px-4">{t('import.col.debitEgp', 'مدين مصري')}</th>
              <th className="py-4 px-4">{t('import.col.status', 'Status')}</th>
              <th className="py-4 px-4 text-center">{t('import.col.actions', 'Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {rows.map((row) => {
              const isEditing = editingRowId === row.id;
              const isError = row.validationStatus === 'ERROR';

              return (
                <tr 
                  key={row.id} 
                  className={`hover:bg-slate-50/50 transition-colors ${isError && !isEditing ? 'bg-red-50/20' : ''} ${selectedRows.has(row.id) ? 'bg-indigo-50/30' : ''}`}
                >
                  <td className="py-3 px-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer w-4 h-4"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleSelection(row.id)}
                    />
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-500 font-medium">
                    {row.rowNumber > 0 ? row.rowNumber - 1 : row.rowNumber}
                  </td>
                  
                  {/* Name */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input type="text" name="passengerName" value={editFormData.passengerName || ''} onChange={handleChange} className="block w-32 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center p-1">
                          <svg fill="#158987" className="w-full h-full" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="-51.2 -51.2 614.40 614.40" xmlSpace="preserve" stroke="#158987" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#503030" strokeWidth="8.192"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M500.146,11.928C487.408-0.883,462.448,0.033,444.365,0.006c-0.033,0-0.061,0-0.094,0c-18.1,0-35.124,7.059-47.933,19.875 L143.06,273.038l-50.961-10.191c-5.553-1.092-11.3,0.628-15.315,4.643L4.954,339.435c-4.411,4.417-6.033,10.908-4.224,16.88 c1.814,5.978,6.766,10.472,12.888,11.696l108.639,21.733l21.733,108.639c1.224,6.121,5.718,11.074,11.696,12.888 c1.616,0.491,3.271,0.728,4.914,0.728c4.423,0,8.747-1.731,11.967-4.951l71.945-71.829c4.014-4.004,5.757-9.75,4.643-15.315 l-10.191-50.961l253.157-253.278c12.838-12.838,19.897-29.894,19.87-48.027C511.964,49.555,512.885,24.595,500.146,11.928z"></path> </g> </g> <g> <g> <path d="M68.742,46.015c-5.377-0.893-10.892,0.861-14.763,4.731L6.091,98.629c-4.025,4.025-5.763,9.806-4.616,15.38 c1.142,5.582,5.012,10.209,10.301,12.326l164.328,65.767L286.032,82.23L68.742,46.015z"></path> </g> </g> <g> <g> <path d="M465.987,443.26L429.774,225.97L319.901,335.898l65.767,164.328c2.118,5.289,6.745,9.159,12.325,10.301 c1.131,0.232,2.272,0.348,3.403,0.348c4.445,0,8.769-1.754,11.977-4.964l47.884-47.889 C465.128,454.156,466.886,448.658,465.987,443.26z"></path> </g> </g> </g></svg>
                        </div>
                        {row.passengerName || '-'}
                      </div>
                    )}
                  </td>

                  {/* Passport */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="text" name="passportNumber" value={editFormData.passportNumber || ''} onChange={handleChange} className="block w-24 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      row.passportNumber || '-'
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <select name="passengerCategory" value={editFormData.passengerCategory || ''} onChange={handleChange} className="block w-28 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm">
                        <option value="">--</option>
                        {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      <CategoryPill category={row.passengerCategory} options={categoryOptions} />
                    )}
                  </td>

                  {/* Agent */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="text" name="agentNameRaw" value={editFormData.agentNameRaw || ''} onChange={handleChange} className="block w-28 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      <span className="font-medium text-slate-700">{row.agentNameRaw || '-'}</span>
                    )}
                  </td>

                  {/* Departure Date */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="date" name="departureDate" value={editFormData.departureDate || ''} onChange={handleChange} className="block w-32 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      row.departureDate || '-'
                    )}
                  </td>

                  {/* Flight */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="text" name="flightNumber" value={editFormData.flightNumber || ''} onChange={handleChange} className="block w-20 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      row.flightNumber || '-'
                    )}
                  </td>

                  {/* Destination */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="text" name="destination" value={editFormData.destination || ''} onChange={handleChange} className="block w-24 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      row.destination || '-'
                    )}
                  </td>

                  {/* Port */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="text" name="departurePort" value={editFormData.departurePort || ''} onChange={handleChange} className="block w-24 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      row.departurePort || '-'
                    )}
                  </td>

                  {/* Birth Date */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="date" name="birthDate" value={editFormData.birthDate || ''} onChange={handleChange} className="block w-32 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      row.birthDate || '-'
                    )}
                  </td>

                  {/* Arrival Time */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="time" name="arrivalTime" value={editFormData.arrivalTime || ''} onChange={handleChange} className="block w-24 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" step="2" />
                    ) : (
                      row.arrivalTime || '-'
                    )}
                  </td>

                  {/* Service Type */}
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {isEditing ? (
                      <input type="text" name="serviceType" value={editFormData.serviceType || ''} onChange={handleChange} className="block w-24 rounded-md border-0 py-1.5 px-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    ) : (
                      row.serviceType || '-'
                    )}
                  </td>

                  {/* Prices */}
                  <td className="py-3 px-4 text-sm font-medium text-slate-700 text-right">
                    {row.regularPrice != null ? row.regularPrice.toLocaleString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-700 text-right">
                    {row.commission != null ? row.commission.toLocaleString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-green-700 text-right">
                    {row.debitEgp != null ? row.debitEgp.toLocaleString() : '0'}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {isError ? (
                      <span title={row.validationErrors} className="inline-flex items-center gap-1.5 rounded-full bg-red-100/80 px-2.5 py-1 text-xs font-medium text-red-700 cursor-help">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100/80 px-2.5 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleSaveClick(row.id)} disabled={saving} className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleCancelClick} disabled={saving} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEditClick(row)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <PencilSquareIcon className="w-5 h-5 mx-auto" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
