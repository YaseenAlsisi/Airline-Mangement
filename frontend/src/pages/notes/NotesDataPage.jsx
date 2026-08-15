import React, { useEffect, useState } from 'react';
import { getNotes, deleteNote } from '../../api/notes.api';
import { useAuthStore } from '../../store/authStore';
import NoteFormModal from './NoteFormModal';
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';

export const NotesDataPage = () => {
  const { hasPermission, user } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = hasPermission('NOTE_MANAGE');
  const canDeleteAny = hasPermission('NOTE_DELETE_ANY') || hasPermission('SYSTEM_MANAGE');
  
  const currentUser = user?.username;

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await getNotes({ size: 50 });
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(id);
        fetchNotes();
      } catch (e) {
        console.error("Failed to delete note", e);
        alert("Failed to delete note");
      }
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">System Notes</h1>
          <p className="mt-2 text-sm text-gray-700">Internal log of notes across the system. Can be general or tied to specific records.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add Note
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-8 text-center text-sm text-gray-500">Loading notes...</li>
          ) : notes.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-500">No notes found.</li>
          ) : (
            notes.map((note) => {
              const isOwner = currentUser && note.createdBy === currentUser;
              const showDelete = canDeleteAny || isOwner;
              
              return (
                <li key={note.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4 truncate">
                          <div className="text-sm font-medium text-indigo-600">
                            {note.entityType} {note.entityId ? `[ID: ${note.entityId.substring(0, 8)}...]` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex flex-shrink-0 gap-2 items-center">
                        <span className="inline-flex rounded-full bg-green-50 px-2 text-xs font-semibold leading-5 text-green-800">
                          {note.createdBy}
                        </span>
                        {showDelete && (
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete Note"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-900 whitespace-pre-wrap">{note.content}</p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          <time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleString()}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {isModalOpen && (
        <NoteFormModal isOpen={isModalOpen} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default NotesDataPage;