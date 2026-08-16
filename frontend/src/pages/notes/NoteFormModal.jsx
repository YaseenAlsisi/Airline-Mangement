import React, { useState } from 'react';
import { createNote } from '../../api/notes.api';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const NoteFormModal = ({
  isOpen,
  onClose,
  defaultEntityType = 'GENERAL',
  defaultEntityId = null
}) => {
  const [content, setContent] = useState('');
  const [entityType, setEntityType] = useState(defaultEntityType);
  const [entityId, setEntityId] = useState(defaultEntityId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createNote({
        content,
        entityType: showAdvanced ? entityType : 'GENERAL',
        entityId: showAdvanced && entityId ? entityId : null
      });
      setContent('');
      setEntityType(defaultEntityType);
      setEntityId(defaultEntityId || '');
      setShowAdvanced(false);
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (/*#__PURE__*/
    _jsxDEV("div", { className: "relative z-50", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: [/*#__PURE__*/
      _jsxDEV("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" }, void 0, false), /*#__PURE__*/

      _jsxDEV("div", { className: "fixed inset-0 z-10 w-screen overflow-y-auto", children: /*#__PURE__*/
        _jsxDEV("div", { className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0", children: /*#__PURE__*/
          _jsxDEV("div", { className: "relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6", children: /*#__PURE__*/
            _jsxDEV("div", { children: [/*#__PURE__*/
              _jsxDEV("h3", { className: "text-base font-semibold leading-6 text-gray-900", id: "modal-title", children: "New Note" }, void 0, false

              ),

              error && /*#__PURE__*/
              _jsxDEV("div", { className: "mt-2 rounded-md bg-red-50 p-4", children: /*#__PURE__*/
                _jsxDEV("div", { className: "text-sm text-red-700", children: error }, void 0, false) }, void 0, false
              ), /*#__PURE__*/

              _jsxDEV("form", { onSubmit: handleSubmit, className: "mt-4 space-y-4", children: [/*#__PURE__*/

                _jsxDEV("div", { children: [/*#__PURE__*/
                  _jsxDEV("label", { htmlFor: "content", className: "block text-sm font-medium leading-6 text-gray-900", children: "Content *" }, void 0, false), /*#__PURE__*/
                  _jsxDEV("textarea", {
                    name: "content",
                    id: "content",
                    required: true,
                    rows: 4,
                    value: content,
                    onChange: (e) => setContent(e.target.value),
                    className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" }, void 0, false
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "flex items-center", children: [/*#__PURE__*/
                  _jsxDEV("input", {
                    id: "showAdvanced",
                    name: "showAdvanced",
                    type: "checkbox",
                    checked: showAdvanced,
                    onChange: (e) => setShowAdvanced(e.target.checked),
                    className: "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" }, void 0, false
                  ), /*#__PURE__*/
                  _jsxDEV("label", { htmlFor: "showAdvanced", className: "ml-2 block text-sm text-gray-900 cursor-pointer", children: "Link to a specific record (Optional)" }, void 0, false)
                ] }, void 0, true
                ),

                showAdvanced && /*#__PURE__*/
                _jsxDEV("div", { className: "grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100", children: [/*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "entityType", className: "block text-sm font-medium leading-6 text-gray-700", children: "Entity Type" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("select", {
                      name: "entityType",
                      id: "entityType",
                      value: entityType,
                      onChange: (e) => setEntityType(e.target.value),
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6", children: [/*#__PURE__*/
                        _jsxDEV("option", { value: "GENERAL", children: "General Note" }, void 0, false), /*#__PURE__*/
                        _jsxDEV("option", { value: "AGENT", children: "Agent" }, void 0, false), /*#__PURE__*/
                        _jsxDEV("option", { value: "AIRLINE", children: "Airline" }, void 0, false), /*#__PURE__*/
                        _jsxDEV("option", { value: "TRANSACTION", children: "Transaction" }, void 0, false)
                      ] }, void 0, true
                    )] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("div", { children: [/*#__PURE__*/
                    _jsxDEV("label", { htmlFor: "entityId", className: "block text-sm font-medium leading-6 text-gray-700", children: "Entity ID" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("input", {
                      type: "text",
                      name: "entityId",
                      id: "entityId",
                      disabled: entityType === 'GENERAL',
                      value: entityType === 'GENERAL' ? '' : entityId,
                      onChange: (e) => setEntityId(e.target.value),
                      placeholder: "e.g. 123e4567-e89b...",
                      className: "mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:text-gray-500" }, void 0, false
                    )] }, void 0, true
                  )] }, void 0, true
                ), /*#__PURE__*/

                _jsxDEV("div", { className: "mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3", children: [/*#__PURE__*/
                  _jsxDEV("button", {
                    type: "submit",
                    disabled: loading,
                    className: "inline-flex w-full justify-center rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-2 text-sm font-medium text-white ring-1 ring-inset ring-slate-600/50 shadow-md hover:from-slate-700 hover:to-slate-600 hover:shadow-lg transition-all duration-300 focus:outline-none sm:col-start-2 disabled:bg-slate-400 disabled:shadow-none", children:
                    loading ? 'Saving...' : 'Save Note' }, void 0, false
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

export default NoteFormModal;