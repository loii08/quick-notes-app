import React, { useState, useMemo } from 'react';
import ManageQuickActions from './components/ManageQuickActions';
import { getTodayDateString } from './utils/date-utils';
import { Note, QuickAction } from './types';

// Mock data for demonstration
const mockNotes: Note[] = [
  { id: '1', content: 'Note for today.', createdAt: new Date().toISOString() },
  { id: '2', content: 'Another note for today.', createdAt: new Date().toISOString() },
];

const mockActions: QuickAction[] = [
  { id: 'qa1', name: 'Create new note' },
  { id: 'qa2', name: 'Add a reminder' },
  { id: 'qa3', name: 'Start a timer' },
];

const App: React.FC = () => {
  // Initialize dateFilter state with today's date
  const [dateFilter, setDateFilter] = useState<string>(getTodayDateString());

  const filteredNotes = useMemo(() => {
    return mockNotes.filter(note => {
      const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
      return noteDate === dateFilter;
    });
  }, [dateFilter]);

  return (
    <div style={{ padding: '2rem' }}>
      <header>
        <h1>Quick Notes</h1>
        <div>
          <label htmlFor="date-filter">Filter by date: </label>
          <input
            type="date"
            id="date-filter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </header>
      <main>{/* Render filteredNotes here */}</main>
      <ManageQuickActions actions={mockActions} />
    </div>
  );
};

export default App;