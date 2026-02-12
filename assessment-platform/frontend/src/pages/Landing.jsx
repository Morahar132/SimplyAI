import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import { BookOutlined, FileTextOutlined, BulbOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';

const { Title, Paragraph } = Typography;

export const Landing = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark ? '#0a0a0a' : '#f5f7fa',
      padding: '40px 24px',
      position: 'relative'
    }}>
      <Button
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{ position: 'absolute', top: 24, right: 24 }}
        size="large"
        shape="circle"
      />

      <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size={48} style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <BulbOutlined style={{ fontSize: 64, color: '#1DA1F2', marginBottom: 24 }} />
            <Title level={1} style={{ marginBottom: 8, fontSize: 48, fontWeight: 700 }}>
              Exam Prep
            </Title>
            <Paragraph style={{ fontSize: 18, color: isDark ? '#a6a6a6' : '#8c8c8c' }}>
              Master your exams with intelligent practice sessions
            </Paragraph>
          </div>

          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={10} lg={8}>
              <Card
                hoverable
                className="selection-card"
                onClick={() => navigate('/practice/select-exam')}
                style={{
                  borderRadius: 20,
                  border: `2px solid ${isDark ? '#262626' : '#e8e8e8'}`,
                  background: isDark ? '#1a1a1a' : '#ffffff',
                  height: '100%'
                }}
                styles={{ body: { padding: 40, textAlign: 'center' } }}
              >
                <BookOutlined style={{ fontSize: 56, color: '#1DA1F2', marginBottom: 24 }} />
                <Title level={3} style={{ marginBottom: 12 }}>Practice</Title>
                <Paragraph style={{ color: isDark ? '#a6a6a6' : '#8c8c8c', marginBottom: 0 }}>
                  Custom practice sessions with topic selection
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={10} lg={8}>
              <Card
                className="selection-card"
                style={{
                  borderRadius: 20,
                  border: `2px solid ${isDark ? '#262626' : '#e8e8e8'}`,
                  background: isDark ? '#1a1a1a' : '#ffffff',
                  height: '100%',
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }}
                styles={{ body: { padding: 40, textAlign: 'center' } }}
              >
                <FileTextOutlined style={{ fontSize: 56, color: isDark ? '#666' : '#bfbfbf', marginBottom: 24 }} />
                <Title level={3} style={{ marginBottom: 12 }}>Mock Test</Title>
                <Paragraph style={{ color: isDark ? '#666' : '#bfbfbf', marginBottom: 0 }}>
                  Coming Soon
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};
