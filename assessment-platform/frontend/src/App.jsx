import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antTheme } from 'antd';
import { PracticeProvider } from './context/PracticeContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './utils/theme';
import { Landing } from './pages/Landing';
import { SelectExam } from './pages/practice/SelectExam';
import { SelectSubject } from './pages/practice/SelectSubject';
import { SelectTopics } from './pages/practice/SelectTopics';
import { PracticeSession } from './pages/practice/PracticeSession';
import { Results } from './pages/practice/Results';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        ...(isDark ? darkTheme : lightTheme),
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm
      }}
    >
      <PracticeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/practice/select-exam" element={<SelectExam />} />
            <Route path="/practice/select-subject" element={<SelectSubject />} />
            <Route path="/practice/select-topics" element={<SelectTopics />} />
            <Route path="/practice/session" element={<PracticeSession />} />
            <Route path="/practice/results" element={<Results />} />
          </Routes>
        </BrowserRouter>
      </PracticeProvider>
    </ConfigProvider>
  );
}

function App() {
  try {
    return (
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    );
  } catch (error) {
    console.error('App Error:', error);
    return <div style={{ padding: 20 }}>Error loading app. Check console.</div>;
  }
}

export default App;
