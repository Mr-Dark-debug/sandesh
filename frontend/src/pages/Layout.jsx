import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { getFolders, createFolder } from '../api';
import { Inbox, Send, Folder, LogOut, Plus, User, Menu } from 'lucide-react';

export default function Layout() {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) {
      navigate('/login');
    } else {
      setUser(JSON.parse(u));
      fetchFolders();
    }
  }, []);

  const fetchFolders = async () => {
    try {
      const { data } = await getFolders();
      // Sort: Inbox, Sent, then others alpha
      const sorted = data.sort((a, b) => {
        if (a.name === 'Inbox') return -1;
        if (b.name === 'Inbox') return 1;
        if (a.name === 'Sent') return -1;
        if (b.name === 'Sent') return 1;
        return a.name.localeCompare(b.name);
      });
      setFolders(sorted);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    try {
      await createFolder(newFolderName);
      setNewFolderName('');
      setIsCreatingFolder(false);
      fetchFolders();
    } catch (e) {
      alert("Failed to create folder");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getIcon = (name) => {
    if (name === 'Inbox') return <Inbox className="h-4 w-4 mr-2" />;
    if (name === 'Sent') return <Send className="h-4 w-4 mr-2" />;
    return <Folder className="h-4 w-4 mr-2" />;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Sandesh</h1>
          </div>

          <div className="p-4">
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/compose'); }}
              className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {folders.map(f => (
              <Link
                key={f.id}
                to={`/folder/${f.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === `/folder/${f.id}` ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {getIcon(f.name)}
                {f.name}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-100">
              {!isCreatingFolder ? (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Folder
                </button>
              ) : (
                <form onSubmit={handleCreateFolder} className="px-3">
                  <input
                    autoFocus
                    type="text"
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Folder Name"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onBlur={() => !newFolderName && setIsCreatingFolder(false)}
                  />
                </form>
              )}
            </div>

             {/* Admin Link */}
             {user?.is_admin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-md ${location.pathname === '/admin' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <User className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700 truncate mr-2">
                {user?.username}
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
           <h1 className="text-lg font-bold text-gray-800">Sandesh</h1>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             <Menu className="h-6 w-6 text-gray-600" />
           </button>
        </div>

        <main className="flex-1 overflow-auto bg-white p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}
