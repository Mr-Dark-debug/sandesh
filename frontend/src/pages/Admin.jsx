import React, { useEffect, useState } from 'react';
import { getUsers, createUser } from '../api';
import { UserPlus, Shield } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (e) {
      setError("Failed to load users (Are you admin?)");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await createUser(username, password);
      setUsername('');
      setPassword('');
      setMsg('User created successfully');
      loadUsers();
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to create user");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Admin Console
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        {/* Create User Form */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-1 h-fit">
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-4">
                <h3 className="text-base font-semibold leading-7 text-gray-900 flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                </h3>
            </div>
            <form onSubmit={handleCreate} className="px-4 py-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        required
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {msg && <p className="text-sm text-green-600">{msg}</p>}

                <button
                    type="submit"
                    className="w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Create User
                </button>
            </form>
        </div>

        {/* User List */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-4">
                <h3 className="text-base font-semibold leading-7 text-gray-900 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    System Users
                </h3>
            </div>
            <ul role="list" className="divide-y divide-gray-100 px-4 py-2">
                {users.map((user) => (
                    <li key={user.id} className="flex items-center justify-between gap-x-6 py-4">
                        <div className="min-w-0">
                            <div className="flex items-start gap-x-3">
                                <p className="text-sm font-semibold leading-6 text-gray-900">{user.username}</p>
                                {user.is_admin && (
                                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">Admin</span>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}
