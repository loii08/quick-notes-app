/**
 * Core type definitions for Quick Notes application
 */

export interface Note {
  id: string;
  content: string;
  categoryId: string;
  timestamp: number;
  deletedAt: number | null;
  synced?: boolean;
  quantity?: number;
  unitId?: string;
}

export type CategoryType = 'text' | 'quantifiable';

export interface Category {
  id: string;
  name: string;
  category_type: CategoryType;
  defaultUnitId?: string; // Default unit for quantifiable categories
}

export interface UnitOfMeasure {
  id: string;
  unit_name: string;
  abbreviation: string;
  description?: string;
  isBaseUnit?: boolean; // New field to identify base units
}

export interface RelatedUnit {
  id: string;
  baseUnitId: string;
  relatedUnitId: string;
  conversionFactor: number; // How many related units = 1 base unit
}

export interface QuickAction {
  id: string;
  text: string;
  categoryId: string;
  quantity?: number; // Always stored in base units
  unitId?: string; // The selected unit for display
  baseQuantity?: number; // Quantity in base units for conversion
  deletedAt?: number | null;
}

export type FilterMode = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
  isClosing?: boolean;
}

export type ToastType = 'success' | 'error' | 'info';

export interface AppSettings {
  appName: string;
  appSubtitle: string;
  appTheme: keyof typeof THEMES;
  darkMode: boolean;
  lastUpdated: number;
}

export const THEMES = {
  default: {
    primary: '#000000',
    primaryDark: '#333333',
    bgPage: '#F5F5F5',
    darkPrimary: '#FFFFFF',
    darkPrimaryDark: '#E5E5E5',
    textOnPrimary: '#FFFFFF',
    darkTextOnPrimary: '#000000'
  },
  pink: {
    primary: '#FFC0CB',
    primaryDark: '#FFB6C1',
    bgPage: '#F7F7F7',
    darkPrimary: '#ec4899',
    darkPrimaryDark: '#db2777',
    textOnPrimary: '#3A3A3A',
    darkTextOnPrimary: '#FFFFFF'
  },
  blue: {
    primary: '#BAE6FD',
    primaryDark: '#7DD3FC',
    bgPage: '#F0F9FF',
    darkPrimary: '#38bdf8',
    darkPrimaryDark: '#0ea5e9',
    textOnPrimary: '#1e293b',
    darkTextOnPrimary: '#FFFFFF'
  },
  green: {
    primary: '#4ade80',
    primaryDark: '#22c55e',
    bgPage: '#F0FDF4',
    darkPrimary: '#4ade80',
    darkPrimaryDark: '#22c55e',
    textOnPrimary: '#052e16',
    darkTextOnPrimary: '#FFFFFF'
  },
  purple: {
    primary: '#E9D5FF',
    primaryDark: '#D8B4FE',
    bgPage: '#FAF5FF',
    darkPrimary: '#a855f7',
    darkPrimaryDark: '#9333ea',
    textOnPrimary: '#4c1d95',
    darkTextOnPrimary: '#FFFFFF'
  },
  orange: {
    primary: '#FDBA74',
    primaryDark: '#FB923C',
    bgPage: '#FFF7ED',
    darkPrimary: '#F97316',
    darkPrimaryDark: '#EA580C',
    textOnPrimary: '#7C2D12',
    darkTextOnPrimary: '#FFFFFF'
  },
  teal: {
    primary: '#99F6E4',
    primaryDark: '#5EEAD4',
    bgPage: '#F0FDFA',
    darkPrimary: '#2DD4BF',
    darkPrimaryDark: '#14B8A6',
    textOnPrimary: '#134E4A',
    darkTextOnPrimary: '#FFFFFF'
  },
  red: {
    primary: '#FECACA',
    primaryDark: '#F87171',
    bgPage: '#FEF2F2',
    darkPrimary: '#EF4444',
    darkPrimaryDark: '#DC2626',
    textOnPrimary: '#7F1D1D',
    darkTextOnPrimary: '#FFFFFF'
  },
  slate: {
    primary: '#E2E8F0',
    primaryDark: '#CBD5E1',
    bgPage: '#F8FAFC',
    darkPrimary: '#64748B',
    darkPrimaryDark: '#475569',
    textOnPrimary: '#1E293B',
    darkTextOnPrimary: '#FFFFFF'
  }
} as const;
