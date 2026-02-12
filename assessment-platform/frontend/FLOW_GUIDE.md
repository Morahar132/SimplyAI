# Complete User Flow Guide

## 🎯 Step-by-Step Journey

### Step 1: Landing Page (/)
**What you see:**
- Large "Exam Prep" title with lightbulb icon
- Two premium cards side by side
- Theme toggle button (top-right)

**Actions:**
- Click "Practice" card → Navigate to exam selection
- Click theme toggle → Switch between light/dark mode
- "Mock Test" is disabled (coming soon)

---

### Step 2: Select Exam (/practice/select-exam)
**What you see:**
- "Select Your Exam" heading
- 3 exam cards in a grid:
  - JEE Main (Trophy icon, Engineering)
  - NEET (Experiment icon, Medical)
  - JEE Advanced (Calculator icon, Engineering)
- Each card shows student count badge
- Back button at top

**Actions:**
- Hover over any card → Card lifts with shadow
- Click any exam card → Blue border appears, auto-navigate to subjects
- Click "Back" → Return to landing page

**Visual Details:**
- Gradient icon backgrounds
- Premium card elevation
- Smooth hover animations

---

### Step 3: Select Subject (/practice/select-subject)
**What you see:**
- Breadcrumb: "JEE Main" (or selected exam)
- "Select Subject" heading
- 3 subject cards with unique colors:
  - Physics (Blue gradient)
  - Chemistry (Green gradient)
  - Mathematics (Orange gradient)
- Question count statistics on each card

**Actions:**
- Hover over cards → Elevation effect
- Click any subject → Colored border, auto-navigate to topics
- Click "Back" → Return to exam selection

**Visual Details:**
- Color-coded subjects for easy recognition
- Large gradient icons
- Question count displayed prominently

---

### Step 4: Configure Practice (/practice/select-topics)
**What you see:**
- Breadcrumb: "JEE Main • Physics"
- "Configure Practice" heading
- Single unified card containing:

#### Section A: Chapters & Topics
- "Select All Chapters" checkbox at top
- Selection counter tag (e.g., "3 selected")
- Collapsible panels for each chapter:
  - **Units and Measurements** (245 questions)
    - Select All Subtopics checkbox
    - Measurement of Length (45 qs)
    - Measurement of Mass (38 qs)
    - Dimensional Analysis (52 qs)
  - **Kinematics** (380 questions)
    - Motion in a Straight Line (120 qs)
    - Motion in a Plane (95 qs)
  - **Laws of Motion** (420 questions)
    - Newton's Laws (150 qs)
    - Friction (85 qs)

#### Section B: Question Settings (Below divider)
- **Question Type** dropdown (left column)
  - Default: "Single Choice MCQ"
  - Options: Multiple Choice, Numerical, Fill in Blanks
  
- **Difficulty Level** dropdown (right column)
  - Default: "Normal" (blue check icon)
  - Easy (green thunder icon)
  - Hard (red shield icon)

#### Section C: Action Button
- Large "Start Practice Session" button
- Disabled until at least 1 topic/subtopic selected
- Blue with shadow when enabled

**Actions:**
1. **Select Chapters:**
   - Click "Select All Chapters" → All chapters checked
   - Click individual chapter checkbox → Select that chapter
   - Click chapter panel → Expand to see subtopics

2. **Select Subtopics:**
   - Expand a chapter panel
   - Click "Select All Subtopics" → All subtopics in that chapter checked
   - Click individual subtopic → Select that subtopic
   - Mix and match chapters and subtopics

3. **Configure Settings:**
   - Click "Question Type" dropdown → Select type
   - Click "Difficulty Level" dropdown → Select difficulty
   - See colored icons for each difficulty level

4. **Start Practice:**
   - Make at least 1 selection (chapter or subtopic)
   - Button becomes enabled (blue)
   - Click "Start Practice Session" → Alert shown (API pending)

**Visual Details:**
- Nested checkbox hierarchy
- Collapsible panels with smooth animation
- Question counts for every item
- Selection counter updates in real-time
- Dropdowns with icons for difficulty
- Premium card design with proper spacing

---

## 🎨 Design Consistency

### Throughout All Pages:
- **Back Button** - Always top-left, same style
- **Breadcrumbs** - Show navigation path
- **Card Style** - Consistent border radius (16px)
- **Spacing** - 24-32px between sections
- **Typography** - Clear hierarchy (Title → Paragraph → Text)
- **Colors** - Primary blue (#1DA1F2 light, #1C8CD1 dark)
- **Animations** - 0.3s cubic-bezier for smoothness

### Interaction Patterns:
- **Hover** - Always lifts card with shadow
- **Selection** - Always shows colored border
- **Disabled** - Always reduced opacity
- **Loading** - Smooth transitions between pages

---

## 🎯 Selection Logic

### What Gets Saved:
```javascript
{
  course: { _id, name, category },
  subject: { _id, name, questionsCount },
  topics: [topicId1, topicId2, ...],
  subtopics: [subtopicId1, subtopicId2, ...],
  questionType: { value, label },
  difficulty: { value, label, color }
}
```

### Validation Rules:
- Must select at least 1 topic OR 1 subtopic
- Can select both topics and subtopics together
- Question type defaults to "Single Choice MCQ" (value: 0)
- Difficulty defaults to "Normal" (value: 1)

---

## 🚀 Next Steps (After API Integration)

1. Replace mock data with real API calls
2. Add loading states during data fetch
3. Implement question rendering page
4. Add practice session with timer
5. Create results/analytics page
6. Add progress tracking

---

## 💡 Pro Tips

- Use theme toggle to see both light and dark modes
- Try selecting "Select All" then deselecting individual items
- Expand multiple chapter panels to see all subtopics
- Notice how selection counter updates in real-time
- Observe smooth animations on every interaction
- Check responsive behavior by resizing window
