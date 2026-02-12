import React from 'react';

export interface Question {
  id: number;
  text: string;
  status: 'Skipped' | 'Incorrect';
  mathContent?: {
    term: string;
    description: string;
  };
}

export interface StatItem {
  label: string;
  value: number;
  colorClass?: string;
}

export interface Insight {
  type: 'warning' | 'error';
  title: string;
  description: React.ReactNode;
}