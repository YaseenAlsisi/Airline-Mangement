import React, { useEffect, useState, useRef } from 'react';
import { getPriceLists, deletePriceList } from '../../api/priceLists.api';
import { useAuthStore } from '../../store/authStore';
import PriceListFormModal from './PriceListFormModal';
import { useTranslation } from 'react-i18next';
import { FunnelIcon, PaperAirplaneIcon, MapPinIcon, ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const PriceListDataPage = () => {
  useDocumentTitle('Price Lists');
  const { t } = useTranslation();
  const { hasPermission } = useAuthStore();
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState(null);
  const [departureFilter, setDepartureFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterView, setFilterView] = useState('main'); // 'main', 'departure', 'destination'
  const [toast, setToast] = useState(null);
  const filterRef = useRef(null);

  const canCreate = hasPermission('PRICE_CREATE');
  const canEdit = hasPermission('PRICE_EDIT');

  const fetchPriceLists = async () => {
    setLoading(true);
    try {
      const res = await getPriceLists({ size: 100 });
      console.log("Fetched price lists response:", res);
      setPriceLists(res.data?.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

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

  const handleEdit = (priceList) => {
    if (!canEdit) return;
    setEditingPriceList(priceList);
    setIsModalOpen(true);
  };

  const handleDelete = async (priceList) => {
    if (!canEdit) return;
    const confirmMsg = t('priceList.deleteConfirm', 'Are you sure you want to delete this price list? This action cannot be undone.');
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await deletePriceList(priceList.id);
      fetchPriceLists();
      setToast(t('priceList.deleteSuccess', 'Price list deleted successfully'));
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error("Failed to delete price list:", e);
      alert(t('priceList.deleteError', 'An error occurred while trying to delete.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPriceList(null);
    setIsModalOpen(true);
  };

  const handleModalClose = (shouldRefresh, message) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchPriceLists();
      if (message) {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8 gap-4 flex-wrap">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">{t('priceList.title', 'Price Lists')}</h1>
          <p className="mt-2 text-sm text-gray-700">{t('priceList.subtitle', 'Manage your price lists and display them in the required grid format.')}</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center gap-4 flex-wrap">
          {/* Filter Dropdown Button */}
          <div className="relative inline-block text-left" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center justify-center gap-x-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
              Filter
              {(departureFilter || destinationFilter) && (
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 absolute top-1.5 right-1.5"></span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none p-3 transition-all overflow-hidden">
                
                {filterView === 'main' && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 mb-2">{t('priceList.addFilter', 'Add Filter')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      
                      <button 
                        onClick={() => setFilterView('departure')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${departureFilter ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                      >
                        <PaperAirplaneIcon className={`w-5 h-5 mb-1 ${departureFilter ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className={`text-[11px] font-semibold ${departureFilter ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {t('priceList.departure', 'Departure')}
                        </span>
                      </button>

                      <button 
                        onClick={() => setFilterView('destination')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${destinationFilter ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                      >
                        <MapPinIcon className={`w-5 h-5 mb-1 ${destinationFilter ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className={`text-[11px] font-semibold ${destinationFilter ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {t('priceList.destination', 'Destination')}
                        </span>
                      </button>
                      
                    </div>

                    {/* Clear Filters */}
                    {(departureFilter || destinationFilter) && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => { setDepartureFilter(''); setDestinationFilter(''); }}
                          className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-center font-bold transition-colors"
                        >
                          {t('priceList.clearFilters', 'Clear Filters')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {filterView === 'departure' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                       <button onClick={() => setFilterView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeftIcon className="w-5 h-5"/></button>
                       <h3 className="text-sm font-bold text-slate-800">{t('priceList.selectDeparture', 'Select Departure')}</h3>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                       <button 
                          onClick={() => { setDepartureFilter(''); setFilterView('main'); }}
                          className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium ${!departureFilter ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                       >
                          {t('priceList.all', 'All')}
                       </button>
                       {[...new Set(priceLists.flatMap(pl => (pl.groups || []).map(g => g.departureAirport?.trim())).filter(Boolean))].sort().map(dep => (
                         <button 
                            key={dep}
                            onClick={() => { setDepartureFilter(dep); setFilterView('main'); }}
                            className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium ${departureFilter === dep ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                         >
                            {dep}
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                {filterView === 'destination' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                       <button onClick={() => setFilterView('main')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeftIcon className="w-5 h-5"/></button>
                       <h3 className="text-sm font-bold text-slate-800">{t('priceList.selectDestination', 'Select Destination')}</h3>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                       <button 
                          onClick={() => { setDestinationFilter(''); setFilterView('main'); }}
                          className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium ${!destinationFilter ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                       >
                          {t('priceList.all', 'All')}
                       </button>
                       {[...new Set(priceLists.flatMap(pl => (pl.groups || []).map(g => g.destination?.trim())).filter(Boolean))].sort().map(dest => (
                         <button 
                            key={dest}
                            onClick={() => { setDestinationFilter(dest); setFilterView('main'); }}
                            className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium ${destinationFilter === dest ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                         >
                            {dest}
                         </button>
                       ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {canCreate && (
            <button
              onClick={handleCreate}
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t('priceList.add', 'Add Price List')}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : priceLists.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">{t('priceList.empty.title', 'No price lists found.')}</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {priceLists.map(pl => {
              if (departureFilter || destinationFilter) {
                return {
                  ...pl,
                  groups: (pl.groups || []).filter(g => {
                    const matchDep = !departureFilter || g.departureAirport?.trim() === departureFilter;
                    const matchDest = !destinationFilter || g.destination?.trim() === destinationFilter;
                    return matchDep && matchDest;
                  })
                };
              }
              return pl;
            }).filter(pl => (!departureFilter && !destinationFilter) || (pl.groups && pl.groups.length > 0)).map((pl) => {
              return (
                <div key={pl.id} className="bg-white p-6 shadow-md ring-1 ring-gray-900/5 sm:rounded-xl h-fit">
                  {/* Header of the Price List */}
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{pl.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">{t('priceList.code', 'Code')}: {pl.code} | {t('priceList.status', 'Status')}: {pl.status}</p>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(pl)} 
                          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          {t('priceList.edit', 'Edit')}
                        </button>
                        <button 
                          onClick={() => handleDelete(pl)} 
                          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                        >
                          {t('priceList.delete', 'Delete')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Grid View */}
                  <div dir="rtl" className="mt-6">
                    {/* Tables Grid */}
                    <div className="grid grid-cols-1 gap-6">
                      {pl.groups && pl.groups.map((group) => {
                        const routeLabel = `${group.departureAirport} - ${group.destination}`.trim();
                        
                        return (
                          <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-indigo-100">
                            {/* Route Header */}
                            <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span dir="rtl">{routeLabel}</span>
                              </h3>
                            </div>
                            
                            {/* Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-start">
                                <thead>
                                  <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                      {t('priceList.type', 'Passenger Type')}
                                    </th>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                      {t('priceList.basePrice', 'Base Price')}
                                    </th>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                      {t('priceList.commission', 'العمولة')}
                                    </th>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                      {t('priceList.total', 'Total')}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {group.entries && group.entries.map((entry) => {
                                    const passengerTypeTrans = t(`passengerType.${entry.passengerType}`, entry.passengerType);
                                    const basePrice = Number(entry.price) || 0;
                                    const commission = Number(entry.commission) || 0;
                                    const total = basePrice + commission;
                                    
                                    return (
                                      <tr key={entry.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                          {passengerTypeTrans}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                          {basePrice.toLocaleString()} <span className="text-xs text-gray-400 font-normal">{entry.currency || 'EGP'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-orange-600">
                                          {commission.toLocaleString()} <span className="text-xs text-gray-400 font-normal">{entry.currency || 'EGP'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                                          {total.toLocaleString()} <span className="text-xs text-gray-400 font-normal">{entry.currency || 'EGP'}</span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <PriceListFormModal
          isOpen={isModalOpen}
          priceList={editingPriceList}
          onClose={handleModalClose}
        />
      )}

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

export default PriceListDataPage;