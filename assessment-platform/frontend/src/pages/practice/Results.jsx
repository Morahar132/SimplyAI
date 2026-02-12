import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Spin } from 'antd';
import { 
  TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, HomeOutlined, 
  BulbOutlined, WarningOutlined, StarOutlined, ExclamationCircleOutlined, InfoCircleOutlined,
  BookOutlined, QuestionCircleOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { RichText } from '../../components/RichText';
import { examAPI } from '../../utils/api';

const { Title, Text } = Typography;

// Map insight categories to icons and colors
const getCategoryStyle = (category) => {
  const lower = category.toLowerCase();
  
  if (lower.includes('knowledge gap') || lower.includes('gap')) {
    return { icon: <BulbOutlined />, color: '#faad14', label: 'Knowledge Gap' };
  }
  if (lower.includes('topic weakness') || lower.includes('weakness') || lower.includes('vulnerable')) {
    return { icon: <WarningOutlined />, color: '#ff4d4f', label: 'Topic Weakness' };
  }
  if (lower.includes('confidence') || lower.includes('skip') || lower.includes('hesitation')) {
    return { icon: <QuestionCircleOutlined />, color: '#ff7a45', label: 'Confidence Issue' };
  }
  if (lower.includes('confusion') || lower.includes('pitfall') || lower.includes('mistake')) {
    return { icon: <ExclamationCircleOutlined />, color: '#f5222d', label: 'Conceptual Confusion' };
  }
  if (lower.includes('strong') || lower.includes('excellent') || lower.includes('good')) {
    return { icon: <ThunderboltOutlined />, color: '#52c41a', label: 'Strong Performance' };
  }
  
  return { icon: <InfoCircleOutlined />, color: '#1DA1F2', label: category };
};

export const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  
  const { questions = [], answers = {}, sessionData } = location.state || {};

  // AI Review state
  const [aiInsights, setAiInsights] = useState([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);
  const [loadingStage, setLoadingStage] = useState(0);

  // Fetch AI review on mount
  useEffect(() => {
    if (!sessionData) {
      setAiLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const fetchAIReview = async () => {
      const stages = [
        'Reading your answers',
        'Identifying patterns',
        'Generating insights'
      ];
      
      // Simulate stage progression
      const stageInterval = setInterval(() => {
        if (isMounted) {
          setLoadingStage(prev => {
            if (prev < stages.length - 1) return prev + 1;
            clearInterval(stageInterval);
            return prev;
          });
        }
      }, 1000);
      
      try {
        const response = await examAPI.getAIReview(sessionData);
        
        if (!isMounted) return;
        
        clearInterval(stageInterval);
        
        // Map backend insights to UI format with dynamic icons
        const mappedInsights = response.insights.map(insight => {
          const style = getCategoryStyle(insight.category);
          return {
            icon: style.icon,
            color: style.color,
            title: insight.category,
            message: insight.message
          };
        });
        
        setAiInsights(mappedInsights);
      } catch (error) {
        if (!isMounted) return;
        console.error('AI Review error:', error);
        setAiError('Unable to generate AI insights');
      } finally {
        if (isMounted) {
          setAiLoading(false);
        }
      }
    };
    
    fetchAIReview();
    
    return () => {
      isMounted = false;
    };
  }, [sessionData]);

  const calculateResults = () => {
    let correct = 0;
    let incorrect = 0;
    let attempted = Object.keys(answers).length;

    questions.forEach(q => {
      const userAnswer = answers[q._id];
      if (userAnswer === undefined) return;

      const correctAnswer = q.answer.answer;
      let isCorrect = false;

      if (q.type === 0) {
        isCorrect = userAnswer === correctAnswer[0];
      } else if (q.type === 1) {
        isCorrect = JSON.stringify([...userAnswer].sort()) === JSON.stringify([...correctAnswer].sort());
      }

      if (isCorrect) correct++;
      else incorrect++;
    });

    const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0;

    return {
      total: questions.length,
      attempted,
      correct,
      incorrect,
      unattempted: questions.length - attempted,
      accuracy
    };
  };

  const results = calculateResults();

  const getPerformanceMessage = () => {
    if (results.accuracy >= 80) return { text: 'Excellent!', color: '#52c41a', icon: '🎉' };
    if (results.accuracy >= 60) return { text: 'Good Job!', color: '#1DA1F2', icon: '👍' };
    if (results.accuracy >= 40) return { text: 'Keep Practicing', color: '#faad14', icon: '💪' };
    return { text: 'Need Improvement', color: '#ff4d4f', icon: '📚' };
  };

  const performance = getPerformanceMessage();

  // Spinner animation CSS
  const spinnerStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark ? '#0a0a0a' : '#f5f7fa',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px 24px 16px',
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0,
        textAlign: 'center'
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(255, 77, 79, 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12
        }}>
          <TrophyOutlined style={{ fontSize: 32, color: performance.color }} />
        </div>
        <Title level={2} style={{ marginBottom: 4, fontSize: 24 }}>
          {performance.icon} {performance.text}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          You scored {results.accuracy}% accuracy
        </Text>
      </div>

      {/* Stats Grid */}
      <div style={{
        padding: '0 24px 16px',
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <div style={{
            flex: 1,
            background: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: 12,
            padding: '12px 8px',
            textAlign: 'center',
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
          }}>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, color: isDark ? '#8c8c8c' : '#595959', display: 'block' }}>
              TOTAL
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 700, display: 'block', marginTop: 4 }}>
              {results.total}
            </Text>
          </div>
          <div style={{
            flex: 1,
            background: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: 12,
            padding: '12px 8px',
            textAlign: 'center',
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
          }}>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, color: isDark ? '#8c8c8c' : '#595959', display: 'block' }}>
              DONE
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 700, display: 'block', marginTop: 4, color: '#1DA1F2' }}>
              {results.attempted}
            </Text>
          </div>
          <div style={{
            flex: 1,
            background: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: 12,
            padding: '12px 8px',
            textAlign: 'center',
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
          }}>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, color: isDark ? '#8c8c8c' : '#595959', display: 'block' }}>
              RIGHT
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 700, display: 'block', marginTop: 4, color: '#52c41a' }}>
              {results.correct}
            </Text>
          </div>
          <div style={{
            flex: 1,
            background: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: 12,
            padding: '12px 8px',
            textAlign: 'center',
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
          }}>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, color: isDark ? '#8c8c8c' : '#595959', display: 'block' }}>
              WRONG
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 700, display: 'block', marginTop: 4, color: '#ff4d4f' }}>
              {results.incorrect}
            </Text>
          </div>
        </div>
      </div>

      {/* AI Review Section - Full Width Hero */}
      <div style={{
        padding: '0 24px',
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0
      }}>
        <div style={{
          background: isDark ? '#1a1a1a' : '#0f1419',
          borderRadius: 24,
          padding: 32,
          border: `1px solid ${isDark ? 'rgba(29, 161, 242, 0.3)' : 'rgba(29, 161, 242, 0.2)'}`,
          boxShadow: '0 0 20px rgba(29, 161, 242, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          maxHeight: '60vh'
        }}>
          {/* Decorative blur */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            background: 'rgba(29, 161, 242, 0.15)',
            filter: 'blur(50px)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexShrink: 0 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1DA1F2 0%, #1C8CD1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(29, 161, 242, 0.4)',
                animation: aiLoading ? 'pulse 2s ease-in-out infinite' : 'none'
              }}>
                <StarOutlined style={{ color: '#fff', fontSize: 28 }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 700 }}>AI Insights</Title>
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#1DA1F2',
                    background: 'rgba(29, 161, 242, 0.15)',
                    padding: '4px 12px',
                    borderRadius: 12,
                    border: '1px solid rgba(29, 161, 242, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Premium Insights
                  </span>
                </div>
              </div>
            </div>

            {/* Loading State with Stages */}
            {aiLoading && (
              <div style={{ textAlign: 'center', padding: '20px 0', flexShrink: 0 }}>
                <Space direction="vertical" align="center" size={20}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    border: '4px solid rgba(29, 161, 242, 0.2)',
                    borderTop: '4px solid #1DA1F2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <div>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                      {['Reading your answers', 'Identifying patterns', 'Generating insights'][loadingStage]}
                    </Text>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: i <= loadingStage ? '#1DA1F2' : 'rgba(29, 161, 242, 0.3)',
                          transition: 'all 0.3s ease'
                        }} />
                      ))}
                    </div>
                  </div>
                </Space>
              </div>
            )}

            {/* Error State */}
            {aiError && (
              <div style={{
                padding: 20,
                borderRadius: 16,
                background: 'rgba(255, 77, 79, 0.1)',
                border: '1px solid rgba(255, 77, 79, 0.3)',
                textAlign: 'center',
                flexShrink: 0
              }}>
                <Text style={{ color: '#ff4d4f', fontSize: 14 }}>
                  {aiError}
                </Text>
              </div>
            )}

            {/* Insights - Scrollable */}
            {!aiLoading && !aiError && aiInsights.length > 0 && (
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                minHeight: 0, 
                paddingRight: 4,
                maxHeight: 'calc(60vh - 180px)'
              }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} style={{
                      padding: 14,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      animation: `fadeInUp 0.5s ease ${idx * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 8px 16px ${insight.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ 
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${insight.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: insight.color,
                          fontSize: 18,
                          flexShrink: 0,
                          boxShadow: `0 2px 8px ${insight.color}20`
                        }}>
                          {insight.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            color: insight.color,
                            marginBottom: 6
                          }}>
                            {insight.title}
                          </div>
                          <Text style={{ 
                            color: '#e8e8e8', 
                            fontSize: 13, 
                            lineHeight: 1.5, 
                            display: 'block',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {insight.message}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </Space>
              </div>
            )}

            {/* Empty State */}
            {!aiLoading && !aiError && aiInsights.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 20px', flexShrink: 0 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <Text style={{ color: '#8c8c8c', fontSize: 14, display: 'block' }}>
                  Complete more questions to get personalized AI insights
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: 24, flexShrink: 0 }} />

      {/* Fixed Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px 20px',
        background: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(245, 247, 250, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`,
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 20
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 12 }}>
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => navigate('/practice/select-exam')}
            style={{ 
              flex: 1,
              height: 48,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 12
            }}
          >
            Practice Again
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{ 
              flex: 1,
              height: 48,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(29, 161, 242, 0.25)'
            }}
          >
            Go Home
          </Button>
        </div>
      </div>

      {/* Spinner animation CSS */}
      <style>{spinnerStyle}</style>
    </div>
  );
};
