import React, { useEffect, useState } from 'react';
import { getNotes } from '../../api/notes.api';
import { useAuthStore } from '../../store/authStore';
import NoteFormModal from './NoteFormModal';
import { DocumentTextIcon } from '@heroicons/react/24/outline';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const NotesDataPage = () => {
  const { hasPermission } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = hasPermission('NOTE_MANAGE');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await getNotes({ size: 50 }); // Fetch recent 50
      setNotes(res.data?.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchNotes();
    }
  };

  return (/*#__PURE__*/
    _jsxDEV("div", { children: [/*#__PURE__*/
      _jsxDEV("div", { className: "sm:flex sm:items-center mb-8", children: [/*#__PURE__*/
        _jsxDEV("div", { className: "sm:flex-auto", children: [/*#__PURE__*/
          _jsxDEV("h1", { className: "text-2xl font-bold leading-6 text-gray-900", children: "System Notes" }, void 0, false), /*#__PURE__*/
          _jsxDEV("p", { className: "mt-2 text-sm text-gray-700", children: "Internal log of notes across the system. Can be general or tied to specific records." }, void 0, false

          )] }, void 0, true
        ), /*#__PURE__*/
        _jsxDEV("div", { className: "mt-4 sm:ml-16 sm:mt-0 sm:flex-none", children:
          canManage && /*#__PURE__*/
          _jsxDEV("button", {
            onClick: () => setIsModalOpen(true),
            type: "button",
            className: "block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", children:
            "Add Note" }, void 0, false

          ) }, void 0, false

        )] }, void 0, true
      ), /*#__PURE__*/

      _jsxDEV("div", { className: "bg-white shadow sm:rounded-md", children: /*#__PURE__*/
        _jsxDEV("ul", { role: "list", className: "divide-y divide-gray-200", children:
          loading ? /*#__PURE__*/
          _jsxDEV("li", { className: "px-4 py-8 text-center text-sm text-gray-500", children: "Loading notes..." }, void 0, false) :
          notes.length === 0 ? /*#__PURE__*/
          _jsxDEV("li", { className: "px-4 py-8 text-center text-sm text-gray-500", children: "No notes found." }, void 0, false) :

          notes.map((note) => /*#__PURE__*/
          _jsxDEV("li", { children: /*#__PURE__*/
            _jsxDEV("div", { className: "px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors", children: [/*#__PURE__*/
              _jsxDEV("div", { className: "flex items-center justify-between", children: [/*#__PURE__*/
                _jsxDEV("div", { className: "flex items-center", children: [/*#__PURE__*/
                  _jsxDEV("div", { className: "flex-shrink-0", children: /*#__PURE__*/
                    _jsxDEV(DocumentTextIcon, { className: "h-6 w-6 text-gray-400" }, void 0, false) }, void 0, false
                  ), /*#__PURE__*/
                  _jsxDEV("div", { className: "ml-4 truncate", children: /*#__PURE__*/
                    _jsxDEV("div", { className: "text-sm font-medium text-indigo-600", children: [
                      note.entityType, " ", note.entityId ? `[ID: ${note.entityId.substring(0, 8)}...]` : ''] }, void 0, true
                    ) }, void 0, false
                  )] }, void 0, true
                ), /*#__PURE__*/
                _jsxDEV("div", { className: "ml-2 flex flex-shrink-0", children: /*#__PURE__*/
                  _jsxDEV("span", { className: "inline-flex rounded-full bg-green-50 px-2 text-xs font-semibold leading-5 text-green-800", children:
                    note.createdBy }, void 0, false
                  ) }, void 0, false
                )] }, void 0, true
              ), /*#__PURE__*/
              _jsxDEV("div", { className: "mt-2 sm:flex sm:justify-between", children: [/*#__PURE__*/
                _jsxDEV("div", { className: "sm:flex", children: /*#__PURE__*/
                  _jsxDEV("p", { className: "flex items-center text-sm text-gray-900 whitespace-pre-wrap", children:
                    note.content }, void 0, false
                  ) }, void 0, false
                ), /*#__PURE__*/
                _jsxDEV("div", { className: "mt-2 flex items-center text-sm text-gray-500 sm:mt-0", children: /*#__PURE__*/
                  _jsxDEV("p", { children: /*#__PURE__*/
                    _jsxDEV("time", { dateTime: note.createdAt, children:
                      new Date(note.createdAt).toLocaleString() }, void 0, false
                    ) }, void 0, false
                  ) }, void 0, false
                )] }, void 0, true
              )] }, void 0, true
            ) }, note.id, false
          )
          ) }, void 0, false

        ) }, void 0, false
      ),

      isModalOpen && /*#__PURE__*/
      _jsxDEV(NoteFormModal, {
        isOpen: isModalOpen,
        onClose: handleModalClose }, void 0, false
      )] }, void 0, true

    ));

};

export default NotesDataPage;