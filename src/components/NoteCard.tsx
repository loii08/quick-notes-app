import React, { useState, useEffect, useRef } from 'react';
import { Note, Category } from '../types';
import { formatTimeAgo } from '../utils/dateUtils';

interface NoteCardProps {
  note: Note;
  categories: Category[];
  categoryColor: string;
  onUpdate: (id: string, content: string, categoryId: string, timestamp: number, silent?: boolean) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  isOnline: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  isSelectionActive: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  categories,
  categoryColor, 
  onUpdate, 
  onDelete,
  isActive,
  onActivate,
  onDeactivate,
  isOnline,
  isSelected,
  onToggleSelect,
  isSelectionActive
}) => {
  const [editContent, setEditContent] = useState(note.content);
  const [editCategoryId, setEditCategoryId] = useState(note.categoryId);
  
  const [editDate, setEditDate] = useState(() => {
    const date = new Date(note.timestamp);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  });

  // --- UNDO/REDO STATE ---
  const [history, setHistory] = useState<string[]>([note.content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const categoryName = categories.find(c => c.id === note.categoryId)?.name || 'General';

  useEffect(() => {
    if (isActive) {
      setEditContent(note.content);
      setEditCategoryId(note.categoryId);
      const date = new Date(note.timestamp);
      const offset = date.getTimezoneOffset() * 60000;
      setEditDate(new Date(date.getTime() - offset).toISOString().slice(0, 16));
      setHistory([note.content]);
      setHistoryIndex(0);
      isUndoRedoAction.current = false;
    }
  }, [isActive, note]);

  const prevActiveRef = useRef(isActive);
  const ignoreSaveRef = useRef(false);

  useEffect(() => {
    if (prevActiveRef.current && !isActive) {
        if (!ignoreSaveRef.current) {
            if (editContent.trim()) {
                const newTimestamp = new Date(editDate).getTime();
                if (editContent !== note.content || editCategoryId !== note.categoryId || newTimestamp !== note.timestamp) {
                    onUpdate(note.id, editContent, editCategoryId, newTimestamp, true);
                }
            }
        }
        ignoreSaveRef.current = false;
    }
    prevActiveRef.current = isActive;
  }, [isActive, editContent, editCategoryId, editDate, note, onUpdate]);


  useEffect(() => {
    if (!isActive) return;

    if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
    }

    const handler = setTimeout(() => {
        if (editContent !== history[historyIndex]) {
            setHistory(prev => {
                const newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push(editContent);
                return newHistory;
            });
            setHistoryIndex(prev => prev + 1);
        }
    }, 700);

    return () => clearTimeout(handler);
  }, [editContent, isActive, history, historyIndex]);


  const handleSave = () => {
    if (!editContent.trim()) return;
    ignoreSaveRef.current = true;
    const newTimestamp = new Date(editDate).getTime();
    onUpdate(note.id, editContent, editCategoryId, newTimestamp, false);
    onDeactivate();
  };

  const handleCancel = () => {
    ignoreSaveRef.current = true;
    onDeactivate();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditContent(history[newIndex]);
    }
  };

  return (
    <div 
      className={`w-full bg-white dark:bg-gray-800 transition-colors duration-200 border-l-4 ${isActive ? 'bg-indigo-50/20 dark:bg-indigo-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}`}
      style={{ borderLeftColor: categoryColor }}
    >
      <div className="px-5 py-4">
        <div className="flex justify-between items-center mb-1.5">
          <span 
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: categoryColor }}
          >
            {categoryName}
          </span>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-wide flex flex-col items-end">
            {formatTimeAgo(note.timestamp)}
            {note.synced === false && (
              <span className="font-bold text-[9px] uppercase tracking-wider">
                Draft
              </span>
            )}
          </div>
        </div>

        {isActive ? (
          <div className="animate-fade-in mt-2">
            <textarea
              className="w-full p-3 text-sm text-textMain dark:text-gray-200 border border-borderLight dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-indigo-900 min-h-[100px] resize-y bg-white dark:bg-gray-900"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
              placeholder="Edit your note..."
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </div>
                    <select 
                       value={editCategoryId}
                       onChange={e => setEditCategoryId(e.target.value)}
                       className="w-full text-xs pl-9 pr-3 py-2.5 border border-borderLight dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-indigo-900 cursor-pointer appearance-none shadow-sm"
                    >
                       {categories.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <input
                        type="datetime-local"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 border border-borderLight dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-indigo-900 cursor-pointer shadow-sm"
                    />
                </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onDelete(note.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  title="Delete Note"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                </button>
                
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                
                <button 
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  className="p-2 text-gray-400 hover:text-textMain hover:bg-primary/10 dark:hover:bg-indigo-900/30 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  title="Undo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" /></svg>
                </button>
                <button 
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                  className="p-2 text-gray-400 hover:text-textMain hover:bg-primary/10 dark:hover:bg-indigo-900/30 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                  title="Redo"
                >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6M21 10l-6-6" /></svg>
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-borderLight dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-sm transition-all"
                >
                Cancel
                </button>
                <button 
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-textOnPrimary bg-primary hover:bg-primaryDark dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg shadow-sm transition-all hover:shadow-md w-20 flex items-center justify-center"
                >
                Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="text-textMain dark:text-gray-200 text-[15px] leading-relaxed cursor-pointer whitespace-pre-wrap break-words"
            onClick={onActivate}
          >
            {note.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
