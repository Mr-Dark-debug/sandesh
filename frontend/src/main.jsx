import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './pages/Layout';
import FolderView from './pages/FolderView';
import MessageView from './pages/MessageView';
import Compose from './pages/Compose';
import Admin from './pages/Admin';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <div className="p-8 text-center text-gray-500">Select a folder to view messages</div>,
        // Or redirect to first folder? But we don't know ID yet.
        // Layout redirects if folders loaded? Or just "Welcome".
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
        path: 'admin',
        element: <Admin />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
