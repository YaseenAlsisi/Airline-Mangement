import React, { useEffect, useState } from 'react';
import { getPriceLists, deletePriceList } from '../../api/priceLists.api';
import { useAuthStore } from '../../store/authStore';
import PriceListFormModal from './PriceListFormModal';
import { useTranslation } from 'react-i18next';

export const PriceListDataPage = () => {
  const { t } = useTranslation();
  const { hasPermission } = useAuthStore();
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState(null);

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

  const handleEdit = (priceList) => {
    if (!canEdit) return;
    setEditingPriceList(priceList);
    setIsModalOpen(true);
  };

  const handleDelete = async (priceList) => {
    if (!canEdit) return;
    const confirmMsg = t('priceList.deleteConfirm', 'هل أنت متأكد من حذف قائمة الأسعار هذه؟ لا يمكن التراجع عن هذا الإجراء.');
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await deletePriceList(priceList.id);
      fetchPriceLists();
    } catch (e) {
      console.error("Failed to delete price list:", e);
      alert(t('priceList.deleteError', 'حدث خطأ أثناء محاولة الحذف.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPriceList(null);
    setIsModalOpen(true);
  };

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchPriceLists();
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">{t('priceList.title', 'Price Lists (قوائم الأسعار)')}</h1>
          <p className="mt-2 text-sm text-gray-700">{t('priceList.subtitle', 'Manage your price lists and display them in the required grid format.')}</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
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
            {priceLists.map((pl) => {
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
                          {t('priceList.edit', 'تعديل (Edit)')}
                        </button>
                        <button 
                          onClick={() => handleDelete(pl)} 
                          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                        >
                          {t('priceList.delete', 'حذف (Delete)')}
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
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                                      {t('priceList.type', 'نوع المسافر')}
                                    </th>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                                      {t('priceList.total', 'السعر الإجمالي')}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {group.entries && group.entries.map((entry) => {
                                    const passengerTypeTrans = t(`passengerType.${entry.passengerType}`, entry.passengerType);
                                    return (
                                      <tr key={entry.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                          {passengerTypeTrans}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                                          {entry.price.toLocaleString()} <span className="text-xs text-gray-400 font-normal">{entry.currency || 'EGP'}</span>
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
    </div>
  );
};

export default PriceListDataPage;