import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Note, Category, QuickAction, UnitOfMeasure, RelatedUnit, CategoryType, FilterMode } from '@shared/types';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useNavigation } from '../hooks/useNavigation';
import { useToast } from '../contexts/ToastContext';
import Modal from '@shared/components/Modal';
import ConfirmationModal from '@shared/components/ConfirmationModal';
import ToastContainer from '@shared/components/ToastContainer';
import OnboardingModal from '@shared/components/OnboardingModal';
import SkeletonLoader from '@shared/components/SkeletonLoader';
import LandingPage from '@shared/components/LandingPage';
import LoginModal from '@shared/components/LoginModal';
import AppLoader from '@shared/components/AppLoader';
import NotesList from './NotesList';
import CategoriesList from './CategoriesList';
import QuickActionsList from './QuickActionsList';

const App: React.FC = () => {
  const auth = useAuth();
  const data = useData();
  const navigation = useNavigation();
  const { showToast } = useToast();

  // Memoized values
  const filteredNotes = useMemo(() => {
    let filtered = data.notes.filter(note => !note.deletedAt);
    
    if (navigation.currentCategory === 'all') {
      return filtered;
    }
    
    return filtered.filter(note => note.categoryId === navigation.currentCategory);
  }, [data.notes, navigation.currentCategory]);

  const activeCategoryName = useMemo(() => {
    if (navigation.currentCategory === 'all') return 'All Notes';
    const category = data.categories.find(c => c.id === navigation.currentCategory);
    return category?.name || 'General';
  }, [navigation.currentCategory, data.categories]);

  return (
    <div className="min-h-screen bg-bgPage dark:bg-gray-900 text-textMain dark:text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface dark:bg-gray-800 text-textMain dark:text-white shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-textMain dark:text-white">
                {data.appName}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {data.appSubtitle}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {auth.user ? (
                <>
                  <button 
                    onClick={() => navigation.setIsMenuOpen(!navigation.isMenuOpen)}
                    className="p-2 text-gray-500 hover:text-textMain dark:hover:text-white rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </button>
                </>
              ) : (
                <button onClick={() => navigation.setShowLoginModal(true)} className="px-5 py-2 bg-white/25 hover:bg-white/40 text-textOnPrimary rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {auth.user ? (
        <main className="relative container mx-auto px-4 pt-32 max-w-3xl flex-1">
          {auth.isInitialDataLoading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* Notes Input */}
              <div className="hidden md:block bg-surface dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-borderLight dark:border-gray-700 mb-8">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={data.inputValue}
                    onChange={(e) => data.setInputValue(e.target.value)}
                    placeholder={`Add a note to ${activeCategoryName}...`}
                    className="w-full p-4 bg-bgPage dark:bg-transparent border-2 border-borderLight dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-lg text-textMain dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  
                  {/* Quantity and Unit fields for quantifiable categories */}
                  {(() => {
                    const selectedCategory = data.categories.find(c => c.id === (navigation.currentCategory === 'all' ? 'general' : navigation.currentCategory));
                    const isQuantifiable = selectedCategory?.category_type === 'quantifiable';
                    
                    if (!isQuantifiable) return null;
                    
                    return (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={data.noteQuantity}
                          onChange={(e) => data.setNoteQuantity(e.target.value)}
                          className="flex-1 p-3 border border-borderLight dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-primary bg-bgPage dark:bg-gray-700 dark:text-white"
                          min="0"
                          step="any"
                        />
                        <select
                          value={data.noteUnitId}
                          onChange={(e) => data.setNoteUnitId(e.target.value)}
                          className="flex-1 p-3 border border-borderLight dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-300 bg-bgPage dark:bg-gray-700 focus:outline-none focus:border-primary"
                        >
                          <option value="">Select Unit</option>
                          {data.units.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.abbreviation} ({unit.unit_name})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
                  
                  <button 
                    onClick={() => {/* handleAddNote will be implemented */}}
                    disabled={auth.syncStatus === 'syncing'}
                    className="w-full px-8 bg-primary hover:bg-primaryDark text-textOnPrimary font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {auth.syncStatus === 'syncing' ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : "Add Note"}
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 mb-6 p-1.5 backdrop-blur-md rounded-full border border-borderLight/50 shadow-sm transition-all duration-500 ease-in-out origin-top sticky w-full">
                <button
                   onClick={() => { navigation.setCurrentCategory('all'); navigation.setFilterMode('all'); }}
                   className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-all whitespace-nowrap ${navigation.filterMode === 'all' ? 'bg-primary text-textOnPrimary border-primary shadow-sm' : 'bg-white border-borderLight text-gray-500 hover:bg-gray-50'}`}
                 >
                   All Time
                 </button>
                 
                 <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar px-1">
                    {['today', 'yesterday', 'week', 'month'].map(mode => (
                       <button
                         key={mode}
                         onClick={() => { navigation.setCurrentCategory(mode); navigation.setFilterMode(mode); }}
                         className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-all whitespace-nowrap ${navigation.filterMode === mode ? 'bg-primary text-textOnPrimary border-primary shadow-sm' : 'bg-white border-borderLight text-gray-500 hover:bg-gray-50'}`}
                       >
                         {mode}
                       </button>
                    ))}
                 </div>

                 <div className="shrink-0 relative">
                    <div className={`p-1.5 rounded-full border transition-all ${navigation.filterMode === 'custom' ? 'bg-primary text-textOnPrimary border-primary shadow-sm' : 'bg-white border-borderLight text-gray-500 hover:bg-gray-50'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <input 
                      type="date" 
                      value={navigation.customDate}
                      onChange={(e) => { navigation.setCustomDate(e.target.value); navigation.setFilterMode('custom'); }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                 </div>
              </div>

              {/* Notes List */}
              <div className="animate-fade-in pb-10">
                <NotesList
                  notes={filteredNotes}
                  selectedNoteIds={navigation.selectedNoteIds}
                  onToggleNoteSelection={navigation.setSelectedNoteIds}
                  onDeleteNote={(noteId) => {/* handleDeleteNote */}}
                  onEditNote={(noteId, content) => {/* handleEditNote */}}
                  units={data.units}
                  activeNoteId={navigation.activeNoteId}
                />
              </div>
            </>
          )}
        </main>
      ) : (
        <LandingPage onLoginClick={() => navigation.setShowLoginModal(true)} />
      )}

      {/* Mobile FAB */}
      {auth.user && (
        <button 
          onClick={() => navigation.setShowMobileAdd(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-textOnPrimary shadow-2xl shadow-primary/40 flex items-center justify-center rounded-full active:scale-90 transition-transform z-40"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={data.toasts} setToasts={data.setToasts} />
    </div>
  );
};

export default App;
