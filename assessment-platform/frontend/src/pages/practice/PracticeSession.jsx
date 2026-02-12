import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Radio, Checkbox, Input, Space, Typography, Progress, Tag } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { examAPI } from '../../utils/api';
import { RichText } from '../../components/RichText';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Helper: Check if answer is correct
const checkAnswer = (type, userAnswer, correctAnswer) => {
  if (type === 0) return userAnswer === correctAnswer[0];
  if (type === 1) {
    if (!Array.isArray(userAnswer)) return false;
    return JSON.stringify([...userAnswer].sort()) === JSON.stringify([...correctAnswer].sort());
  }
  return false;
};

// Helper: Build session summary for AI review
const buildSessionSummary = (questions, answers) => {
  let correct = 0, wrong = 0, skipped = 0;
  
  const questionResults = questions.map(q => {
    const userAnswer = answers[q._id];
    const correctAnswer = q.answer.answer;
    
    let status = 'skipped';
    let userAnswerText = null;
    
    if (userAnswer !== undefined && userAnswer !== null) {
      const isCorrect = checkAnswer(q.type, userAnswer, correctAnswer);
      status = isCorrect ? 'correct' : 'wrong';
      if (isCorrect) correct++;
      else wrong++;
      
      // Convert answer to text
      if (q.type === 0 || q.type === 1) {
        const options = q.question?.options || [];
        const answerIndices = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        userAnswerText = answerIndices.map(idx => options[idx]?.d?.text || `Option ${idx}`).join(', ');
      } else {
        userAnswerText = String(userAnswer);
      }
    } else {
      skipped++;
    }
    
    // Get correct answer text
    const correctIndices = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    const options = q.question?.options || [];
    const correctAnswerText = (q.type === 0 || q.type === 1)
      ? correctIndices.map(idx => options[idx]?.d?.text || `Option ${idx}`).join(', ')
      : String(correctAnswer);
    
    const result = {
      questionText: q.question?.body?.text || 'Question',
      status,
      correctAnswer: correctAnswerText,
      userAnswer: userAnswerText
    };
    
    // Only include topic if it exists and is not 'Unknown'
    const topicName = q.topic?.name;
    if (topicName && topicName !== 'Unknown') {
      result.topic = topicName;
    }
    
    return result;
  });
  
  return {
    totalQuestions: questions.length,
    correctAnswers: correct,
    wrongAnswers: wrong,
    skippedQuestions: skipped,
    questions: questionResults
  };
};

export const PracticeSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchQuestions = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        const { questionType, difficulty, topics, subtopics, course, subject } = location.state || {};
        
        if (!questionType || !course || !subject) {
          console.error('Missing required filters');
          if (isMounted) setQuestions([]);
          return;
        }

        const requestBody = {
          courseId: course._id,
          subjectId: subject._id,
          topicIds: topics || [],
          subtopicIds: subtopics || [],
          difficulty: difficulty?.value ?? 1,
          type: questionType.value,
          limit: 20
        };

        console.log('Fetching questions with:', requestBody);
        const response = await examAPI.fetchQuestions(requestBody);
        console.log('Questions response:', response);
        
        if (isMounted) {
          setQuestions(response.questions || []);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        if (isMounted) setQuestions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuestions();
    
    return () => {
      isMounted = false;
    };
  }, [location.state]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const userAnswer = currentQuestion ? answers[currentQuestion._id] : undefined;
  const hasAnswered = userAnswer !== undefined && userAnswer !== null;

  // Calculate if answer is correct - MOVED TO COMPONENT LEVEL
  const isCorrect = (() => {
    if (!currentQuestion || !hasAnswered) return null;
    const correctAnswer = currentQuestion.answer.answer;
    
    if (currentQuestion.type === 0) {
      return userAnswer === correctAnswer[0];
    } else if (currentQuestion.type === 1) {
      if (!Array.isArray(userAnswer)) return false;
      return JSON.stringify([...userAnswer].sort()) === JSON.stringify([...correctAnswer].sort());
    }
    return null;
  })();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#0a0a0a' : '#f5f7fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Space direction="vertical" align="center">
          <Text style={{ fontSize: 16 }}>Loading questions...</Text>
        </Space>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#0a0a0a' : '#f5f7fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <Card style={{ maxWidth: 500, textAlign: 'center' }}>
          <Space direction="vertical" size={16}>
            <Text style={{ fontSize: 18 }}>No questions found</Text>
            <Text type="secondary">
              There are no questions available for the selected filters. Try different topics or difficulty level.
            </Text>
            <Button type="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#0a0a0a' : '#f5f7fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text>No questions available</Text>
      </div>
    );
  }

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion._id]: value });
    setShowExplanation(false);
  };

  const handleShowExplanation = () => {
    if (!hasAnswered) return;
    
    setShowExplanation(true);
    
    // Auto-advance after 3 seconds
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowExplanation(false);
      }
    }, 3000);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmit = () => {
    const sessionData = buildSessionSummary(questions, answers);
    navigate('/practice/results', { 
      state: { questions, answers, sessionData } 
    });
  };

  // CLEAN QUESTION TYPE RENDERING
  const renderQuestionByType = () => {
    const { type, question } = currentQuestion;
    const options = question?.options || [];

    // Type 0: Single Choice MCQ
    if (type === 0) {
      const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      
      return (
        <Radio.Group
          value={userAnswer === undefined ? null : userAnswer}
          onChange={(e) => handleAnswer(e.target.value)}
          disabled={showExplanation}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {options?.map((option, idx) => (
              <Radio
                key={option.v}
                value={option.v}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 12,
                  border: `2px solid ${
                    hasAnswered && showExplanation
                      ? currentQuestion.answer.answer[0] === option.v
                        ? '#52c41a'
                        : userAnswer === option.v
                        ? '#ff4d4f'
                        : isDark ? '#262626' : '#e8e8e8'
                      : isDark ? '#262626' : '#e8e8e8'
                  }`,
                  background: isDark ? '#1a1a1a' : '#ffffff',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <Text strong style={{ 
                    minWidth: 24,
                    color: hasAnswered && showExplanation
                      ? currentQuestion.answer.answer[0] === option.v
                        ? '#52c41a'
                        : userAnswer === option.v
                        ? '#ff4d4f'
                        : 'inherit'
                      : 'inherit'
                  }}>
                    {optionLabels[idx]}.
                  </Text>
                  <div style={{ flex: 1 }}>
                    <RichText content={option.d?.text || 'Option'} latexes={option.d?.latexes} />
                  </div>
                </div>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      );
    }

    // Type 1: Multiple Select
    if (type === 1) {
      const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      
      return (
        <Checkbox.Group
          value={userAnswer || []}
          onChange={(values) => handleAnswer(values)}
          disabled={showExplanation}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {options?.map((option, idx) => (
              <Checkbox
                key={option.v}
                value={option.v}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 12,
                  border: `2px solid ${isDark ? '#262626' : '#e8e8e8'}`,
                  background: isDark ? '#1a1a1a' : '#ffffff',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <Text strong style={{ minWidth: 24 }}>{optionLabels[idx]}.</Text>
                  <div style={{ flex: 1 }}>
                    <RichText content={option.d?.text || 'Option'} latexes={option.d?.latexes} />
                  </div>
                </div>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      );
    }

    // Type 2: Numerical
    if (type === 2) {
      return (
        <Input
          type="number"
          size="large"
          placeholder="Enter your answer"
          value={userAnswer || ''}
          onChange={(e) => handleAnswer(e.target.value)}
          style={{ width: '100%', maxWidth: 300 }}
        />
      );
    }

    // Type 3: Fill in the Blanks
    if (type === 3) {
      return (
        <div>
          <Input
            size="large"
            placeholder="Type your answer here"
            value={userAnswer || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            style={{ width: '100%', maxWidth: 500 }}
          />
        </div>
      );
    }

    // Type 4: Assertion-Reason
    if (type === 4) {
      const bodyText = currentQuestion.question?.body?.text || '';
      
      // Parse Assertion and Reason from body text
      // Pattern: <b>Assertion</b>: text <br /><b>Reason</b> text
      const parts = bodyText.split(/<br\s*\/?>\s*<b>Reason<\/b>/i);
      
      let assertionText = '';
      let reasonText = '';
      
      if (parts.length >= 2) {
        // Extract assertion (remove <b>Assertion</b>: prefix)
        assertionText = parts[0].replace(/<b>Assertion<\/b>:?\s*/i, '').trim();
        // Extract reason (already split)
        reasonText = parts[1].trim();
      }
      
      return (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: isDark ? '#1a1a1a' : '#f5f7fa',
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
          }}>
            <Text strong style={{ fontSize: 15 }}>Assertion (A): </Text>
            <RichText 
              content={assertionText}
              latexes={currentQuestion.question?.body?.latexes}
            />
          </div>
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: isDark ? '#1a1a1a' : '#f5f7fa',
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
          }}>
            <Text strong style={{ fontSize: 15 }}>Reason (R): </Text>
            <RichText 
              content={reasonText}
              latexes={currentQuestion.question?.body?.latexes}
            />
          </div>
          <Radio.Group
            value={userAnswer === undefined ? null : userAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            disabled={showExplanation}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {options?.map((option, idx) => {
                const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
                return (
                  <Radio
                    key={option.v}
                    value={option.v}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: 12,
                      border: `2px solid ${isDark ? '#262626' : '#e8e8e8'}`,
                      background: isDark ? '#1a1a1a' : '#ffffff',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <Text strong style={{ minWidth: 24 }}>{optionLabels[idx]}.</Text>
                      <div style={{ flex: 1 }}>
                        <RichText content={option.d?.text || 'Option'} latexes={option.d?.latexes} />
                      </div>
                    </div>
                  </Radio>
                );
              })}
            </Space>
          </Radio.Group>
        </Space>
      );
    }

    // Type 5: True/False
    if (type === 5) {
      return (
        <Radio.Group
          value={userAnswer === undefined ? null : userAnswer}
          onChange={(e) => handleAnswer(e.target.value)}
          disabled={showExplanation}
          style={{ width: '100%' }}
        >
          <Space size={16}>
            <Radio.Button value={true} style={{ height: 48, lineHeight: '48px', fontSize: 16, minWidth: 100 }}>
              True
            </Radio.Button>
            <Radio.Button value={false} style={{ height: 48, lineHeight: '48px', fontSize: 16, minWidth: 100 }}>
              False
            </Radio.Button>
          </Space>
        </Radio.Group>
      );
    }

    // Type 5: Assertion & Reasoning
    if (type === 5) {
      const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      
      return (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: isDark ? '#1a1a1a' : '#f5f7fa',
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
          }}>
            <Text strong style={{ fontSize: 15 }}>Assertion (A): </Text>
            <RichText 
              content={currentQuestion.question?.assertion?.text}
              latexes={currentQuestion.question?.assertion?.latexes}
            />
          </div>
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: isDark ? '#1a1a1a' : '#f5f7fa',
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
          }}>
            <Text strong style={{ fontSize: 15 }}>Reason (R): </Text>
            <RichText 
              content={currentQuestion.question?.reason?.text}
              latexes={currentQuestion.question?.reason?.latexes}
            />
          </div>
          <Radio.Group
            value={userAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {options?.map((option, idx) => (
                <Radio
                  key={option.v}
                  value={option.v}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 12,
                    border: `2px solid ${isDark ? '#262626' : '#e8e8e8'}`,
                    background: isDark ? '#1a1a1a' : '#ffffff',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <Text strong style={{ minWidth: 24 }}>{optionLabels[idx]}.</Text>
                    <div style={{ flex: 1 }}>
                      <RichText content={option.d?.text || 'Option'} latexes={option.d?.latexes} />
                    </div>
                  </div>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Space>
      );
    }

    // Type 6: Subjective
    if (type === 6) {
      return (
        <TextArea
          rows={6}
          placeholder="Write your answer here..."
          value={userAnswer || ''}
          onChange={(e) => handleAnswer(e.target.value)}
          style={{ width: '100%' }}
        />
      );
    }

    return <Text type="secondary">Unsupported question type</Text>;
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark ? '#0a0a0a' : '#f5f7fa',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '24px 24px 0',
        maxWidth: 900,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            size="large"
          >
            Exit
          </Button>
          <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
            Question {currentIndex + 1} of {questions.length}
          </Tag>
        </div>
        <Progress percent={progress} showInfo={false} strokeColor="#1DA1F2" />
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        maxWidth: 900,
        margin: '0 auto',
        width: '100%',
        minHeight: 0
      }}>
        <Card
          style={{
            borderRadius: 16,
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`,
            background: isDark ? '#1a1a1a' : '#ffffff'
          }}
          styles={{ body: { padding: 24 } }}
        >
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <div>
              {/* Only show question text if not Assertion-Reason (type 4) */}
              {currentQuestion.type !== 4 && (
                <div style={{ 
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
                }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: 600,
                    lineHeight: 1.5,
                    display: 'block'
                  }}>
                    <RichText 
                      content={currentQuestion.question?.body?.text} 
                      latexes={currentQuestion.question?.body?.latexes}
                    />
                  </Text>
                </div>
              )}
              {renderQuestionByType()}
            </div>

            {hasAnswered && (
              <Button
                type="link"
                onClick={handleShowExplanation}
                style={{ padding: 0 }}
              >
                {showExplanation ? 'Hide' : 'Show'} Explanation
              </Button>
            )}

            {/* FIXED: Safe rendering with optional chaining */}
            {showExplanation && hasAnswered && isCorrect !== null && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: isCorrect
                    ? 'rgba(82, 196, 26, 0.1)'
                    : 'rgba(255, 77, 79, 0.1)',
                  border: `1px solid ${isCorrect ? '#52c41a' : '#ff4d4f'}`
                }}
              >
                <Space direction="vertical" size={8}>
                  <Space>
                    {isCorrect ? (
                      <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                    ) : (
                      <CloseOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                    )}
                    <Text strong style={{ color: isCorrect ? '#52c41a' : '#ff4d4f' }}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </Text>
                  </Space>
                  <Paragraph style={{ marginBottom: 0 }}>
                    <RichText 
                      content={currentQuestion.answer?.explanation?.text}
                      latexes={currentQuestion.answer?.explanation?.latexes}
                    />
                  </Paragraph>
                </Space>
              </div>
            )}
          </Space>
        </Card>
      </div>

      <div style={{
        padding: '16px 24px',
        background: isDark ? '#0a0a0a' : '#f5f7fa',
        maxWidth: 900,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <Button
            size="large"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            style={{ minWidth: 120 }}
          >
            Previous
          </Button>
          
          {currentIndex === questions.length - 1 ? (
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
              style={{ minWidth: 120 }}
            >
              Submit
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              icon={<ArrowRightOutlined />}
              style={{ minWidth: 120 }}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
