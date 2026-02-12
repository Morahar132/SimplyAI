import React from 'react';
import { Question } from '../types';

const questions: Question[] = [
  {
    id: 1,
    text: "The excess pressure inside a soap bubble is equal to <tm-math> of kerosene (density <tm-math>). If",
    status: 'Skipped'
  },
  {
    id: 2,
    text: "A piece of wood is taken deep inside a long column of water and released...",
    status: 'Skipped'
  },
  {
    id: 3,
    text: "Calculate the terminal velocity of a rain drop of radius r...",
    status: 'Incorrect'
  },
  {
    id: 4,
    text: "Two capillaries of same length and radii in the ratio 1:2 are connected in series...",
    status: 'Skipped'
  },
  {
    id: 5,
    text: "Water rises to a height h in a capillary tube. If the length of capillary tube...",
    status: 'Incorrect'
  }
];

export const QuestionList: React.FC = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 relative transition-colors duration-200 h-full flex flex-col overflow-hidden">
      <div className="p-5 pb-2 flex-shrink-0 z-10 bg-surface-light dark:bg-surface-dark rounded-t-2xl">
        <h2 className="text-lg font-semibold">Question Review</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pt-2 custom-scrollbar space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="flex gap-3 group">
            {/* Question Number Badge */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium transition-colors
              ${q.status === 'Incorrect' 
                ? 'border-red-500/50 text-error bg-red-500/10' 
                : 'border-gray-300 dark:border-gray-600 text-text-secondary-light dark:text-text-secondary-dark group-hover:border-primary group-hover:text-primary'
              }`}
            >
              {q.id}
            </div>

            {/* Content */}
            <div className="flex-grow pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
              <p className="text-sm leading-relaxed text-text-primary-light dark:text-text-primary-dark mb-2">
                {q.text}
              </p>
              
              {/* Status Pill */}
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border
                ${q.status === 'Incorrect' 
                  ? 'bg-red-100 dark:bg-red-900/30 text-error border-red-200 dark:border-red-900/50' 
                  : 'bg-surface-variant-light dark:bg-surface-variant-dark text-text-secondary-light dark:text-text-secondary-dark border-gray-200 dark:border-gray-700'
                }`}
              >
                {q.status}
              </span>
            </div>
          </div>
        ))}
        {/* Extra padding at bottom to ensure content isn't cut off by scrollbar visual */}
        <div className="h-4"></div> 
      </div>
    </div>
  );
};