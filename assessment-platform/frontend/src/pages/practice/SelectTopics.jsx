import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Checkbox, Collapse, Select, Divider, Tag } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, BookOutlined, ThunderboltOutlined, SafetyOutlined } from '@ant-design/icons';
import { usePractice } from '../../context/PracticeContext';
import { useTheme } from '../../context/ThemeContext';
import { examAPI } from '../../utils/api';

const { Title, Paragraph, Text } = Typography;

export const SelectTopics = () => {
  const navigate = useNavigate();
  const { selections, updateSelection } = usePractice();
  const { isDark } = useTheme();
  
  const [topics, setTopics] = useState([]);
  const [subtopicsByTopic, setSubtopicsByTopic] = useState({});
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState([]);
  const [questionType, setQuestionType] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [loading, setLoading] = useState(true);

  const questionTypes = [
    { value: 0, label: 'Single Choice MCQ' },
    { value: 1, label: 'Multiple Choice MCQ' },
    { value: 3, label: 'Fill in the Blanks' },
    { value: 4, label: 'Assertion & Reasoning' },
    { value: 5, label: 'True / False' }
  ];

  const difficulties = [
    { value: 0, label: 'Easy', icon: <ThunderboltOutlined />, color: '#10b981' },
    { value: 1, label: 'Normal', icon: <CheckCircleOutlined />, color: '#1DA1F2' },
    { value: 2, label: 'Hard', icon: <SafetyOutlined />, color: '#ef4444' }
  ];

  useEffect(() => {
    if (!selections.subject) {
      navigate('/practice/select-subject');
      return;
    }

    // Use batch endpoint to get topics with embedded subtopics (Drona pattern)
    const fetchTopicsWithSubtopics = async () => {
      setLoading(true);
      try {
        const response = await examAPI.getTopicsWithSubtopics(selections.subject._id);
        const topicsData = response.topics || [];
        
        setTopics(topicsData);
        
        // Build subtopics map from embedded data
        const subtopicsMap = {};
        topicsData.forEach(topic => {
          if (topic.subtopics && topic.subtopics.length > 0) {
            subtopicsMap[topic._id] = topic.subtopics;
          }
        });
        setSubtopicsByTopic(subtopicsMap);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
        setSubtopicsByTopic({});
      } finally {
        setLoading(false);
      }
    };

    fetchTopicsWithSubtopics();
  }, [selections.subject, navigate]);

  const toggleTopic = (topicId) => {
    const isCurrentlySelected = selectedTopicIds.includes(topicId);
    
    if (isCurrentlySelected) {
      // Deselect topic
      setSelectedTopicIds(prev => prev.filter(id => id !== topicId));
    } else {
      // Select topic and all its subtopics
      setSelectedTopicIds(prev => [...prev, topicId]);
      const subtopics = subtopicsByTopic[topicId] || [];
      const subtopicIds = subtopics.map(st => st._id);
      setSelectedSubtopicIds(prev => [...new Set([...prev, ...subtopicIds])]);
    }
  };

  const toggleSubtopic = (subtopicId) => {
    setSelectedSubtopicIds(prev =>
      prev.includes(subtopicId) ? prev.filter(id => id !== subtopicId) : [...prev, subtopicId]
    );
  };

  const selectAllTopics = (e) => {
    if (e.target.checked) {
      setSelectedTopicIds(topics.map(t => t._id));
    } else {
      setSelectedTopicIds([]);
    }
  };

  const selectAllSubtopicsForTopic = (topicId, e) => {
    const subtopics = subtopicsByTopic[topicId] || [];
    const subtopicIds = subtopics.map(st => st._id);
    
    if (e.target.checked) {
      setSelectedSubtopicIds(prev => [...new Set([...prev, ...subtopicIds])]);
    } else {
      setSelectedSubtopicIds(prev => prev.filter(id => !subtopicIds.includes(id)));
    }
  };

  const handleContinue = () => {
    const selectedQuestionType = questionTypes.find(qt => qt.value === questionType);
    const selectedDifficulty = difficulties.find(d => d.value === difficulty);
    
    updateSelection('topics', selectedTopicIds);
    updateSelection('subtopics', selectedSubtopicIds);
    updateSelection('questionType', selectedQuestionType);
    updateSelection('difficulty', selectedDifficulty);
    
    navigate('/practice/session', {
      state: {
        questionType: { value: selectedQuestionType.value, label: selectedQuestionType.label },
        difficulty: { value: selectedDifficulty.value, label: selectedDifficulty.label, color: selectedDifficulty.color },
        topics: selectedTopicIds,
        subtopics: selectedSubtopicIds,
        course: selections.course,
        subject: selections.subject
      }
    });
  };

  const canContinue = selectedTopicIds.length > 0 || selectedSubtopicIds.length > 0;
  const totalSelected = selectedTopicIds.length + selectedSubtopicIds.length;

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark ? '#0a0a0a' : '#f5f7fa',
      overflow: 'hidden'
    }}>
      {/* Fixed Header */}
      <div style={{ 
        padding: '24px 24px 0',
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0
      }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/practice/select-subject')}
          size="large"
          style={{ marginBottom: 24 }}
        >
          Back
        </Button>

        <div style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {selections.course?.name} • {selections.subject?.name}
          </Text>
          <Title level={2} style={{ marginBottom: 8, marginTop: 4 }}>Configure Practice</Title>
          <Paragraph style={{ fontSize: 16, color: isDark ? '#a6a6a6' : '#8c8c8c', marginBottom: 0 }}>
            Select topics, subtopics, question type, and difficulty
          </Paragraph>
        </div>
      </div>

      {/* Scrollable Topics Card */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%',
        minHeight: 0
      }}>
        <Card 
          style={{ 
            borderRadius: 16,
            border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`,
            background: isDark ? '#1a1a1a' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: 24, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' } }}
        >
          {/* Card Header - Static */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Space>
                <BookOutlined style={{ fontSize: 18, color: '#1DA1F2' }} />
                <Title level={4} style={{ margin: 0 }}>Chapters & Topics</Title>
              </Space>
              {totalSelected > 0 && (
                <Tag color="blue">{totalSelected} selected</Tag>
              )}
            </div>

            <Checkbox
              onChange={selectAllTopics}
              checked={selectedTopicIds.length === topics.length && topics.length > 0}
              style={{ marginBottom: 16, fontWeight: 500 }}
              disabled={loading || topics.length === 0}
            >
              Select All Chapters
            </Checkbox>
          </div>

          {/* Scrollable List - ONLY THIS SCROLLS */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading ? (
              <Text type="secondary">Loading topics...</Text>
            ) : topics.length === 0 ? (
              <Text type="secondary">No topics available for this subject.</Text>
            ) : (
              <Collapse
                ghost
                expandIconPosition="end"
                style={{ 
                  background: isDark ? '#0f0f0f' : '#fafafa',
                  borderRadius: 12
                }}
                items={topics.map(topic => {
                  const subtopics = subtopicsByTopic[topic._id] || [];
                  
                  return {
                    key: topic._id,
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Checkbox
                          checked={selectedTopicIds.includes(topic._id)}
                          onChange={() => toggleTopic(topic._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div style={{ flex: 1 }}>
                          <Text strong>{topic.name}</Text>
                        </div>
                      </div>
                    ),
                    children: (
                      <div style={{ paddingLeft: 32 }}>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          {subtopics.map(subtopic => (
                            <Checkbox
                              key={subtopic._id}
                              checked={selectedSubtopicIds.includes(subtopic._id)}
                              onChange={() => toggleSubtopic(subtopic._id)}
                              style={{ width: '100%' }}
                            >
                              <Text>{subtopic.name}</Text>
                            </Checkbox>
                          ))}
                        </Space>
                      </div>
                    ),
                    style: { 
                      marginBottom: 8,
                      background: isDark ? '#1a1a1a' : '#ffffff',
                      borderRadius: 8,
                      border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`
                    }
                  };
                })}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Fixed Footer */}
      <div style={{
        padding: '24px',
        background: isDark ? '#0a0a0a' : '#f5f7fa',
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0
      }}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Title level={5} style={{ marginBottom: 12, fontWeight: 600 }}>Question Type</Title>
            <Select
              value={questionType}
              onChange={setQuestionType}
              style={{ width: '100%' }}
              size="large"
              options={questionTypes}
            />
          </div>

          <div>
            <Title level={5} style={{ marginBottom: 12, fontWeight: 600 }}>Difficulty Level</Title>
            <Select
              value={difficulty}
              onChange={setDifficulty}
              style={{ width: '100%' }}
              size="large"
            >
              {difficulties.map(d => (
                <Select.Option key={d.value} value={d.value}>
                  <Space>
                    <span style={{ color: d.color }}>{d.icon}</span>
                    {d.label}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </div>

          <Button
            type="primary"
            size="large"
            block
            disabled={!canContinue}
            onClick={handleContinue}
            style={{ 
              height: 52,
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 12
            }}
          >
            Start Practice Session
          </Button>
        </Space>
      </div>
    </div>
  );
};
