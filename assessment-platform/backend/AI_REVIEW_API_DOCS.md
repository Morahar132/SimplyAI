# AI Review API Documentation

## Overview
AI-powered student performance analysis endpoint that provides personalized insights based on practice test results.

---

## Endpoint

**URL:** `POST /api/practice/ai-review`

**Content-Type:** `application/json`

**Authentication:** None required

---

## Request Schema

```json
{
  "totalQuestions": number,
  "correctAnswers": number,
  "wrongAnswers": number,
  "skippedQuestions": number,
  "questions": [
    {
      "questionText": string,
      "status": "correct" | "wrong" | "skipped",
      "correctAnswer": string,
      "userAnswer": string | null
    }
  ]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalQuestions` | number | Yes | Total number of questions in the test |
| `correctAnswers` | number | Yes | Number of correctly answered questions |
| `wrongAnswers` | number | Yes | Number of incorrectly answered questions |
| `skippedQuestions` | number | Yes | Number of skipped/unattempted questions |
| `questions` | array | Yes | Array of question objects |
| `questions[].questionText` | string | Yes | The full text of the question |
| `questions[].status` | string | Yes | One of: "correct", "wrong", "skipped" |
| `questions[].correctAnswer` | string | Yes | The correct answer |
| `questions[].userAnswer` | string/null | No | User's answer (null if skipped) |

---

## Response Schema

```json
{
  "status": "success",
  "insights": [
    {
      "category": string,
      "message": string
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always "success" on successful analysis |
| `insights` | array | Array of exactly 2 insight objects |
| `insights[].category` | string | Category of the insight (see categories below) |
| `insights[].message` | string | Actionable insight message (max 2 sentences) |

---

## Insight Categories

The AI will categorize insights into one of these 5 categories:

| Category | Description | Example Use Case |
|----------|-------------|------------------|
| **Knowledge Gap** | Missing fundamental concepts or theory | Student doesn't understand basic definitions |
| **Topic Weakness** | Struggling with specific subject areas | Poor performance in a particular topic |
| **Confidence Issue** | High skip rate indicating hesitation | Student skipping many questions |
| **Conceptual Confusion** | Mixing up similar concepts | Confusing related formulas or theories |
| **Strong Performance** | Excelling in certain areas | High accuracy in specific topics |

---

## Sample Request

```bash
curl -X POST 'http://localhost:8000/api/practice/ai-review' \
  -H 'Content-Type: application/json' \
  --data-raw '{
  "totalQuestions": 10,
  "correctAnswers": 4,
  "wrongAnswers": 3,
  "skippedQuestions": 3,
  "questions": [
    {
      "questionText": "What is the time complexity of binary search?",
      "status": "correct",
      "correctAnswer": "O(log n)",
      "userAnswer": "O(log n)"
    },
    {
      "questionText": "Explain the difference between stack and queue",
      "status": "skipped",
      "correctAnswer": "Stack is LIFO, Queue is FIFO",
      "userAnswer": null
    },
    {
      "questionText": "What is bubble sort worst-case complexity?",
      "status": "wrong",
      "correctAnswer": "O(n²)",
      "userAnswer": "O(n log n)"
    },
    {
      "questionText": "Define dynamic programming",
      "status": "skipped",
      "correctAnswer": "Optimization using memoization",
      "userAnswer": null
    },
    {
      "questionText": "What is a hash table?",
      "status": "correct",
      "correctAnswer": "Key-value data structure",
      "userAnswer": "Key-value data structure"
    },
    {
      "questionText": "Explain Big O notation",
      "status": "wrong",
      "correctAnswer": "Describes algorithm efficiency",
      "userAnswer": "Describes code quality"
    },
    {
      "questionText": "What is a linked list?",
      "status": "correct",
      "correctAnswer": "Linear data structure with nodes",
      "userAnswer": "Linear data structure with nodes"
    },
    {
      "questionText": "Define recursion",
      "status": "skipped",
      "correctAnswer": "Function calling itself",
      "userAnswer": null
    },
    {
      "questionText": "What is a binary tree?",
      "status": "correct",
      "correctAnswer": "Tree with max 2 children per node",
      "userAnswer": "Tree with max 2 children per node"
    },
    {
      "questionText": "Explain merge sort complexity",
      "status": "wrong",
      "correctAnswer": "O(n log n)",
      "userAnswer": "O(n²)"
    }
  ]
}'
```

---

## Sample Response

```json
{
  "status": "success",
  "insights": [
    {
      "category": "Confidence Issue",
      "message": "You skipped 3 questions (30% skip rate), particularly in Algorithms. This suggests hesitation - try attempting all questions even if unsure."
    },
    {
      "category": "Topic Weakness",
      "message": "Algorithms shows weakness with 3 wrong answers. Focus on understanding time complexity notation and sorting algorithm analysis."
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": [
    {
      "loc": ["body", "totalQuestions"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "questions", 0, "status"],
      "msg": "value is not a valid enumeration member; permitted: 'correct', 'wrong', 'skipped'",
      "type": "type_error.enum"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "AI review failed: <error message>"
}
```

---

## Frontend Integration Example (JavaScript)

```javascript
async function getAIReview(testResults) {
  try {
    const response = await fetch('http://localhost:8000/api/practice/ai-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        totalQuestions: testResults.total,
        correctAnswers: testResults.correct,
        wrongAnswers: testResults.wrong,
        skippedQuestions: testResults.skipped,
        questions: testResults.questions.map(q => ({
          questionText: q.text,
          status: q.status, // 'correct', 'wrong', or 'skipped'
          correctAnswer: q.correctAnswer,
          userAnswer: q.userAnswer || null
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Display insights
    data.insights.forEach(insight => {
      console.log(`[${insight.category}] ${insight.message}`);
    });

    return data;
  } catch (error) {
    console.error('AI Review failed:', error);
    throw error;
  }
}

// Usage
const testResults = {
  total: 10,
  correct: 4,
  wrong: 3,
  skipped: 3,
  questions: [
    {
      text: "What is binary search?",
      status: "correct",
      correctAnswer: "O(log n)",
      userAnswer: "O(log n)"
    },
    // ... more questions
  ]
};

getAIReview(testResults)
  .then(insights => {
    // Handle insights in UI
    displayInsights(insights);
  })
  .catch(error => {
    // Handle error
    showError(error);
  });
```

---

## Frontend Integration Example (React)

```jsx
import { useState } from 'react';

function AIReviewComponent({ testResults }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAIReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/practice/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testResults)
      });

      if (!response.ok) throw new Error('Failed to fetch AI review');

      const data = await response.json();
      setInsights(data.insights);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-review">
      <button onClick={fetchAIReview} disabled={loading}>
        {loading ? 'Analyzing...' : 'Get AI Insights'}
      </button>

      {error && <div className="error">{error}</div>}

      {insights && (
        <div className="insights">
          {insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <h3>{insight.category}</h3>
              <p>{insight.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Performance Considerations

- **Response Time:** Typically 1-3 seconds (depends on Gemini API)
- **Rate Limiting:** Follow Gemini API rate limits
- **Payload Size:** Keep question text under 100 characters for optimal performance
- **Caching:** Consider caching results for identical test sessions

---

## Best Practices

1. **Always send complete data** - Include all questions for accurate analysis
2. **Validate before sending** - Ensure totalQuestions = correctAnswers + wrongAnswers + skippedQuestions
3. **Handle errors gracefully** - Show fallback UI if AI analysis fails
4. **Display insights prominently** - Make insights easy to read and actionable
5. **Track user engagement** - Monitor if students act on AI recommendations

---

## Notes

- The AI returns exactly 2 insights per request
- Insights are personalized based on performance patterns
- Categories are dynamically selected based on the analysis
- Messages are concise (max 2 sentences) and actionable
