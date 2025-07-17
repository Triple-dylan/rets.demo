'use client';

import React from 'react';
import { ChatMessage } from '@/types/message';

interface MessageBubbleProps {
  message: ChatMessage;
  children?: React.ReactNode;
}

export default function MessageBubble({ message, children }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-4xl ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div className={`
          px-4 py-3 rounded-2xl text-sm
          ${isUser 
            ? 'bg-blue-600 text-white ml-auto' 
            : 'bg-gray-100 text-gray-900'
          }
        `}>
          {message.content}
        </div>

        {/* Additional content (like property results) */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'order-1 ml-3 bg-blue-600' : 'order-2 mr-3 bg-gray-300'
      }`}>
        {isUser ? (
          <span className="text-white text-sm font-medium">U</span>
        ) : (
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
        )}
      </div>
    </div>
  );
}