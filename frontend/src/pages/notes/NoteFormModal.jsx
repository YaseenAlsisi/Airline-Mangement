import React, { useState } from 'react';
import { createNote } from '../../api/notes.api';
import { useTranslation } from 'react-i18next';

const NoteFormModal = ({
  isOpen,
  onClose,
  defaultEntityType = 'GENERAL',
  defaultEntityId = null
}) => {
  const { t } = useTranslation();
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
      setError(err.response?.data?.error?.message || t('notes.failedToCreate', 'Failed to create note'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">{t('notes.newNote', 'New Note')}</h3>
              
              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">{t('notes.contentLabel', 'Content *')}</label>
                  <textarea
                    name="content"
                    id="content"
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (content.trim() && !loading) {
                          handleSubmit(e);
                        }
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    id="showAdvanced"
                    name="showAdvanced"
                    type="checkbox"
                    checked={showAdvanced}
                    onChange={(e) => setShowAdvanced(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="showAdvanced" className="ml-2 block text-sm text-gray-900 cursor-pointer">{t('notes.linkRecord', 'Link to a specific record (Optional)')}</label>
                </div>

                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <label htmlFor="entityType" className="block text-sm font-medium leading-6 text-gray-700">{t('notes.entityType', 'Entity Type')}</label>
                      <select
                        name="entityType"
                        id="entityType"
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="GENERAL">{t('notes.entityGeneral', 'General Note')}</option>
                        <option value="AGENT">{t('notes.entityAgent', 'Agent')}</option>
                        <option value="AIRLINE">{t('notes.entityAirline', 'Airline')}</option>
                        <option value="TRANSACTION">{t('notes.entityTransaction', 'Transaction')}</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="entityId" className="block text-sm font-medium leading-6 text-gray-700">{t('notes.entityId', 'Entity ID')}</label>
                      <input
                        type="text"
                        name="entityId"
                        id="entityId"
                        disabled={entityType === 'GENERAL'}
                        value={entityType === 'GENERAL' ? '' : entityId}
                        onChange={(e) => setEntityId(e.target.value)}
                        placeholder="e.g. 123e4567-e89b..."
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-2 text-sm font-medium text-white ring-1 ring-inset ring-slate-600/50 shadow-md hover:from-slate-700 hover:to-slate-600 hover:shadow-lg transition-all duration-300 focus:outline-none sm:col-start-2 disabled:bg-slate-400 disabled:shadow-none"
                  >
                    {loading ? t('notes.saving', 'Saving...') : t('notes.saveNote', 'Save Note')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    {t('notes.cancel', 'Cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteFormModal;