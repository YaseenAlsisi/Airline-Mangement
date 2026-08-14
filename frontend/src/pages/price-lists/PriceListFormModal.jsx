import React, { useState, useEffect } from 'react';
import { createPriceList, updatePriceList } from '../../api/priceLists.api';
import { getAgents } from '../../api/agents.api';
import { getAirlines } from '../../api/airlines.api';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const PriceListFormModal = ({ isOpen, priceList, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    airlineId: null,
    agentId: null,
    commissionPercentage: 0,
    markupAmount: 0,
    status: 'ACTIVE',
    validFrom: null,
    validTo: null
  });

  const [agents, setAgents] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
    if (priceList) {
      setFormData(priceList);
    } else {
      setFormData({
        code: '',
        name: '',
        airlineId: null,
        agentId: null,
        commissionPercentage: 0,
        markupAmount: 0,
        status: 'ACTIVE',
        validFrom: null,
        validTo: null
      });
    }
  }, [priceList, isOpen]);

  const fetchDropdownData = async () => {
    try {
      const [agentsRes, airlinesRes] = await Promise.all([
      getAgents({ size: 1000 }), // In a real app, use a searchable combobox for large datasets
      getAirlines({ size: 1000 })]
      );
      setAgents(agentsRes.data?.content || []);
      setAirlines(airlinesRes.data?.content || []);
    } catch (e) {
      console.error("Failed to load dropdown data", e);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    if (type === 'number') {
      finalValue = value ? parseFloat(value) : 0;
    } else if (value === '') {
      // Handle empty dropdowns (nulling them out)
      if (name === 'agentId' || name === 'airlineId' || name === 'validFrom' || name === 'validTo') {
        finalValue = null;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (priceList) {
        await updatePriceList(priceList.id, formData);
      } else {
        await createPriceList(formData);
      }
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred while saving the price list.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (/*#__PURE__*/
    _jsxDEV("div", { className: "relative z-50", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: [/*#__PURE__*/
      _jsxDEV("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" }, void 0, false), /*#__PURE__*/

      _jsxDEV("div", { className: "fixed inset-0 z-10 w-screen overflow-y-auto", children: /*#__PURE__*/
        _jsxDEV("div", { className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0", children: /*#__PURE__*/
          _jsxDEV("div", { className: "relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6", children: /*#__PURE__*/
            _jsxDEV("div", { children: [/*#__PURE__*/
              _jsxDEV("h3", { className: "text-base font-semibold leading-6 text-gray-900", id: "modal-title", children:
                priceList ? 'Edit Price List' : 'Create Price List' }, void 0, false
              ),

              error && /*#__PURE__*/
              _jsxDEV("div", { className: "mt-2 rounded-md bg-red-50 p-4", children: /*#__PURE__*/
                _jsxDEV("div", { className: "text-sm text-red-700", children: error }, void 0, false) }, void 0, false
              ), /*#__PURE__*/

              _jsxDEV("form", { onSubmit: handleSubmit, className: "mt-4 space-y-4", children: [/*#__PURE__*/
                _jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "code", className: "block text-sm font-medium leading-6 text-gray-900", children: "Code *" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "text",
                      name: "code",
                      id: "code",
                      required: true,
                      disabled: !!priceList,
                      value: formData.code || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100" }, void 0, false
                    )] }, void 0, true
                  ), /*#__PURE__*/

                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "name", className: "block text-sm font-medium leading-6 text-gray-900", children: "Name / Description *" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "text",
                      name: "name",
                      id: "name",
                      required: true,
                      value: formData.name || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "agentId", className: "block text-sm font-medium leading-6 text-gray-900", children: "Applies To Agent" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("select", {
                      name: "agentId",
                      id: "agentId",
                      value: formData.agentId || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6", children: [/*#__PURE__*/

                      _jsxDEV("option", { value: "", children: "-- All Agents (Global) --" }, void 0, false),
                      agents.map((a) => /*#__PURE__*/_jsxDEV("option", { value: a.id, children: [a.name, " (", a.code, ")"] }, a.id, true))] }, void 0, true
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "airlineId", className: "block text-sm font-medium leading-6 text-gray-900", children: "Applies To Airline" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("select", {
                      name: "airlineId",
                      id: "airlineId",
                      value: formData.airlineId || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6", children: [/*#__PURE__*/

                      _jsxDEV("option", { value: "", children: "-- All Airlines (Global) --" }, void 0, false),
                      airlines.map((a) => /*#__PURE__*/_jsxDEV("option", { value: a.id, children: [a.name, " (", a.code, ")"] }, a.id, true))] }, void 0, true
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "commissionPercentage", className: "block text-sm font-medium leading-6 text-gray-900", children: "Commission %" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("div", { className: "relative mt-1 rounded-md shadow-sm", children: [/*#__PURE__*/
                      _jsxDEV("input", {
                        type: "number",
                        step: "0.01",
                        name: "commissionPercentage",
                        id: "commissionPercentage",
                        value: formData.commissionPercentage || 0,
                        onChange: handleChange,
                        className: "block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                      ), /*#__PURE__*/
                      _jsxDEV("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3", children: /*#__PURE__*/
                        _jsxDEV("span", { className: "text-gray-500 sm:text-sm", children: "%" }, void 0, false) }, void 0, false
                      )] }, void 0, true
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "markupAmount", className: "block text-sm font-medium leading-6 text-gray-900", children: "Fixed Markup" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("div", { className: "relative mt-1 rounded-md shadow-sm", children: [/*#__PURE__*/
                      _jsxDEV("div", { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3", children: /*#__PURE__*/
                        _jsxDEV("span", { className: "text-gray-500 sm:text-sm", children: "$" }, void 0, false) }, void 0, false
                      ), /*#__PURE__*/
                      _jsxDEV("input", {
                        type: "number",
                        step: "0.01",
                        name: "markupAmount",
                        id: "markupAmount",
                        value: formData.markupAmount || 0,
                        onChange: handleChange,
                        className: "block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                      )] }, void 0, true
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "grid grid-cols-3 gap-4", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "validFrom", className: "block text-sm font-medium leading-6 text-gray-900", children: "Valid From" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "date",
                      name: "validFrom",
                      id: "validFrom",
                      value: formData.validFrom || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "validTo", className: "block text-sm font-medium leading-6 text-gray-900", children: "Valid To" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "date",
                      name: "validTo",
                      id: "validTo",
                      value: formData.validTo || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "status", className: "block text-sm font-medium leading-6 text-gray-900", children: "Status" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("select", {
                      name: "status",
                      id: "status",
                      value: formData.status,
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6", children: [/*#__PURE__*/

                      _jsxDEV("option", { value: "ACTIVE", children: "ACTIVE" }, void 0, false), /*#__PURE__*/
                      _jsxDEV("option", { value: "INACTIVE", children: "INACTIVE" }, void 0, false)] }, void 0, true
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3", children: [/*#__PURE__*/
                  _jsxDEV("button", {
                    type: "submit",
                    disabled: loading,
                    className: "inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:bg-indigo-400", children:

                    loading ? 'Saving...' : 'Save' }, void 0, false
                  ), /*#__PURE__*/
                  _jsxDEV("button", {
                    type: "button",
                    onClick: () => onClose(false),
                    className: "mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0", children:
                    "Cancel" }, void 0, false

                  )] }, void 0, true
                )] }, void 0, true
              )] }, void 0, true
            ) }, void 0, false
          ) }, void 0, false
        ) }, void 0, false
      )] }, void 0, true
    ));

};

export default PriceListFormModal;