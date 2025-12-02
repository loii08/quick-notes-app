import React, { useState, useMemo } from 'react';
import { QuickAction } from '../types';

interface ManageQuickActionsProps {
  actions: QuickAction[];
}

const ManageQuickActions: React.FC<ManageQuickActionsProps> = ({ actions }) => {
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedActions = useMemo(() => {
    const sorted = [...actions].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });

    if (!filter) {
      return sorted;
    }

    return sorted.filter(action =>
      action.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [actions, filter, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Manage Quick Actions</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Filter actions..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={toggleSortOrder} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          Sort by Name ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
        </button>
      </div>
      {/* Render your actions list here using filteredAndSortedActions */}
    </div>
  );
};

export default ManageQuickActions;