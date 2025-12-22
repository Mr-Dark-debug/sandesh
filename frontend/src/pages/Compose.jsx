import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendMail } from '../api';
import { ArrowLeft, Send } from 'lucide-react';

export default function Compose() {
  const navigate = useNavigate();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Parse recipients
    const toList = to.split(',').map(s => s.trim()).filter(Boolean);
    const ccList = cc.split(',').map(s => s.trim()).filter(Boolean);

    if (toList.length === 0) {
        alert("Please specify at least one recipient");
        setLoading(false);
        return;
    }

    try {
      await sendMail({
        to: toList,
        cc: ccList,
        subject,
        body
      });
      navigate('/');
    } catch (e) {
      alert("Failed to send mail");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Discard
        </button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-6">
            <h3 className="text-base font-semibold leading-7 text-gray-900">New Message</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-6 sm:px-6 space-y-4">
          <div>
            <label htmlFor="to" className="block text-sm font-medium leading-6 text-gray-900">To</label>
            <div className="mt-1">
              <input
                type="text"
                name="to"
                id="to"
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="alice@hackathon, bob@hackathon"
                value={to}
                onChange={e => setTo(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="cc" className="block text-sm font-medium leading-6 text-gray-900">CC</label>
            <div className="mt-1">
              <input
                type="text"
                name="cc"
                id="cc"
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="observer@hackathon"
                value={cc}
                onChange={e => setCc(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">Subject</label>
            <div className="mt-1">
              <input
                type="text"
                name="subject"
                id="subject"
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium leading-6 text-gray-900">Message</label>
            <div className="mt-1">
              <textarea
                id="body"
                name="body"
                rows={12}
                className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
                value={body}
                onChange={e => setBody(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
              {!loading && <Send className="ml-2 h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
