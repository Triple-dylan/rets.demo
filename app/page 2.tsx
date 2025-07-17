'use client';

import { useState } from 'react';

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }]
        })
      });
      
      const data = await res.json();
      setResponse(data.message || 'No response received');
    } catch (error) {
      setResponse('Error connecting to API: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">RETS AI</h1>
        <p className="text-center text-gray-600 mb-8">Real Estate Transaction Assistant</p>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask RETS AI about real estate:
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Find me properties in Seattle with 4+ bedrooms under $750k"
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Send Message'}
          </button>
          
          {response && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Response:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}