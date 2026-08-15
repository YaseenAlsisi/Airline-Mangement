import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateManifestRow } from '../../../api/manifestImport.api';
import { 
  UserIcon, IdentificationIcon, BuildingOfficeIcon, 
  CalendarDaysIcon, PaperAirplaneIcon, MapPinIcon, 
  TagIcon, ExclamationCircleIcon, CheckCircleIcon,
  PencilSquareIcon, XMarkIcon, CheckIcon,
  CakeIcon, MapIcon, ClockIcon, BriefcaseIcon
} from '@heroicons/react/24/outline';

export const ManifestEditableGrid = ({ batchId, rows, onRowUpdated }) => {
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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      {rows.map((row) => {
        const isEditing = editingRowId === row.id;
        const isError = row.validationStatus === 'ERROR';

        return (
          <div 
            key={row.id} 
            className={`relative flex flex-col overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${
              isError ? 'border-red-200 hover:border-red-300' : 'border-slate-100 hover:border-indigo-100'
            }`}
          >
            {/* Header Area */}
            <div className={`px-5 py-4 flex justify-between items-center border-b ${isError ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm text-xs font-bold text-slate-500">
                  #{row.rowNumber}
                </span>
                {isError ? (
                  <span title={row.validationErrors} className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 cursor-help">
                    <ExclamationCircleIcon className="w-4 h-4" /> ERROR
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircleIcon className="w-4 h-4" /> VALID
                  </span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSaveClick(row.id)} 
                      disabled={saving} 
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" /> {t('import.saveRow', 'Save')}
                    </button>
                    <button 
                      onClick={handleCancelClick} 
                      disabled={saving} 
                      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4" /> {t('import.cancelRow', 'Cancel')}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEditClick(row)} 
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 hover:ring-indigo-300 transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" /> {t('import.editRow', 'Edit')}
                  </button>
                )}
              </div>
            </div>

            {/* Body Area */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              
              {/* Passenger Name */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <UserIcon className="w-4 h-4" /> {t('import.col.passengerName', 'الاسم')}
                </label>
                {isEditing ? (
                  <input type="text" name="passengerName" value={editFormData.passengerName || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm font-semibold text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">{row.passengerName || '-'}</div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <CakeIcon className="w-4 h-4" /> {t('import.col.birthDate', 'تاريخ الميلاد')}
                </label>
                {isEditing ? (
                  <input type="date" name="birthDate" value={editFormData.birthDate || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">{row.birthDate || '-'}</div>
                )}
              </div>

              {/* Passport */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <IdentificationIcon className="w-4 h-4" /> {t('import.col.passport', 'رقم الجواز')}
                </label>
                {isEditing ? (
                  <input type="text" name="passportNumber" value={editFormData.passportNumber || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">{row.passportNumber || '-'}</div>
                )}
              </div>

              {/* Departure Port */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <MapIcon className="w-4 h-4" /> {t('import.col.departurePort', 'المنفذ')}
                </label>
                {isEditing ? (
                  <input type="text" name="departurePort" value={editFormData.departurePort || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">{row.departurePort || '-'}</div>
                )}
              </div>

              {/* Destination */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <MapPinIcon className="w-4 h-4" /> {t('import.col.destination', 'جهة المغادرة')}
                </label>
                {isEditing ? (
                  <input type="text" name="destination" value={editFormData.destination || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">{row.destination || '-'}</div>
                )}
              </div>

              {/* Flight */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <PaperAirplaneIcon className="w-4 h-4" /> {t('import.col.flight', 'رقم الرحلة')}
                </label>
                {isEditing ? (
                  <input type="text" name="flightNumber" value={editFormData.flightNumber || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">{row.flightNumber || '-'}</div>
                )}
              </div>

              {/* Dep Date */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <CalendarDaysIcon className="w-4 h-4" /> {t('import.col.departureDate', 'تاريخ المغادرة')}
                </label>
                {isEditing ? (
                  <input type="date" name="departureDate" value={editFormData.departureDate || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">{row.departureDate || '-'}</div>
                )}
              </div>

              {/* Arrival Time */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <ClockIcon className="w-4 h-4" /> {t('import.col.arrivalTime', 'ميعاد الوصول')}
                </label>
                {isEditing ? (
                  <input type="time" name="arrivalTime" value={editFormData.arrivalTime || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" step="2" />
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">{row.arrivalTime || '-'}</div>
                )}
              </div>

              {/* Agent */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <BuildingOfficeIcon className="w-4 h-4" /> {t('import.col.agent', 'الوكيل')}
                </label>
                {isEditing ? (
                  <input type="text" name="agentNameRaw" value={editFormData.agentNameRaw || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm text-indigo-700 font-medium bg-indigo-50/50 px-3 py-2 rounded-lg border border-indigo-100/50">{row.agentNameRaw || '-'}</div>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <BriefcaseIcon className="w-4 h-4" /> {t('import.col.serviceType', 'نوع الخدمة')}
                </label>
                {isEditing ? (
                  <input type="text" name="serviceType" value={editFormData.serviceType || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" />
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">{row.serviceType || '-'}</div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <TagIcon className="w-4 h-4" /> {t('import.col.category', 'النوع')}
                </label>
                {isEditing ? (
                  <select name="passengerCategory" value={editFormData.passengerCategory || ''} onChange={handleChange} className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
                    <option value="">{t('common.select', '-- Select --')}</option>
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                    {editFormData.passengerCategory && !categoryOptions.find(o => o.value === editFormData.passengerCategory) && (
                      <option value={editFormData.passengerCategory}>{editFormData.passengerCategory} (Raw)</option>
                    )}
                  </select>
                ) : (
                  <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                    {categoryOptions.find(o => o.value === row.passengerCategory)?.label || row.passengerCategory || '-'}
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
