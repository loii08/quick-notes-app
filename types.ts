export interface Note {
  id: string;
  content: string;
  categoryId: string;
  timestamp: number; // Stored as ms since epoch
}

export interface Category {
  id: string;
  name: string;
}

export interface QuickAction {
  id: string;
  text: string;
  categoryId: string;
}

export type FilterMode = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
