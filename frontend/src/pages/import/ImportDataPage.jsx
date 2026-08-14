import React, { useState, useRef } from 'react';
import { importTransactions } from '../../api/import.api';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const ImportDataPage = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setFile(null);
      setError("Please select a valid Excel file (.xlsx or .xls)");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importTransactions(file);
      setResult(res.data?.content || null);
    } catch (err) {
      setError(err.response?.data?.error?.message || "An error occurred during import");
    } finally {
      setUploading(false);
    }
  };

  return (/*#__PURE__*/
    _jsxDEV("div", { className: "max-w-4xl mx-auto py-8", children: [/*#__PURE__*/
      _jsxDEV("div", { className: "md:flex md:items-center md:justify-between mb-8", children: /*#__PURE__*/
        _jsxDEV("div", { className: "min-w-0 flex-1", children: [/*#__PURE__*/
          _jsxDEV("h2", { className: "text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight", children: "Import Transactions" }, void 0, false

          ), /*#__PURE__*/
          _jsxDEV("p", { className: "mt-2 text-sm text-gray-500", children: "Upload an Excel file to bulk import transactions. The calculation engine will automatically process commissions and margins based on active Price Lists." }, void 0, false

          )] }, void 0, true
        ) }, void 0, false
      ), /*#__PURE__*/

      _jsxDEV("div", { className: "bg-white shadow sm:rounded-lg overflow-hidden", children: /*#__PURE__*/
        _jsxDEV("div", { className: "px-4 py-5 sm:p-6", children: [/*#__PURE__*/
          _jsxDEV("div", {
            className: `mt-2 flex justify-center rounded-lg border border-dashed px-6 py-20 ${
            dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-900/25'}`,

            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop, children: /*#__PURE__*/

            _jsxDEV("div", { className: "text-center", children: [/*#__PURE__*/
              _jsxDEV(DocumentArrowUpIcon, { className: "mx-auto h-12 w-12 text-gray-300", "aria-hidden": "true" }, void 0, false), /*#__PURE__*/
              _jsxDEV("div", { className: "mt-4 flex text-sm leading-6 text-gray-600 justify-center", children: [/*#__PURE__*/
                _jsxDEV("label", {
                  htmlFor: "file-upload",
                  className: "relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500", children: [/*#__PURE__*/

                  _jsxDEV("span", { children: "Upload a file" }, void 0, false), /*#__PURE__*/
                  _jsxDEV("input", { id: "file-upload", name: "file-upload", type: "file", className: "sr-only", ref: fileInputRef, onChange: handleFileChange, accept: ".xlsx, .xls" }, void 0, false)] }, void 0, true
                ), /*#__PURE__*/
                _jsxDEV("p", { className: "pl-1", children: "or drag and drop" }, void 0, false)] }, void 0, true
              ), /*#__PURE__*/
              _jsxDEV("p", { className: "text-xs leading-5 text-gray-600", children: ".xlsx up to 10MB" }, void 0, false)] }, void 0, true
            ) }, void 0, false
          ),

          file && /*#__PURE__*/
          _jsxDEV("div", { className: "mt-4 p-4 bg-gray-50 rounded-md border flex items-center justify-between", children: [/*#__PURE__*/
            _jsxDEV("div", { children: [/*#__PURE__*/
              _jsxDEV("span", { className: "font-medium text-gray-900", children: "Selected file:" }, void 0, false), " ", file.name] }, void 0, true
            ), /*#__PURE__*/
            _jsxDEV("button", {
              type: "button",
              onClick: handleUpload,
              disabled: uploading,
              className: "inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400", children:

              uploading ? 'Processing...' : 'Start Import' }, void 0, false
            )] }, void 0, true
          ),

          error && /*#__PURE__*/
          _jsxDEV("div", { className: "mt-4 rounded-md bg-red-50 p-4", children: /*#__PURE__*/
            _jsxDEV("div", { className: "flex", children: /*#__PURE__*/
              _jsxDEV("div", { className: "ml-3", children: [/*#__PURE__*/
                _jsxDEV("h3", { className: "text-sm font-medium text-red-800", children: "Error" }, void 0, false), /*#__PURE__*/
                _jsxDEV("div", { className: "mt-2 text-sm text-red-700", children: /*#__PURE__*/
                  _jsxDEV("p", { children: error }, void 0, false) }, void 0, false
                )] }, void 0, true
              ) }, void 0, false
            ) }, void 0, false
          ),

          result && /*#__PURE__*/
          _jsxDEV("div", { className: "mt-6 border-t border-gray-100 pt-6", children: [/*#__PURE__*/
            _jsxDEV("h3", { className: "text-lg font-medium leading-6 text-gray-900 mb-4", children: "Import Results" }, void 0, false), /*#__PURE__*/
            _jsxDEV("dl", { className: "grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6", children: [/*#__PURE__*/
              _jsxDEV("div", { className: "overflow-hidden rounded-lg bg-white px-4 py-5 shadow border", children: [/*#__PURE__*/
                _jsxDEV("dt", { className: "truncate text-sm font-medium text-gray-500", children: "Total Rows Processed" }, void 0, false), /*#__PURE__*/
                _jsxDEV("dd", { className: "mt-1 text-3xl font-semibold tracking-tight text-gray-900", children: result.totalRows }, void 0, false)] }, void 0, true
              ), /*#__PURE__*/
              _jsxDEV("div", { className: "overflow-hidden rounded-lg bg-green-50 px-4 py-5 shadow border border-green-200", children: [/*#__PURE__*/
                _jsxDEV("dt", { className: "truncate text-sm font-medium text-green-800", children: "Successful Imports" }, void 0, false), /*#__PURE__*/
                _jsxDEV("dd", { className: "mt-1 text-3xl font-semibold tracking-tight text-green-900", children: result.successfulImports }, void 0, false)] }, void 0, true
              ), /*#__PURE__*/
              _jsxDEV("div", { className: "overflow-hidden rounded-lg bg-red-50 px-4 py-5 shadow border border-red-200", children: [/*#__PURE__*/
                _jsxDEV("dt", { className: "truncate text-sm font-medium text-red-800", children: "Failed Imports" }, void 0, false), /*#__PURE__*/
                _jsxDEV("dd", { className: "mt-1 text-3xl font-semibold tracking-tight text-red-900", children: result.failedImports }, void 0, false)] }, void 0, true
              )] }, void 0, true
            ),

            result.errors && result.errors.length > 0 && /*#__PURE__*/
            _jsxDEV("div", { className: "mt-4", children: [/*#__PURE__*/
              _jsxDEV("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Error Log" }, void 0, false), /*#__PURE__*/
              _jsxDEV("div", { className: "bg-gray-50 p-4 rounded-md h-48 overflow-y-auto border text-sm font-mono", children:
                result.errors.map((err, idx) => /*#__PURE__*/
                _jsxDEV("div", { className: "text-red-600 mb-1", children: err }, idx, false)
                ) }, void 0, false
              )] }, void 0, true
            )] }, void 0, true

          ), /*#__PURE__*/

          _jsxDEV("div", { className: "mt-8 border-t pt-6", children: [/*#__PURE__*/
            _jsxDEV("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Expected Excel Format (No Headers)" }, void 0, false), /*#__PURE__*/
            _jsxDEV("div", { className: "overflow-x-auto", children: /*#__PURE__*/
              _jsxDEV("table", { className: "min-w-full divide-y divide-gray-300 text-sm text-gray-500", children: [/*#__PURE__*/
                _jsxDEV("thead", { children: /*#__PURE__*/
                  _jsxDEV("tr", { children: [/*#__PURE__*/
                    _jsxDEV("th", { className: "py-2 text-left", children: "Col 0" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("th", { className: "py-2 text-left", children: "Col 1" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("th", { className: "py-2 text-left", children: "Col 2" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("th", { className: "py-2 text-left", children: "Col 3" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("th", { className: "py-2 text-left", children: "Col 4" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("th", { className: "py-2 text-left", children: "Col 5" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("th", { className: "py-2 text-left", children: "Col 6" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("th", { className: "py-2 text-left", children: "Col 7" }, void 0, false)] }, void 0, true
                  ) }, void 0, false
                ), /*#__PURE__*/
                _jsxDEV("tbody", { className: "divide-y divide-gray-200", children: [/*#__PURE__*/
                  _jsxDEV("tr", { children: [/*#__PURE__*/
                    _jsxDEV("td", { className: "py-2 font-mono", children: "Ticket Number" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2 font-mono", children: "PNR" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2 font-mono", children: "Passenger Name" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2 font-mono", children: "Airline Code" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2 font-mono", children: "Agent Code" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2 font-mono", children: "Issue Date (YYYY-MM-DD)" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2 font-mono", children: "Base Fare" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2 font-mono", children: "Tax" }, void 0, false)] }, void 0, true
                  ), /*#__PURE__*/
                  _jsxDEV("tr", { className: "bg-gray-50", children: [/*#__PURE__*/
                    _jsxDEV("td", { className: "py-2", children: "001-1234567890" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2", children: "ABCDEF" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2", children: "John Doe" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2", children: "AA" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2", children: "AGT-01" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2", children: "2026-08-14" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2", children: "500.00" }, void 0, false), /*#__PURE__*/
                    _jsxDEV("td", { className: "py-2", children: "50.00" }, void 0, false)] }, void 0, true
                  )] }, void 0, true
                )] }, void 0, true
              ) }, void 0, false
            )] }, void 0, true
          )] }, void 0, true
        ) }, void 0, false
      )] }, void 0, true
    ));

};

export default ImportDataPage;