import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import ToastContainer from '@/components/ToastContainer';
import { useAuthStatus } from '@/useAuthStatus';
import { ToastMessage, ToastType } from '@/types';

const AdminSettings: React.FC = () => {
  const { user } = useAuthStatus();
  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    defaultTheme: 'default',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Only load settings if user is authenticated
    if (!user || !db) return;

    // Initial load
    loadSettings();
    
    // Listen for real-time changes
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setGlobalSettings({
          maintenanceMode: data.maintenanceMode || false,
          allowRegistration: data.allowRegistration !== false,
          defaultTheme: data.defaultTheme || 'default',
        });
      }
    }, (error) => {
      console.error('Error listening to settings:', error);
      showToast('Failed to sync settings', 'error');
    });
    
    return unsubscribe;
  }, [user, db]);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setGlobalSettings({
          maintenanceMode: data.maintenanceMode || false,
          allowRegistration: data.allowRegistration !== false,
          defaultTheme: data.defaultTheme || 'default',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showToast = (message: string, type: ToastType = 'success') => {
    const newToast: ToastMessage = { id: generateId(), message, type, isClosing: false };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === newToast.id ? { ...t, isClosing: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 300);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, isClosing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...globalSettings,
        lastUpdated: new Date(),
        updatedBy: user.uid,
      });
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Settings</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Maintenance Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Put the app in maintenance mode for all users</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={globalSettings.maintenanceMode}
              onChange={(e) => setGlobalSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Allow New Registrations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Allow new users to register accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={globalSettings.allowRegistration}
              onChange={(e) => setGlobalSettings(prev => ({ ...prev, allowRegistration: e.target.checked }))}
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Theme
          </label>
          <select
            value={globalSettings.defaultTheme}
            onChange={(e) => setGlobalSettings(prev => ({ ...prev, defaultTheme: e.target.value }))}
            disabled={saving}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          >
            <option value="default">Default</option>
            <option value="pink">Pink</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
            <option value="teal">Teal</option>
            <option value="red">Red</option>
            <option value="slate">Slate</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminSettings;