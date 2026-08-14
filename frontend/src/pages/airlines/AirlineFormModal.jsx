import React, { useState, useEffect } from 'react';
import { createAirline, updateAirline } from '../../api/airlines.api';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const AirlineFormModal = ({ isOpen, airline, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    iataCode: '',
    numericCode: '',
    status: 'ACTIVE',
    settlementCurrency: 'USD'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (airline) {
      setFormData(airline);
    } else {
      setFormData({
        code: '',
        name: '',
        iataCode: '',
        numericCode: '',
        status: 'ACTIVE',
        settlementCurrency: 'USD'
      });
    }
  }, [airline, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (airline) {
        await updateAirline(airline.id, formData);
      } else {
        await createAirline(formData);
      }
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred while saving the airline.');
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
          _jsxDEV("div", { className: "relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6", children: /*#__PURE__*/
            _jsxDEV("div", { children: [/*#__PURE__*/
              _jsxDEV("h3", { className: "text-base font-semibold leading-6 text-gray-900", id: "modal-title", children:
                airline ? 'Edit Airline' : 'Create Airline' }, void 0, false
              ),

              error && /*#__PURE__*/
              _jsxDEV("div", { className: "mt-2 rounded-md bg-red-50 p-4", children: /*#__PURE__*/
                _jsxDEV("div", { className: "text-sm text-red-700", children: error }, void 0, false) }, void 0, false
              ), /*#__PURE__*/

              _jsxDEV("form", { onSubmit: handleSubmit, className: "mt-4 space-y-4", children: [/*#__PURE__*/
                _jsxDEV("div", { children: [/*#__PURE__*/
                  _jsxDEV("label", { htmlFor: "code", className: "block text-sm font-medium leading-6 text-gray-900", children: "Internal Code *" }, void 0, false), /*#__PURE__*/
                  _jsxDEV("input", {
                    type: "text",
                    name: "code",
                    id: "code",
                    required: true,
                    disabled: !!airline,
                    value: formData.code || '',
                    onChange: handleChange,
                    className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100" }, void 0, false
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { children: [/*#__PURE__*/
                  _jsxDEV("label", { htmlFor: "name", className: "block text-sm font-medium leading-6 text-gray-900", children: "Full Name *" }, void 0, false), /*#__PURE__*/
                  _jsxDEV("input", {
                    type: "text",
                    name: "name",
                    id: "name",
                    required: true,
                    value: formData.name || '',
                    onChange: handleChange,
                    className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "iataCode", className: "block text-sm font-medium leading-6 text-gray-900", children: "IATA Code" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "text",
                      name: "iataCode",
                      id: "iataCode",
                      value: formData.iataCode || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "numericCode", className: "block text-sm font-medium leading-6 text-gray-900", children: "Numeric Code" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "text",
                      name: "numericCode",
                      id: "numericCode",
                      value: formData.numericCode || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [/*#__PURE__*/
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
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "settlementCurrency", className: "block text-sm font-medium leading-6 text-gray-900", children: "Settlement Currency" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "text",
                      name: "settlementCurrency",
                      id: "settlementCurrency",
                      value: formData.settlementCurrency || 'USD',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
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

export default AirlineFormModal;