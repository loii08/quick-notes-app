import React from 'react';
import { QuickAction } from '@shared/types';

interface QuickActionsListProps {
  quickActions: QuickAction[];
  onEditQA: (qa: QuickAction) => void;
  onDeleteQA: (qaId: string) => void;
}

const QuickActionsList: React.FC<QuickActionsListProps> = ({ quickActions, onEditQA, onDeleteQA }) => {
  return (
    <div className="space-y-2">
      {quickActions.map((qa) => (
        <div key={qa.id} className="flex items-center justify-between p-3 bg-bgPage dark:bg-gray-700/50 rounded-xl border border-borderLight dark:border-gray-700">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-medium text-textMain dark:text-gray-200">{qa.text}</span>
            {qa.categoryId && (
              <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded">
                {qa.categoryId === 'general' ? 'General' : qa.categoryId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {qa.quantity && qa.unitId && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatQuantityWithUnit(qa.baseQuantity, qa.unitId)} = {qa.quantity} {qa.unitId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onEditQA(qa)} 
              className="p-1.5 text-gray-400 hover:text-textMain hover:bg-primary/20 dark:hover:bg-indigo-900/30 rounded disabled:text-gray-300 dark:disabled:text-gray-600 disabled:hover:bg-transparent"
            >
              Edit
            </button>
            <button 
              onClick={() => onDeleteQA(qa.id)} 
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:text-gray-300 dark:disabled:text-gray-600 disabled:hover:bg-transparent"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActionsList;
