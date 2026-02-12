import React from 'react';
import { RotateCcw, Home } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 p-4 pb-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-colors duration-200">
      <div className="max-w-md mx-auto flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-text-primary-light dark:text-text-primary-dark font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
          <RotateCcw className="w-5 h-5" />
          Practice Again
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 text-sm">
          <Home className="w-5 h-5" />
          Go Home
        </button>
      </div>
    </div>
  );
};