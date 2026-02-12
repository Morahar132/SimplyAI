# Question Bank Backend API

Production-ready Python backend for the Test Preparation module demo.

## Features

- ✅ Filter questions by Course → Subject → Topic → Subtopic
- ✅ Filter by difficulty (Easy/Medium/Hard) and question type (MCQ, Multiple MCQ, etc.)
- ✅ Configurable question count (via payload or environment variable)
- ✅ Enum endpoints for question types and difficulties
- ✅ Returns only required fields (question, options, answer, explanation, LaTeX)
- ✅ Clean architecture: routes → service → db
- ✅ Production-ready error handling and validation

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### 3. Run the Server

```bash
python3 main.py
```

Server will start on `http://localhost:8000`

## API Endpoints

### Enums
```
GET /api/enums/question-types    # Get all question types
GET /api/enums/difficulties      # Get all difficulty levels
```

### Navigation
```
GET /api/courses                           # Get all courses
GET /api/courses/{course_id}/subjects      # Get subjects
GET /api/subjects/{subject_id}/topics      # Get topics
GET /api/topics/{topic_id}/subtopics       # Get subtopics
```

### Fetch Questions
```
POST /api/questions/fetch
```

## Request Payload

### Working Example (Verified)
```json
{
  "courseId": "5e12bc386ed15e08c72f429b",
  "subjectId": "5e12bc3e6ed15e08c72f429c",
  "topicIds": ["5e12bca90a53d808cd8a072b"],
  "subtopicIds": [],
  "difficulty": 1,
  "type": 1,
  "limit": 5
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string | Yes | Course ObjectId (24 hex chars) |
| subjectId | string | No | Subject ObjectId |
| topicIds | array | Yes* | Array of topic ObjectIds |
| subtopicIds | array | Yes* | Array of subtopic ObjectIds |
| difficulty | int | Yes | 0=Easy, 1=Medium, 2=Hard |
| type | int | Yes | 0=MCQ, 1=Multiple MCQ, 2=Number, 3=Fill Blanks, 4=Assertion, 5=True/False, 6=Subjective |
| limit | int | No | Number of questions (1-100, defaults to QUESTIONS_PER_REQUEST) |

*At least one of topicIds or subtopicIds must be provided

## Response Format

```json
{
  "status": "success",
  "count": 5,
  "requested": 5,
  "filters": {
    "difficulty": "MEDIUM",
    "type": "MULTIPLE_MCQ"
  },
  "questions": [
    {
      "_id": "5e182f08272cc07f5a170243",
      "type": 1,
      "question": {
        "body": {
          "text": "Question text...",
          "latexes": [...]
        },
        "options": [...]
      },
      "answer": {
        "answer": [1, 2],
        "explanation": {
          "text": "Explanation...",
          "latexes": []
        }
      },
      "meta": {
        "difficulty": 1
      }
    }
  ]
}
```

## Projected Fields from MongoDB

The API returns only these fields from the questions collection:
- `_id` - Question ID
- `type` - Question type (0-6)
- `question` - Complete question object with body, options, latexes
- `answer` - Answer object with correct answer(s) and explanation
- `meta.difficulty` - Difficulty level (0-2)

**Excluded fields**: `old`, `set`, `createdAt`, `updatedAt`, `deletedAt`, `numberOfPaperAttached`, `viewCount`, etc.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| MONGO_URI | - | MongoDB connection string (required) |
| MONGO_DB | questionbank | Database name |
| PORT | 8000 | Server port |
| QUESTIONS_PER_REQUEST | 10 | Default number of questions (can be overridden in payload) |
| QUERY_TIMEOUT_MS | 5000 | MongoDB query timeout |
| SELECTION_STRATEGY | sample | "sample" (random) or "newest" |
| DIFFICULTY_SCALE | zeroBased | "zeroBased" (0-2) or "oneBased" (1-3) |

### Changing Question Count

**Option 1: Via Environment Variable**
```bash
# In .env file
QUESTIONS_PER_REQUEST=20
```

**Option 2: Via Request Payload**
```json
{
  "courseId": "...",
  "difficulty": 1,
  "type": 0,
  "limit": 15
}
```

**Option 3: Remove Limit (Return All Matching)**
```python
# In service.py, modify get_question_batch:
limit = filters.get("limit") or 1000  # Large number
```

## Testing

### Automated Verification
```bash
python3 verify_api.py
```

### Manual Testing with cURL

```bash
# Get question types
curl http://localhost:8000/api/enums/question-types

# Get difficulties
curl http://localhost:8000/api/enums/difficulties

# Fetch 5 questions
curl -X POST http://localhost:8000/api/questions/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "5e12bc386ed15e08c72f429b",
    "subjectId": "5e12bc3e6ed15e08c72f429c",
    "topicIds": ["5e12bca90a53d808cd8a072b"],
    "subtopicIds": [],
    "difficulty": 1,
    "type": 1,
    "limit": 5
  }'
```

## Enums Reference

### Question Types
```python
MCQ = 0              # Single Choice MCQ
MULTIPLE_MCQ = 1     # Multiple Choice MCQ
NUMBER = 2           # Numerical Answer
FILL_BLANKS = 3      # Fill in the Blanks
ASSERTION = 4        # Assertion-Reason
TRUE_FALSE = 5       # True/False
SUBJECTIVE = 6       # Subjective
```

### Difficulty Levels
```python
EASY = 0
MEDIUM = 1
HARD = 2
```

## MongoDB Indexes (Recommended)

For optimal performance:

```javascript
db.questions.createIndex({
  "tags.course_id": 1,
  "tags.subject_id": 1,
  "tags.topic_id": 1,
  "tags.subtopic_id": 1,
  "meta.difficulty": 1,
  "type": 1,
  "isPublic": 1
});

db.questions.createIndex({ "createdAt": -1 });
```

## API Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Architecture

```
backend/
├── main.py          # FastAPI app entry point
├── routes.py        # API endpoints
├── service.py       # Business logic & filtering
├── db.py            # MongoDB connection
├── models.py        # Pydantic validation models
├── enums.py         # Question types & difficulty enums
├── config.py        # Configuration management
├── requirements.txt # Python dependencies
├── verify_api.py    # Automated testing script
└── TEST_PAYLOADS.md # Example payloads
```
