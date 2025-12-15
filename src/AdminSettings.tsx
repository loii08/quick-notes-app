import React, { useState } from 'react';

const AdminSettings: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    defaultTheme: 'default',
  });

  const handleSave = () => {
    // Here you would save to Firestore or a global config
    alert('Settings saved! (This is a placeholder - implement actual save logic)');
  };

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
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;