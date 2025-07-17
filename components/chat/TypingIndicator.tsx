'use client';

import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
        </div>

        {/* Typing bubble */}
        <div className="bg-gray-100 px-4 py-3 rounded-2xl">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}