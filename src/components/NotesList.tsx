import React from 'react';
import { Note, UnitOfMeasure } from '@shared/types';
import { formatQuantityWithUnit } from '@shared/utils/unitConversion';
import NoteCard from '../features/notes/NoteCard';

interface NotesListProps {
  notes: Note[];
  selectedNoteIds: Set<string>;
  onToggleNoteSelection: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  units: UnitOfMeasure[];
  activeNoteId: string | null;
}

const NotesList: React.FC<NotesListProps> = ({ 
  notes, 
  selectedNoteIds, 
  onToggleNoteSelection, 
  onDeleteNote, 
  onEditNote, 
  units, 
  activeNoteId 
}) => {
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          isSelected={selectedNoteIds.has(note.id)}
          onToggleSelect={() => onToggleNoteSelection(note.id)}
          onDelete={() => onDeleteNote(note.id)}
          onEdit={() => onEditNote(note.id, note.content)}
          units={units}
          activeNoteId={activeNoteId}
        />
      ))}
    </div>
  );
};

export default NotesList;
