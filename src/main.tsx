import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/App';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import './styles/index.css';
import { InstallPWAProvider } from '@shared/components/InstallPWAContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <InstallPWAProvider>
        <BrowserRouter>
          <React.Suspense fallback={<div>Loading...</div>}>
            <AppRoutes />
          </React.Suspense>
        </BrowserRouter>
      </InstallPWAProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
