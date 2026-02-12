# Component Architecture

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx                 # Home page with Practice/Mock Test
│   │   └── practice/
│   │       ├── SelectExam.jsx          # Exam selection page
│   │       ├── SelectSubject.jsx       # Subject selection page
│   │       └── SelectTopics.jsx        # Unified topics/settings page
│   │
│   ├── context/
│   │   ├── PracticeContext.jsx         # Practice flow state management
│   │   └── ThemeContext.jsx            # Light/Dark theme management
│   │
│   ├── utils/
│   │   └── theme.js                    # Ant Design theme configuration
│   │
│   ├── App.jsx                         # Root component with routing
│   ├── main.jsx                        # Entry point
│   └── index.css                       # Global styles
│
├── package.json
├── vite.config.js
├── index.html
├── README.md
├── UI_FEATURES.md
└── FLOW_GUIDE.md
```

---

## 🧩 Component Breakdown

### 1. App.jsx
**Purpose:** Root component with theme and routing setup

**Key Features:**
- Wraps app with ThemeProvider
- Configures Ant Design theme based on light/dark mode
- Sets up React Router with all routes
- Wraps routes with PracticeProvider for state

**Dependencies:**
- ConfigProvider (Ant Design)
- BrowserRouter, Routes, Route (React Router)
- ThemeProvider, PracticeProvider (Context)

---

### 2. Landing.jsx
**Purpose:** Home page with Practice and Mock Test options

**Components Used:**
- Card (Ant Design)
- Button (theme toggle)
- Typography (Title, Paragraph)
- Icons (BookOutlined, FileTextOutlined, BulbOutlined)

**State:**
- None (uses ThemeContext for theme toggle)

**Navigation:**
- Practice card → `/practice/select-exam`
- Mock Test → Disabled (coming soon)

**Styling:**
- Full viewport height
- Centered content
- Max width: 1200px
- Theme toggle in top-right

---

### 3. SelectExam.jsx
**Purpose:** Exam selection with interactive cards

**Components Used:**
- Card (Ant Design)
- Row, Col (Grid layout)
- Badge (student count)
- Typography
- Icons (TrophyOutlined, ExperimentOutlined, CalculatorOutlined)

**State:**
- `courses` - List of available exams
- `selected` - Currently selected exam ID

**Context Usage:**
- `updateSelection('course', course)` - Save selected exam

**Navigation:**
- Back → `/`
- On select → `/practice/select-subject`

**Styling:**
- 3-column grid (responsive)
- Gradient icon backgrounds
- Selection border on click
- Auto-navigation after 300ms

---

### 4. SelectSubject.jsx
**Purpose:** Subject selection with color-coded cards

**Components Used:**
- Card (Ant Design)
- Row, Col (Grid layout)
- Statistic (question count)
- Typography
- Icons (ThunderboltOutlined, ExperimentOutlined, CalculatorOutlined)

**State:**
- `subjects` - List of subjects for selected exam
- `selected` - Currently selected subject ID

**Context Usage:**
- `selections.course` - Get selected exam (redirect if null)
- `updateSelection('subject', subject)` - Save selected subject

**Navigation:**
- Back → `/practice/select-exam`
- On select → `/practice/select-topics`

**Styling:**
- Color-coded by subject (Physics: Blue, Chemistry: Green, Math: Orange)
- Gradient backgrounds
- Question count statistics

---

### 5. SelectTopics.jsx
**Purpose:** Unified page for topics, subtopics, question type, and difficulty

**Components Used:**
- Card (Ant Design)
- Collapse, Panel (Expandable sections)
- Checkbox (Multi-select)
- Select (Dropdowns)
- Row, Col (Grid for dropdowns)
- Divider (Section separator)
- Tag (Selection counter)
- Typography

**State:**
- `topics` - List of chapters
- `subtopicsByTopic` - Subtopics grouped by topic ID
- `selectedTopicIds` - Array of selected topic IDs
- `selectedSubtopicIds` - Array of selected subtopic IDs
- `questionType` - Selected question type (default: 0)
- `difficulty` - Selected difficulty (default: 1)

**Context Usage:**
- `selections.subject` - Get selected subject (redirect if null)
- `updateSelection()` - Save all selections

**Key Functions:**
- `toggleTopic(topicId)` - Toggle chapter selection
- `toggleSubtopic(subtopicId)` - Toggle subtopic selection
- `selectAllTopics()` - Select/deselect all chapters
- `selectAllSubtopicsForTopic()` - Select/deselect all subtopics in a chapter
- `handleContinue()` - Save and navigate

**Navigation:**
- Back → `/practice/select-subject`
- On continue → Alert (API pending) → `/`

**Styling:**
- Single card with sections
- Collapsible panels for chapters
- Nested checkboxes for subtopics
- Two-column layout for dropdowns
- Large action button at bottom

---

## 🔄 Context Architecture

### PracticeContext
**Purpose:** Manage practice flow selections

**State:**
```javascript
{
  course: null,        // { _id, name, category }
  subject: null,       // { _id, name, questionsCount }
  topics: [],          // [topicId1, topicId2, ...]
  subtopics: [],       // [subtopicId1, subtopicId2, ...]
  questionType: null,  // { value, label }
  difficulty: null     // { value, label, color }
}
```

**Methods:**
- `updateSelection(key, value)` - Update a selection
- `resetSelections()` - Clear all selections

**Usage:**
```javascript
const { selections, updateSelection } = usePractice();
```

---

### ThemeContext
**Purpose:** Manage light/dark theme

**State:**
- `isDark` - Boolean for current theme

**Methods:**
- `toggleTheme()` - Switch between light and dark

**Persistence:**
- Saves to localStorage
- Reads system preference on first load

**Usage:**
```javascript
const { isDark, toggleTheme } = useTheme();
```

---

## 🎨 Theme Configuration

### theme.js
**Exports:**
- `lightTheme` - Ant Design config for light mode
- `darkTheme` - Ant Design config for dark mode

**Customization:**
```javascript
token: {
  colorPrimary: '#1DA1F2',  // Primary color
  borderRadius: 12,          // Default border radius
  fontSize: 15,              // Base font size
  // ... more tokens
}

components: {
  Card: {
    borderRadiusLG: 16,      // Card border radius
    // ... component-specific styles
  }
}
```

---

## 🎯 Data Flow

```
User Action
    ↓
Component State Update
    ↓
Context Update (if needed)
    ↓
Navigation (if needed)
    ↓
Next Component Reads Context
    ↓
Render with Selections
```

### Example Flow:
1. User clicks "JEE Main" exam card
2. SelectExam sets `selected` state
3. SelectExam calls `updateSelection('course', course)`
4. PracticeContext updates `selections.course`
5. Navigate to `/practice/select-subject`
6. SelectSubject reads `selections.course` from context
7. SelectSubject displays breadcrumb with exam name

---

## 🚀 Adding New Pages

### Template:
```javascript
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { usePractice } from '../context/PracticeContext';
import { useTheme } from '../context/ThemeContext';

export const NewPage = () => {
  const navigate = useNavigate();
  const { selections, updateSelection } = usePractice();
  const { isDark } = useTheme();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark ? '#0a0a0a' : '#f5f7fa',
      padding: '40px 24px'
    }}>
      <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Button onClick={() => navigate(-1)}>Back</Button>
        {/* Your content */}
      </div>
    </div>
  );
};
```

---

## 📦 Dependencies

### Production:
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `antd` - UI component library
- `@ant-design/icons` - Icon library

### Development:
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite

---

## 🎨 Styling Strategy

### Global Styles (index.css):
- Reset styles
- Smooth transitions
- Custom scrollbar
- Animation keyframes
- Utility classes

### Component Styles:
- Inline styles with theme-aware colors
- Ant Design component props (style, bodyStyle)
- Dynamic styles based on `isDark` prop
- Responsive with Ant Design Grid (Row, Col)

### No CSS Modules or Styled Components:
- Keeps bundle size small
- Leverages Ant Design theming
- Easy to maintain and understand

---

## 🔧 Configuration Files

### vite.config.js
- React plugin
- Dev server port: 3000

### package.json
- Scripts: dev, build, preview
- Dependencies listed

### index.html
- Entry point
- Loads main.jsx

---

## 🎯 Best Practices Followed

1. **Component Composition** - Small, focused components
2. **Context for Global State** - Avoid prop drilling
3. **Theme Consistency** - Single source of truth
4. **Responsive Design** - Mobile-first approach
5. **Accessibility** - Semantic HTML, keyboard support
6. **Performance** - Minimal re-renders, lazy loading ready
7. **Code Quality** - Clean, readable, maintainable
8. **User Experience** - Smooth animations, clear feedback
