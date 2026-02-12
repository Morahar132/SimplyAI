import React from 'react';
import { StatItem } from '../types';

const stats: StatItem[] = [
  { label: 'Total', value: 20 },
  { label: 'Done', value: 2, colorClass: 'text-primary' },
  { label: 'Right', value: 0, colorClass: 'text-success' },
  { label: 'Wrong', value: 2, colorClass: 'text-error' },
];

export const StatsGrid: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-between gap-2 px-1">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex-1 min-w-[80px] bg-surface-light dark:bg-surface-dark rounded-xl p-2.5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center transition-colors duration-200"
        >
          <span className="text-[10px] uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark tracking-wider">
            {stat.label}
          </span>
          <span className={`text-base font-bold mt-0.5 ${stat.colorClass || ''}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};