import React, { useEffect, useState } from 'react';
import { getNotes, deleteNote, createNote } from '../../api/notes.api';
import { useAuthStore } from '../../store/authStore';
import NoteFormModal from './NoteFormModal';
import { DocumentTextIcon, TrashIcon, ArrowUturnLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

export const NotesDataPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('notes.title', 'Notes'));
  const { hasPermission, user } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const canManage = hasPermission('NOTE_MANAGE');
  const canCreate = canManage || hasPermission('NOTE_CREATE');
  const canReply = canManage; // Only Admin can reply

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
    if (shouldRefresh) fetchNotes();
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('notes.confirmDelete', 'Are you sure you want to delete this note?'))) {
      try {
        await deleteNote(id);
        fetchNotes();
      } catch (e) {
        console.error('Failed to delete note', e);
      }
    }
  };

  const handleReplySubmit = async (parentId, entityType, entityId) => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      await createNote({
        content: replyContent,
        entityType: entityType,
        entityId: entityId,
        parentId: parentId
      });
      setReplyContent('');
      setReplyingTo(null);
      fetchNotes();
    } catch (e) {
      console.error('Failed to submit reply', e);
    } finally {
      setSubmittingReply(false);
    }
  };

  const renderNote = (note, isReply = false) => {
    // Assuming backend returns email or username in createdBy. Just matching if user exists.
    const canDelete = canManage || (user && user.email === note.createdBy);

    return (
      <li key={note.id} className={isReply ? "bg-slate-50 border-t border-slate-100" : ""}>
        <div className={`px-4 py-4 sm:px-6 transition-colors ${isReply ? 'pl-12' : 'hover:bg-slate-50'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 mt-1">
                {!isReply ? (
                  <DocumentTextIcon className="h-6 w-6 text-indigo-400" />
                ) : (
                  <ArrowUturnLeftIcon className="h-4 w-4 text-slate-400 transform rotate-180" />
                )}
              </div>
              <div className="ml-4">
                {!isReply && (
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    {note.entityType} {note.entityId ? `[${note.entityId.substring(0, 8)}]` : ''}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {note.createdBy}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {canReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === note.id ? null : note.id)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {t('notes.replyBtn', 'Reply')}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title={t('notes.deleteNote', 'Delete Note')}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-3 ml-10 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </div>

          {/* Reply Form */}
          {replyingTo === note.id && (
            <div className="mt-4 ml-10 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReplySubmit(note.id, note.entityType, note.entityId);
                  }}
                  className="relative"
                >
                  <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                    <label htmlFor={`reply-${note.id}`} className="sr-only">{t('notes.addReplyLabel', 'Add your reply')}</label>
                    <textarea
                      rows={2}
                      name="reply"
                      id={`reply-${note.id}`}
                      className="block w-full resize-none border-0 bg-transparent py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder={t('notes.writeReplyPlaceholder', 'Write a reply...')}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (replyContent.trim() && !submittingReply) {
                            handleReplySubmit(note.id, note.entityType, note.entityId);
                          }
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReply || !replyContent.trim()}
                      className="inline-flex items-center gap-x-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-slate-600/50 shadow-md hover:from-slate-700 hover:to-slate-600 hover:shadow-lg transition-all duration-300 focus:outline-none disabled:opacity-50"
                    >
                      {submittingReply ? t('notes.sending', 'Sending...') : t('notes.replyBtn', 'Reply')}
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Render nested replies */}
        {note.replies && note.replies.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {note.replies.map(reply => renderNote(reply, true))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-slate-900">{t('notes.title', 'System Notes')}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('notes.subtitle', 'Internal log of notes across the system. Can be general or tied to specific records.')}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-slate-600/50 shadow-md hover:from-slate-700 hover:to-slate-600 hover:shadow-lg transition-all duration-300 focus:outline-none"
            >
              {t('notes.addNote', 'Add Note')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden">
        <ul role="list" className="divide-y divide-slate-200">
          {loading ? (
            <li className="px-4 py-12 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-sm text-slate-500">{t('notes.loading', 'Loading notes...')}</p>
            </li>
          ) : notes.length === 0 ? (
            <li className="px-4 py-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">{t('notes.noNotesFound', 'No notes found')}</h3>
              <p className="mt-1 text-sm text-slate-500">{t('notes.getStarted', 'Get started by adding a new note.')}</p>
            </li>
          ) : (
            notes.map((note) => renderNote(note))
          )}
        </ul>
      </div>

      {isModalOpen && (
        <NoteFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default NotesDataPage;