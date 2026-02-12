import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Space, Statistic } from 'antd';
import { ArrowLeftOutlined, ExperimentOutlined, ThunderboltOutlined, CalculatorOutlined, BookOutlined } from '@ant-design/icons';
import { usePractice } from '../../context/PracticeContext';
import { useTheme } from '../../context/ThemeContext';
import { examAPI } from '../../utils/api';

const { Title, Paragraph, Text } = Typography;

const subjectIcons = {
  Physics: ThunderboltOutlined,
  Chemistry: ExperimentOutlined,
  Mathematics: CalculatorOutlined
};

const subjectColors = {
  Physics: '#1DA1F2',
  Chemistry: '#10b981',
  Mathematics: '#f59e0b'
};

export const SelectSubject = () => {
  const navigate = useNavigate();
  const { selections, updateSelection } = usePractice();
  const { isDark } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selections.course) {
      navigate('/practice/select-exam');
      return;
    }
    
    const fetchSubjects = async () => {
      try {
        const response = await examAPI.getSubjects(selections.course._id);
        setSubjects(response.subjects || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setSubjects([]);
      }
    };
    
    fetchSubjects();
  }, [selections.course, navigate]);

  const handleSelect = (subject) => {
    setSelected(subject._id);
    updateSelection('subject', subject);
    setTimeout(() => navigate('/practice/select-topics'), 300);
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
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0
      }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/practice/select-exam')}
          size="large"
          style={{ marginBottom: 24 }}
        >
          Back
        </Button>

        <div style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {selections.course?.name}
          </Text>
          <Title level={2} style={{ marginBottom: 8, marginTop: 4 }}>Select Subject</Title>
          <Paragraph style={{ fontSize: 16, color: isDark ? '#a6a6a6' : '#8c8c8c', marginBottom: 0 }}>
            Choose the subject you want to practice
          </Paragraph>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 24px 24px',
        maxWidth: 1000,
        margin: '0 auto',
        width: '100%'
      }}>
        <Row gutter={[24, 24]}>
          {subjects.map((subject) => {
            const Icon = subjectIcons[subject.name] || BookOutlined;
            const color = subjectColors[subject.name] || '#1DA1F2';
            const isSelected = selected === subject._id;
            
            return (
              <Col xs={24} sm={12} md={8} key={subject._id}>
                <Card
                  hoverable
                  className={`selection-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(subject)}
                  style={{
                    borderRadius: 16,
                    border: isSelected 
                      ? `2px solid ${color}`
                      : `2px solid ${isDark ? '#262626' : '#e8e8e8'}`,
                    background: isDark ? '#1a1a1a' : '#ffffff'
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ fontSize: 24, color: '#fff' }} />
                    </div>
                    
                    <div>
                      <Title level={4} style={{ marginBottom: 8 }}>{subject.name}</Title>
                      <Statistic 
                        value={subject.questionsCount} 
                        suffix="questions"
                        valueStyle={{ 
                          fontSize: 16, 
                          color: isDark ? '#a6a6a6' : '#8c8c8c',
                          fontWeight: 500
                        }}
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};
