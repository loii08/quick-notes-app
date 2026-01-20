import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileAdd, setShowMobileAdd] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement>(null);

  return {
    currentCategory,
    setCurrentCategory,
    filterMode,
    setFilterMode,
    customDate,
    setCustomDate,
    isScrolled,
    setIsScrolled,
    isMenuOpen,
    setIsMenuOpen,
    activeNoteId,
    setActiveNoteId,
    selectedNoteIds,
    setSelectedNoteIds,
    showLoginModal,
    setShowLoginModal,
    showMobileAdd,
    setShowMobileAdd,
    location,
    navigate,
    menuRef
  };
};
