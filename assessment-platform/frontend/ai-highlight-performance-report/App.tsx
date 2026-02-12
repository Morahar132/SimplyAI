import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { AIInsights } from './components/AIInsights';
import { QuestionList } from './components/QuestionList';
import { BottomNav } from './components/BottomNav';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  // Initialize theme based on preference or default to dark
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-200">
      {/* Theme Toggle */}
      <ThemeToggle isDark={isDark} toggle={toggleTheme} />

      {/* Main Container - Flex Column */}
      <div className="w-full max-w-md h-full flex flex-col relative">
        
        {/* Top Static Section: Header + Stats + Insights */}
        <div className="flex-shrink-0 px-4 pt-4 pb-4 space-y-6 z-10">
          <Header />
          <StatsGrid />
          <AIInsights />
        </div>

        {/* Scrollable Section: Question List */}
        {/* Added padding bottom to account for fixed BottomNav */}
        <div className="flex-1 min-h-0 px-4 pb-28">
          <QuestionList />
        </div>

        {/* Fixed Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default App;