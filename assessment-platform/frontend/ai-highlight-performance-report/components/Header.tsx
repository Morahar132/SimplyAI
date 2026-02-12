import React from 'react';
import { Trophy } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="text-center pt-2 pb-2">
      <div className="mb-3 inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 dark:bg-red-500/20">
        <Trophy className="text-error w-8 h-8" strokeWidth={1.5} />
      </div>
      <h1 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
        Need Improvement
      </h1>
      <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
        You scored 0.0% accuracy
      </p>
    </div>
  );
};