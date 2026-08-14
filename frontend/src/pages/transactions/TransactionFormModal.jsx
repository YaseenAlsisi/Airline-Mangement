import React, { useState, useEffect } from 'react';
import { createTransaction, updateTransaction } from '../../api/transactions.api';
import { getAgents } from '../../api/agents.api';
import { getAirlines } from '../../api/airlines.api';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const TransactionFormModal = ({ isOpen, transaction, onClose }) => {
  const [formData, setFormData] = useState({
    ticketNumber: '',
    pnr: '',
    passengerName: '',
    airlineId: null,
    agentId: null,
    issueDate: new Date().toISOString().split('T')[0],
    baseFare: 0,
    tax: 0,
    status: 'PENDING'
  });

  const [agents, setAgents] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        ticketNumber: '',
        pnr: '',
        passengerName: '',
        airlineId: null,
        agentId: null,
        issueDate: new Date().toISOString().split('T')[0],
        baseFare: 0,
        tax: 0,
        status: 'PENDING'
      });
    }
  }, [transaction, isOpen]);

  const fetchDropdownData = async () => {
    try {
      const [agentsRes, airlinesRes] = await Promise.all([
      getAgents({ size: 1000 }),
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
      if (name === 'agentId' || name === 'airlineId') {
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
      if (transaction) {
        await updateTransaction(transaction.id, formData);
      } else {
        await createTransaction(formData);
      }
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred while saving the transaction.');
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
                transaction ? 'Edit Transaction' : 'Create Transaction' }, void 0, false
              ),

              error && /*#__PURE__*/
              _jsxDEV("div", { className: "mt-2 rounded-md bg-red-50 p-4", children: /*#__PURE__*/
                _jsxDEV("div", { className: "text-sm text-red-700", children: error }, void 0, false) }, void 0, false
              ), /*#__PURE__*/

              _jsxDEV("form", { onSubmit: handleSubmit, className: "mt-4 space-y-4", children: [/*#__PURE__*/
                _jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "ticketNumber", className: "block text-sm font-medium leading-6 text-gray-900", children: "Ticket Number *" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "text",
                      name: "ticketNumber",
                      id: "ticketNumber",
                      required: true,
                      disabled: !!transaction,
                      value: formData.ticketNumber || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100" }, void 0, false
                    )] }, void 0, true
                  ), /*#__PURE__*/

                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "pnr", className: "block text-sm font-medium leading-6 text-gray-900", children: "PNR" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "text",
                      name: "pnr",
                      id: "pnr",
                      value: formData.pnr || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { children: [/*#__PURE__*/
                  _jsxDEV("label", { htmlFor: "passengerName", className: "block text-sm font-medium leading-6 text-gray-900", children: "Passenger Name" }, void 0, false), /*#__PURE__*/
                  _jsxDEV("input", {
                    type: "text",
                    name: "passengerName",
                    id: "passengerName",
                    value: formData.passengerName || '',
                    onChange: handleChange,
                    className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "agentId", className: "block text-sm font-medium leading-6 text-gray-900", children: "Agent" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("select", {
                      name: "agentId",
                      id: "agentId",
                      value: formData.agentId || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6", children: [/*#__PURE__*/

                      _jsxDEV("option", { value: "", children: "-- Select Agent --" }, void 0, false),
                      agents.map((a) => /*#__PURE__*/_jsxDEV("option", { value: a.id, children: a.name }, a.id, false))] }, void 0, true
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "airlineId", className: "block text-sm font-medium leading-6 text-gray-900", children: "Airline" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("select", {
                      name: "airlineId",
                      id: "airlineId",
                      value: formData.airlineId || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6", children: [/*#__PURE__*/

                      _jsxDEV("option", { value: "", children: "-- Select Airline --" }, void 0, false),
                      airlines.map((a) => /*#__PURE__*/_jsxDEV("option", { value: a.id, children: a.name }, a.id, false))] }, void 0, true
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "grid grid-cols-3 gap-4", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "issueDate", className: "block text-sm font-medium leading-6 text-gray-900", children: "Issue Date *" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "date",
                      name: "issueDate",
                      id: "issueDate",
                      required: true,
                      value: formData.issueDate || '',
                      onChange: handleChange,
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "baseFare", className: "block text-sm font-medium leading-6 text-gray-900", children: "Base Fare *" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("div", { className: "relative mt-1 rounded-md shadow-sm", children: [/*#__PURE__*/
                      _jsxDEV("div", { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3", children: /*#__PURE__*/
                        _jsxDEV("span", { className: "text-gray-500 sm:text-sm", children: "$" }, void 0, false) }, void 0, false
                      ), /*#__PURE__*/
                      _jsxDEV("input", {
                        type: "number",
                        step: "0.01",
                        name: "baseFare",
                        id: "baseFare",
                        required: true,
                        value: formData.baseFare || 0,
                        onChange: handleChange,
                        className: "block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                      )] }, void 0, true
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "tax", className: "block text-sm font-medium leading-6 text-gray-900", children: "Tax *" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("div", { className: "relative mt-1 rounded-md shadow-sm", children: [/*#__PURE__*/
                      _jsxDEV("div", { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3", children: /*#__PURE__*/
                        _jsxDEV("span", { className: "text-gray-500 sm:text-sm", children: "$" }, void 0, false) }, void 0, false
                      ), /*#__PURE__*/
                      _jsxDEV("input", {
                        type: "number",
                        step: "0.01",
                        name: "tax",
                        id: "tax",
                        required: true,
                        value: formData.tax || 0,
                        onChange: handleChange,
                        className: "block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                      )] }, void 0, true
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3", children: [/*#__PURE__*/
                  _jsxDEV("button", {
                    type: "submit",
                    disabled: loading,
                    className: "inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:bg-indigo-400", children:

                    loading ? 'Saving...' : 'Save & Calculate' }, void 0, false
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

export default TransactionFormModal;