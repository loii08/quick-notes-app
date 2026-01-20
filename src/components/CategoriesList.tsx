import React from 'react';
import { Category, CategoryType } from '@shared/types';

interface CategoriesListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories, onEditCategory, onDeleteCategory }) => {
  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between p-3 bg-bgPage dark:bg-gray-700/50 rounded-xl border border-borderLight dark:border-gray-700">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-medium text-textMain dark:text-gray-200">{cat.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                cat.category_type === 'quantifiable' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {cat.category_type === 'quantifiable' ? '📊' : '📝'} {cat.category_type}
              </span>
              {cat.id !== 'general' && (
                <button 
                  onClick={() => onEditCategory(cat)} 
                  className="p-1.5 text-gray-400 hover:text-textMain hover:bg-primary/20 dark:hover:bg-indigo-900/30 rounded disabled:text-gray-300 dark:disabled:text-gray-600 disabled:hover:bg-transparent"
                >
                  Edit
                </button>
              )}
              <button 
                onClick={() => onDeleteCategory(cat.id)} 
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:text-gray-300 dark:disabled:text-gray-600 disabled:hover:bg-transparent"
                disabled={cat.id === 'general'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoriesList;
