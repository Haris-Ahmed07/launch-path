'use client';

import { Mail } from 'lucide-react';

export default function SendMessageButton() {
  return (
    <button 
      onClick={() => window.location.href = 'mailto:haris.14787@gmail.com'}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
    >
      <Mail className="h-4 w-4 mr-2" />
      Send a Message
    </button>
  );
}
