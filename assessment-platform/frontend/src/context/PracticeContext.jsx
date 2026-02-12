import { createContext, useContext, useState } from 'react';

const PracticeContext = createContext();

export const usePractice = () => useContext(PracticeContext);

export const PracticeProvider = ({ children }) => {
  const [selections, setSelections] = useState({
    course: null,
    subject: null,
    topics: [],
    subtopics: [],
    questionType: null,
    difficulty: null
  });

  const updateSelection = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const resetSelections = () => {
    setSelections({
      course: null,
      subject: null,
      topics: [],
      subtopics: [],
      questionType: null,
      difficulty: null
    });
  };

  return (
    <PracticeContext.Provider value={{ selections, updateSelection, resetSelections }}>
      {children}
    </PracticeContext.Provider>
  );
};
