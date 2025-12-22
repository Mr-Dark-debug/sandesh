import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMail, getFolders } from '../api';
import { format } from 'date-fns';

export default function FolderView() {
  const { id } = useParams();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState('');

  // We fetch folders to get the current folder name because the API returns ID
  // Optimally API would return folder metadata with mail list.
  useEffect(() => {
    loadMail();
  }, [id]);

  const loadMail = async () => {
    setLoading(true);
    try {
      const [mailRes, foldersRes] = await Promise.all([
        getMail(id),
        getFolders()
      ]);
      setEmails(mailRes.data);
      const current = foldersRes.data.find(f => f.id === parseInt(id));
      setFolderName(current ? current.name : 'Folder');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{folderName}</h2>

      {emails.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
          No messages in this folder
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <ul role="list" className="divide-y divide-gray-100">
            {emails.map((email) => (
              <li key={email.id} className={`relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 transition duration-150 ${!email.is_read ? 'bg-indigo-50/40' : ''}`}>
                <div className="flex min-w-0 gap-x-4 w-full">
                  <div className="min-w-0 flex-auto">
                    <p className={`text-sm font-semibold leading-6 text-gray-900 ${!email.is_read ? 'font-bold' : ''}`}>
                      <Link to={`/message/${email.id}`} className="hover:underline focus:outline-none">
                        <span className="absolute inset-x-0 -top-px bottom-0" />
                        {email.sender}
                      </Link>
                    </p>
                    <p className="mt-1 flex text-xs leading-5 text-gray-500">
                      <span className="truncate">{email.subject || '(No Subject)'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                   <p className="text-sm leading-6 text-gray-900">
                      {format(new Date(email.timestamp + "Z"), 'MMM d, h:mm a')}
                   </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
