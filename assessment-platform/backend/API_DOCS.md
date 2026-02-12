# API Documentation for Frontend Integration

**Base URL**: `http://localhost:8000/api`

---

## 1. Get Question Types

**Endpoint**: `GET /enums/question-types`

**Response**:
```json
{
  "status": "success",
  "questionTypes": [
    {"value": 0, "label": "Single Choice MCQ", "name": "MCQ"},
    {"value": 1, "label": "Multiple Choice MCQ", "name": "MULTIPLE_MCQ"},
    {"value": 2, "label": "Numerical Answer", "name": "NUMBER"},
    {"value": 3, "label": "Fill in the Blanks", "name": "FILL_BLANKS"},
    {"value": 4, "label": "Assertion-Reason", "name": "ASSERTION"},
    {"value": 5, "label": "True/False", "name": "TRUE_FALSE"},
    {"value": 6, "label": "Subjective", "name": "SUBJECTIVE"}
  ]
}
```

---

## 2. Get Difficulty Levels

**Endpoint**: `GET /enums/difficulties`

**Response**:
```json
{
  "status": "success",
  "difficulties": [
    {"value": 0, "label": "Easy", "name": "EASY"},
    {"value": 1, "label": "Medium", "name": "MEDIUM"},
    {"value": 2, "label": "Hard", "name": "HARD"}
  ]
}
```

---

## 3. Get All Courses

**Endpoint**: `GET /courses`

**Response**:
```json
{
  "status": "success",
  "courses": [
    {
      "_id": "5e12bc386ed15e08c72f429b",
      "name": "JEE Main",
      "slug": "jee-main",
      "category": "Engineering"
    }
  ]
}
```

---

## 4. Get Subjects for Course

**Endpoint**: `GET /courses/{courseId}/subjects`

**Example**: `GET /courses/5e12bc386ed15e08c72f429b/subjects`

**Response**:
```json
{
  "status": "success",
  "subjects": [
    {
      "_id": "5e12bc3e6ed15e08c72f429c",
      "name": "Physics",
      "questionsCount": 5420,
      "courseId": "5e12bc386ed15e08c72f429b"
    }
  ]
}
```

---

## 5. Get Topics for Subject

**Endpoint**: `GET /subjects/{subjectId}/topics`

**Example**: `GET /subjects/5e12bc3e6ed15e08c72f429c/topics`

**Response**:
```json
{
  "status": "success",
  "topics": [
    {
      "_id": "5e12bca90a53d808cd8a072b",
      "name": "Units and Measurements",
      "questionsCount": 245,
      "priority": 1,
      "subjectId": "5e12bc3e6ed15e08c72f429c"
    }
  ]
}
```

---

## 6. Get Subtopics for Topic

**Endpoint**: `GET /topics/{topicId}/subtopics`

**Example**: `GET /topics/5e12bca90a53d808cd8a072b/subtopics`

**Response**:
```json
{
  "status": "success",
  "subtopics": [
    {
      "_id": "5e12bcad0a53d808cd8a0730",
      "name": "Measurement of Length",
      "questionsCount": 45,
      "priority": 1,
      "parentTopicId": "5e12bca90a53d808cd8a072b"
    }
  ]
}
```

---

## 7. Fetch Questions (Main Endpoint)

**Endpoint**: `POST /questions/fetch`

**Request Body**:
```json
{
  "courseId": "5e12bc386ed15e08c72f429b",
  "subjectId": "5e12bc3e6ed15e08c72f429c",
  "topicIds": ["5e12bca90a53d808cd8a072b"],
  "subtopicIds": [],
  "difficulty": 0,
  "type": 0,
  "limit": 25
}
```

**Field Details**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string | Yes | Course ObjectId (24 hex chars) |
| subjectId | string | No | Subject ObjectId |
| topicIds | array | No* | Array of topic ObjectIds |
| subtopicIds | array | No* | Array of subtopic ObjectIds |
| difficulty | int | Yes | 0=Easy, 1=Medium, 2=Hard |
| type | int | Yes | 0-6 (see question types) |
| limit | int | No | 1-25 questions (default: 25) |

*At least one of topicIds or subtopicIds required

**Response**:
```json
{
  "status": "success",
  "count": 25,
  "requested": 25,
  "filters": {
    "difficulty": "EASY",
    "type": "MCQ"
  },
  "questions": [
    {
      "_id": "5f2cfb8168b5c17e83c1e407",
      "type": 0,
      "question": {
        "body": {
          "text": "Question with <tm-math id=\"0\"/> markers",
          "latexes": [
            {"latex": " 1 \\mathrm { cm } "}
          ]
        },
        "options": [
          {
            "d": {
              "text": "Option A",
              "latexes": []
            },
            "v": 0
          }
        ]
      },
      "answer": {
        "answer": [1],
        "explanation": {
          "text": "Explanation text",
          "latexes": []
        }
      },
      "meta": {
        "difficulty": 0
      }
    }
  ]
}
```

---

## 8. Get Asset (Images in Explanations)

**Endpoint**: `GET /assets/{assetId}`

**Example**: `GET /assets/62095d18de7dc53e6ab9165e`

**Response**:
```json
{
  "status": "success",
  "asset": {
    "_id": "62095d18de7dc53e6ab9165e",
    "url": "https://storage.googleapis.com/tm_dev/assessments/assets/CyEoJbUzMpJad3vQGNwMM.jpg",
    "type": "image/jpeg",
    "name": "Screenshot_20220213-233807.jpg"
  }
}
```

---

## Frontend Integration Notes

### 1. LaTeX Rendering
Questions contain `<tm-math id="X"/>` placeholders:
```javascript
// Replace placeholders with LaTeX
function renderLatex(text, latexes) {
  return text.replace(/<tm-math id="(\d+)"\/>/g, (match, id) => {
    return latexes[parseInt(id)]?.latex || '';
  });
}
```

### 2. Asset Rendering
Explanations may contain `<tm-asset id="..."/>`:
```javascript
// Fetch and replace asset placeholders
async function renderAssets(text) {
  const assetIds = text.match(/tm-asset id="([^"]+)"/g);
  for (const match of assetIds) {
    const id = match.match(/id="([^"]+)"/)[1];
    const asset = await fetch(`/api/assets/${id}`).then(r => r.json());
    text = text.replace(match, `<img src="${asset.asset.url}" />`);
  }
  return text;
}
```

### 3. Answer Checking
```javascript
// For MCQ (type 0)
const isCorrect = userAnswer === question.answer.answer[0];

// For Multiple MCQ (type 1)
const isCorrect = JSON.stringify(userAnswers.sort()) === 
                  JSON.stringify(question.answer.answer.sort());
```

### 4. Error Handling
All endpoints return consistent error format:
```json
{
  "detail": "Error message"
}
```

---

## Configuration

- **Max Questions**: 25 per request
- **Default Questions**: 25 (if limit not specified)
- **Selection**: Random sampling
- **Timeout**: 5 seconds per query
- **No Duplicates**: Automatic deduplication by question text
