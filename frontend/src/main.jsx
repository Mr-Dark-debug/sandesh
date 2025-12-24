import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Link, useNavigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastContext';
import { ConfirmationProvider } from './components/ConfirmationDialog';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Layout from './pages/Layout';
import FolderView from './pages/FolderView';
import MessageView from './pages/MessageView';
import Compose from './pages/Compose';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import SystemSettings from './pages/SystemSettings';
import Documentation from './pages/Documentation';
import './index.css';

// Welcome page component (shown after login in the app)
function Welcome() {
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center px-8 py-16 max-w-lg">
        {/* Decorative illustration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-[#D7CE93]/20 animate-pulse" />
          </div>
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#3D3D3D] mb-3">
          Welcome to सनdesh
        </h2>
        <p className="text-[#6B6B6B] leading-relaxed">
          Your local-first email system. Select a folder from the sidebar to view your messages,
          or click <span className="font-medium text-[#A3A380]">Compose</span> to write a new email.
        </p>

        {/* Quick tips */}
        <div className="mt-8 pt-6 border-t border-[#EFE8CE]">
          <p className="text-xs text-[#8B8B8B] uppercase tracking-wider mb-3">Quick Tips</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-[#EFE8CE]/50 text-left">
              <p className="font-medium text-[#3D3D3D]">Inbox</p>
              <p className="text-xs text-[#6B6B6B]">View received emails</p>
            </div>
            <div className="p-3 rounded-lg bg-[#EFE8CE]/50 text-left">
              <p className="font-medium text-[#3D3D3D]">Settings</p>
              <p className="text-xs text-[#6B6B6B]">Update your profile</p>
            </div>
          </div>

          {/* Documentation link */}
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 text-sm text-[#A3A380] hover:text-[#8B8B68] hover:bg-[#EFE8CE]/50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Read Documentation
          </a>
        </div>
      </div>
    </div>
  );
}

// Auth wrapper to check if user is authenticated
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
}

// Redirect to app if already logged in
function RedirectIfAuth({ children }) {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

// Router configuration
const router = createBrowserRouter([
  // Public landing page
  {
    path: '/welcome',
    element: <RedirectIfAuth><LandingPage /></RedirectIfAuth>,
  },
  // Login page
  {
    path: '/login',
    element: <RedirectIfAuth><Login /></RedirectIfAuth>,
  },
  // Documentation (public, no auth required)
  {
    path: '/docs',
    element: <Documentation />,
  },
  // Main app (requires auth)
  {
    path: '/app',
    element: <RequireAuth><Layout /></RequireAuth>,
    children: [
      {
        index: true,
        element: <Welcome />,
      },
      {
        path: 'folder/:id',
        element: <FolderView />,
      },
      {
        path: 'message/:id',
        element: <MessageView />,
      },
      {
        path: 'compose',
        element: <Compose />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'admin',
        element: <Admin />,
      },
      {
        path: 'admin/system',
        element: <SystemSettings />,
      },
    ],
  },
  // Legacy routes - redirect to new structure
  {
    path: '/',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/folder/:id',
    element: <Navigate to="/app/folder/:id" replace />,
  },
  {
    path: '/message/:id',
    element: <Navigate to="/app/message/:id" replace />,
  },
  {
    path: '/settings',
    element: <Navigate to="/app/settings" replace />,
  },
  {
    path: '/admin',
    element: <Navigate to="/app/admin" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/welcome" replace />,
  },
]);

// App root
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfirmationProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ConfirmationProvider>
  </React.StrictMode>
);
