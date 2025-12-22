import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessage, moveMessage, getFolders } from '../api';
import { format } from 'date-fns';
import { ArrowLeft, FolderInput } from 'lucide-react';

export default function MessageView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessage();
  }, [id]);

  const loadMessage = async () => {
    try {
      const { data } = await getMessage(id);
      setEmail(data);
      const fData = await getFolders();
      setFolders(fData.data);
    } catch (e) {
      console.error(e);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (folderId) => {
    try {
      await moveMessage(id, folderId);
      navigate(`/folder/${folderId}`);
    } catch (e) {
      alert("Failed to move message");
    }
  };

  if (loading || !email) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="relative group">
            <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                <FolderInput className="h-4 w-4 mr-1" />
                Move to...
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block z-10">
                {folders.map(f => (
                    <button
                        key={f.id}
                        onClick={() => handleMove(f.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        {f.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-6 sm:px-6 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{email.subject || '(No Subject)'}</h1>

          <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-900">
                    <span className="text-gray-500 font-normal">From:</span> {email.sender}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                    <span className="text-gray-500">To:</span> {email.recipients.join(', ')}
                </p>
            </div>
            <p className="text-sm text-gray-500">
                {format(new Date(email.timestamp + "Z"), 'PPpp')}
            </p>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-6 min-h-[300px] whitespace-pre-wrap text-gray-800 font-normal leading-relaxed">
            {email.body}
        </div>
      </div>
    </div>
  );
}
