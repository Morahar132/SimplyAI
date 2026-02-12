# Exam Prep Frontend - Premium UI with Ant Design

Production-ready, premium UI for exam practice with Google-quality design.

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## ✨ Features

### Design System
- **Ant Design 5** - Enterprise-grade UI components
- **Light & Dark Mode** - Seamless theme switching
- **Premium Colors** - Light: #1DA1F2, Dark: #1C8CD1
- **Responsive** - Mobile-first, works on all devices

### User Experience
- Smooth animations and transitions
- Interactive card selections with hover states
- Progressive disclosure for complex selections
- Micro-interactions for better feedback
- Accessible and keyboard-friendly

### Architecture
- Context-based state management
- Theme persistence with localStorage
- Clean component structure
- Production-ready code quality

## 📱 User Flow

1. **Landing** → Practice or Mock Test selection
2. **Select Exam** → Interactive exam cards (JEE Main, NEET, etc.)
3. **Select Subject** → Subject cards with statistics
4. **Configure Practice** → Unified page with:
   - Chapters selection (with "Select All")
   - Subtopics in collapsible panels
   - Question Type dropdown (default: Single Choice MCQ)
   - Difficulty dropdown (default: Normal)
   - Start Practice button

## 🎨 Design Highlights

- **Card-based selections** with elevation on hover
- **Strong visual hierarchy** with proper spacing
- **Color-coded subjects** for better recognition
- **Collapsible panels** for topics/subtopics
- **Premium button styles** with shadows
- **Smooth page transitions** with fade-in animations

## 🛠️ Tech Stack

- React 18
- Ant Design 5
- React Router v6
- Vite (build tool)
- Context API (state management)

## 🎯 Next Steps

- API integration with backend
- Question rendering interface
- Practice session with timer
- Results and analytics dashboard
- Progress tracking

## 📦 Project Structure

```
src/
├── pages/
│   ├── Landing.jsx
│   └── practice/
│       ├── SelectExam.jsx
│       ├── SelectSubject.jsx
│       └── SelectTopics.jsx
├── context/
│   ├── PracticeContext.jsx
│   └── ThemeContext.jsx
├── utils/
│   └── theme.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🎨 Theme Customization

Edit `src/utils/theme.js` to customize colors, spacing, and component styles.

## 📝 Notes

- All selections are stored in PracticeContext
- Theme preference is saved to localStorage
- Components follow Ant Design best practices
- Code is minimal and production-ready
