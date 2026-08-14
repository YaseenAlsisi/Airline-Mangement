import React, { useEffect, useState } from 'react';
import { getPriceLists } from '../../api/priceLists.api';
import { useAuthStore } from '../../store/authStore';
import PriceListFormModal from './PriceListFormModal';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const PriceListDataPage = () => {
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
      const res = await getPriceLists();
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

  return (/*#__PURE__*/
    _jsxDEV("div", { children: [/*#__PURE__*/
      _jsxDEV("div", { className: "sm:flex sm:items-center", children: [/*#__PURE__*/
        _jsxDEV("div", { className: "sm:flex-auto", children: [/*#__PURE__*/
          _jsxDEV("h1", { className: "text-2xl font-bold leading-6 text-gray-900", children: "Price Lists & Rules" }, void 0, false), /*#__PURE__*/
          _jsxDEV("p", { className: "mt-2 text-sm text-gray-700", children: "Configure commission and markup rules for specific agents and airlines." }, void 0, false

          )] }, void 0, true
        ), /*#__PURE__*/
        _jsxDEV("div", { className: "mt-4 sm:ml-16 sm:mt-0 sm:flex-none", children:
          canCreate && /*#__PURE__*/
          _jsxDEV("button", {
            onClick: handleCreate,
            type: "button",
            className: "block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", children:
            "Add rule" }, void 0, false

          ) }, void 0, false

        )] }, void 0, true
      ), /*#__PURE__*/
      _jsxDEV("div", { className: "mt-8 flow-root", children: /*#__PURE__*/
        _jsxDEV("div", { className: "-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8", children: /*#__PURE__*/
          _jsxDEV("div", { className: "inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8", children: /*#__PURE__*/
            _jsxDEV("div", { className: "overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg", children: /*#__PURE__*/
              _jsxDEV("table", { className: "min-w-full divide-y divide-gray-300", children: [/*#__PURE__*/
                _jsxDEV("thead", { className: "bg-gray-50", children: /*#__PURE__*/
                  _jsxDEV("tr", { children: [/*#__PURE__*/
                    _jsxDEV("th", { scope: "col", className: "py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6", children: "Code & Name" }, void 0, false

                    ), /*#__PURE__*/
                    _jsxDEV("th", { scope: "col", className: "px-3 py-3.5 text-left text-sm font-semibold text-gray-900", children: "Scope" }, void 0, false

                    ), /*#__PURE__*/
                    _jsxDEV("th", { scope: "col", className: "px-3 py-3.5 text-left text-sm font-semibold text-gray-900", children: "Rules" }, void 0, false

                    ), /*#__PURE__*/
                    _jsxDEV("th", { scope: "col", className: "px-3 py-3.5 text-left text-sm font-semibold text-gray-900", children: "Validity" }, void 0, false

                    ), /*#__PURE__*/
                    _jsxDEV("th", { scope: "col", className: "px-3 py-3.5 text-left text-sm font-semibold text-gray-900", children: "Status" }, void 0, false

                    ), /*#__PURE__*/
                    _jsxDEV("th", { scope: "col", className: "relative py-3.5 pl-3 pr-4 sm:pr-6", children: /*#__PURE__*/
                      _jsxDEV("span", { className: "sr-only", children: "Edit" }, void 0, false) }, void 0, false
                    )] }, void 0, true
                  ) }, void 0, false
                ), /*#__PURE__*/
                _jsxDEV("tbody", { className: "divide-y divide-gray-200 bg-white", children:
                  loading ? /*#__PURE__*/
                  _jsxDEV("tr", { children: /*#__PURE__*/
                    _jsxDEV("td", { colSpan: 6, className: "py-4 text-center text-sm text-gray-500", children: "Loading..." }, void 0, false) }, void 0, false
                  ) :
                  priceLists.length === 0 ? /*#__PURE__*/
                  _jsxDEV("tr", { children: /*#__PURE__*/
                    _jsxDEV("td", { colSpan: 6, className: "py-4 text-center text-sm text-gray-500", children: "No price lists found." }, void 0, false) }, void 0, false
                  ) :

                  priceLists.map((pl) => /*#__PURE__*/
                  _jsxDEV("tr", { children: [/*#__PURE__*/
                    _jsxDEV("td", { className: "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6", children: [/*#__PURE__*/
                      _jsxDEV("div", { children: pl.code }, void 0, false), /*#__PURE__*/
                      _jsxDEV("div", { className: "font-normal text-gray-500", children: pl.name }, void 0, false)] }, void 0, true
                    ), /*#__PURE__*/
                    _jsxDEV("td", { className: "whitespace-nowrap px-3 py-4 text-sm text-gray-500", children: [/*#__PURE__*/
                      _jsxDEV("div", { children: pl.agentId ? 'Specific Agent' : 'All Agents' }, void 0, false), /*#__PURE__*/
                      _jsxDEV("div", { children: pl.airlineId ? 'Specific Airline' : 'All Airlines' }, void 0, false)] }, void 0, true
                    ), /*#__PURE__*/
                    _jsxDEV("td", { className: "whitespace-nowrap px-3 py-4 text-sm text-gray-500", children: [/*#__PURE__*/
                      _jsxDEV("div", { children: ["Com: ", pl.commissionPercentage, "%"] }, void 0, true), /*#__PURE__*/
                      _jsxDEV("div", { children: ["MU: $", pl.markupAmount] }, void 0, true)] }, void 0, true
                    ), /*#__PURE__*/
                    _jsxDEV("td", { className: "whitespace-nowrap px-3 py-4 text-sm text-gray-500", children: [/*#__PURE__*/
                      _jsxDEV("div", { children: ["From: ", pl.validFrom || '-'] }, void 0, true), /*#__PURE__*/
                      _jsxDEV("div", { children: ["To: ", pl.validTo || '-'] }, void 0, true)] }, void 0, true
                    ), /*#__PURE__*/
                    _jsxDEV("td", { className: "whitespace-nowrap px-3 py-4 text-sm text-gray-500", children: /*#__PURE__*/
                      _jsxDEV("span", { className: `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        pl.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        'bg-red-50 text-red-700 ring-red-600/10'}`, children:

                        pl.status }, void 0, false
                      ) }, void 0, false
                    ), /*#__PURE__*/
                    _jsxDEV("td", { className: "relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6", children:
                      canEdit && /*#__PURE__*/
                      _jsxDEV("button", { onClick: () => handleEdit(pl), className: "text-indigo-600 hover:text-indigo-900", children: ["Edit", /*#__PURE__*/
                        _jsxDEV("span", { className: "sr-only", children: [", ", pl.code] }, void 0, true)] }, void 0, true
                      ) }, void 0, false

                    )] }, pl.id, true
                  )
                  ) }, void 0, false

                )] }, void 0, true
              ) }, void 0, false
            ) }, void 0, false
          ) }, void 0, false
        ) }, void 0, false
      ),

      isModalOpen && /*#__PURE__*/
      _jsxDEV(PriceListFormModal, {
        isOpen: isModalOpen,
        priceList: editingPriceList,
        onClose: handleModalClose }, void 0, false
      )] }, void 0, true

    ));

};

export default PriceListDataPage;