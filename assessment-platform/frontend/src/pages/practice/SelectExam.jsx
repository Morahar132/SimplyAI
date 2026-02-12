import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Space, Badge } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, ExperimentOutlined, CalculatorOutlined } from '@ant-design/icons';
import { usePractice } from '../../context/PracticeContext';
import { useTheme } from '../../context/ThemeContext';
import { examAPI } from '../../utils/api';

const { Title, Paragraph, Text } = Typography;

const examIcons = {
  'JEE Main': TrophyOutlined,
  'NEET': ExperimentOutlined,
  'JEE Advanced': CalculatorOutlined
};

export const SelectExam = () => {
  const navigate = useNavigate();
  const { updateSelection } = usePractice();
  const { isDark } = useTheme();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await examAPI.getCourses();
        const coursesList = response.courses || [];
        
        // Sort: JEE Main first, then others
        const sorted = coursesList.sort((a, b) => {
          if (a.name === 'JEE Main') return -1;
          if (b.name === 'JEE Main') return 1;
          if (a.name === 'JEE Advanced') return 1;
          if (b.name === 'JEE Advanced') return -1;
          return 0;
        });
        
        setCourses(sorted);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  const handleSelect = (course) => {
    setSelected(course._id);
    updateSelection('course', course);
    setTimeout(() => navigate('/practice/select-subject'), 300);
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
          onClick={() => navigate('/')}
          size="large"
          style={{ marginBottom: 24 }}
        >
          Back
        </Button>

        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Select Your Exam</Title>
          <Paragraph style={{ fontSize: 16, color: isDark ? '#a6a6a6' : '#8c8c8c', marginBottom: 0 }}>
            Choose the exam you're preparing for
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
          {courses.map((course) => {
            const Icon = examIcons[course.name];
            const isSelected = selected === course._id;
            
            return (
              <Col xs={24} sm={12} md={8} key={course._id}>
                <Card
                  hoverable
                  className={`selection-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(course)}
                  style={{
                    borderRadius: 16,
                    border: isSelected 
                      ? `2px solid #1DA1F2`
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
                      background: 'linear-gradient(135deg, #1DA1F2 0%, #1C8CD1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ fontSize: 24, color: '#fff' }} />
                    </div>
                    
                    <div>
                      <Title level={4} style={{ marginBottom: 4 }}>{course.name}</Title>
                      <Text type="secondary">{course.category}</Text>
                    </div>

                    {course.students && (
                      <Badge 
                        count={`${course.students} students`} 
                        style={{ 
                          backgroundColor: isDark ? '#262626' : '#f0f0f0',
                          color: isDark ? '#a6a6a6' : '#595959',
                          fontSize: 12
                        }} 
                      />
                    )}
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
