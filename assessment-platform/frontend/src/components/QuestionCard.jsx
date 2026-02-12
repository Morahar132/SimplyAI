import { Card, Typography, Space, Divider } from 'antd';
import { RichText } from './RichText';

const { Text } = Typography;

export const QuestionCard = ({ question, isDark }) => {
  // Parse question structure (this is a simplified example)
  const hasStructuredData = question.question?.body?.text?.includes('Given:') || 
                            question.question?.body?.text?.includes('Assume');

  return (
    <Card
      style={{
        borderRadius: 16,
        border: `1px solid ${isDark ? '#262626' : '#e8e8e8'}`,
        background: isDark ? '#1a1a1a' : '#ffffff',
        marginBottom: 24
      }}
      styles={{ body: { padding: 20 } }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Main Question */}
        <div style={{ lineHeight: 1.5 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 600,
            lineHeight: 1.5,
            display: 'block'
          }}>
            <RichText 
              content={question.question?.body?.text} 
              latexes={question.question?.body?.latexes}
            />
          </Text>
        </div>

        {/* If structured data exists, render it separately */}
        {hasStructuredData && (
          <>
            <Divider style={{ margin: '12px 0', opacity: 0.3 }} />
            
            {/* Given Data Section */}
            <div>
              <Text style={{ 
                fontSize: 13, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: isDark ? '#8c8c8c' : '#595959',
                fontWeight: 500,
                display: 'block',
                marginBottom: 8
              }}>
                Given
              </Text>
              <Space direction="vertical" size={8}>
                <div style={{ display: 'flex', gap: 8, paddingLeft: 4 }}>
                  <Text style={{ fontSize: 14, color: isDark ? '#a6a6a6' : '#595959' }}>•</Text>
                  <Text style={{ fontSize: 15, lineHeight: 1.5 }}>
                    Altitude: <Text strong style={{ fontSize: 15 }}>10 km</Text>
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: 8, paddingLeft: 4 }}>
                  <Text style={{ fontSize: 14, color: isDark ? '#a6a6a6' : '#595959' }}>•</Text>
                  <Text style={{ fontSize: 15, lineHeight: 1.5 }}>
                    Pressure at sea level: <Text strong style={{ fontSize: 15 }}>101.325 kPa</Text>
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: 8, paddingLeft: 4 }}>
                  <Text style={{ fontSize: 14, color: isDark ? '#a6a6a6' : '#595959' }}>•</Text>
                  <Text style={{ fontSize: 15, lineHeight: 1.5 }}>
                    Mean temperature: <Text strong style={{ fontSize: 15 }}>243 K</Text>
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: 8, paddingLeft: 4 }}>
                  <Text style={{ fontSize: 14, color: isDark ? '#a6a6a6' : '#595959' }}>•</Text>
                  <Text style={{ fontSize: 15, lineHeight: 1.5 }}>
                    Air composition: <Text strong style={{ fontSize: 15 }}>80% N₂, 20% O₂</Text>
                  </Text>
                </div>
              </Space>
            </div>
          </>
        )}
      </Space>
    </Card>
  );
};
