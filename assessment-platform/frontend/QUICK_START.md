# Quick Start Guide for Developers

## 🚀 Setup (30 seconds)

```bash
cd assessment-platform/frontend
npm install
npm run dev
```

Open: http://localhost:3000

---

## 🎯 What You'll See

### 1. Landing Page
- Two cards: "Practice" (clickable) and "Mock Test" (disabled)
- Theme toggle button (top-right corner)
- Click Practice → Go to exam selection

### 2. Select Exam
- 3 exam cards: JEE Main, NEET, JEE Advanced
- Click any card → Auto-navigate to subjects

### 3. Select Subject
- 3 subject cards: Physics (blue), Chemistry (green), Math (orange)
- Click any card → Go to topics configuration

### 4. Configure Practice
- **One unified page** with everything:
  - Collapsible chapter panels with subtopics
  - "Select All" options for chapters and subtopics
  - Question Type dropdown (default: Single Choice MCQ)
  - Difficulty dropdown (default: Normal)
  - Start Practice button (enabled when selection made)

---

## 🎨 Key Features to Test

### Theme Switching
1. Click sun/moon icon (top-right on landing page)
2. Watch entire app switch between light and dark
3. Refresh page → Theme persists (localStorage)

### Card Interactions
1. Hover over any card → Lifts up with shadow
2. Click card → Border changes to primary color
3. Auto-navigation after selection

### Topic Selection
1. Click "Select All Chapters" → All chapters checked
2. Expand a chapter → See subtopics
3. Click "Select All Subtopics" → All subtopics in that chapter checked
4. Mix and match individual selections
5. Watch selection counter update in real-time

### Dropdowns
1. Click "Question Type" → See 4 options
2. Click "Difficulty Level" → See 3 options with colored icons
3. Selections are saved in context

### Navigation
1. Every page has a "Back" button
2. Breadcrumbs show current path
3. Can navigate back and forth without losing selections

---

## 🔧 Code Structure

### To Add a New Page:
1. Create file in `src/pages/` or `src/pages/practice/`
2. Import contexts: `usePractice()`, `useTheme()`
3. Add route in `App.jsx`
4. Follow existing page structure

### To Modify Theme:
1. Edit `src/utils/theme.js`
2. Change `colorPrimary`, `borderRadius`, etc.
3. Changes apply globally via ConfigProvider

### To Add Mock Data:
1. Add to `useEffect` in respective page component
2. Use same structure as API response
3. Replace with API call later

---

## 📱 Responsive Testing

### Desktop (>992px):
- 3 columns for exam/subject cards
- 2 columns for dropdowns
- Max width: 1000px

### Tablet (768-991px):
- 2 columns for cards
- 2 columns for dropdowns

### Mobile (<768px):
- 1 column for everything
- Full width cards
- Stacked dropdowns

**Test:** Resize browser window to see responsive behavior

---

## 🎨 Design Tokens

### Colors:
```javascript
Light Mode:
- Primary: #1DA1F2
- Background: #f5f7fa
- Card: #ffffff
- Text: #262626

Dark Mode:
- Primary: #1C8CD1
- Background: #0a0a0a
- Card: #1a1a1a
- Text: #ffffff
```

### Spacing:
- Page padding: 40px 24px
- Section gap: 32px
- Card gap: 24px
- Element gap: 16px

### Border Radius:
- Cards: 16px
- Buttons: 12px
- Inputs: 10px

### Shadows:
- Default: 0 2px 8px rgba(0,0,0,0.06)
- Hover: 0 8px 24px rgba(0,0,0,0.12)
- Primary Button: 0 2px 8px rgba(29,161,242,0.3)

---

## 🐛 Common Issues

### Issue: npm install fails
**Solution:** Delete `node_modules` and `package-lock.json`, run `npm install` again

### Issue: Port 3000 already in use
**Solution:** Change port in `vite.config.js` or kill process on port 3000

### Issue: Theme not switching
**Solution:** Check browser console, clear localStorage, refresh

### Issue: Navigation not working
**Solution:** Check if BrowserRouter is wrapping Routes in App.jsx

---

## 🎯 Next Development Steps

### Phase 1: API Integration
1. Create `src/utils/api.js` with axios instance
2. Replace mock data with API calls
3. Add loading states (Spin component from Ant Design)
4. Add error handling (message.error from Ant Design)

### Phase 2: Question Rendering
1. Create `PracticeSession.jsx` page
2. Implement LaTeX rendering (use KaTeX or MathJax)
3. Add question navigation (prev/next)
4. Implement answer submission

### Phase 3: Results
1. Create `Results.jsx` page
2. Show score and statistics
3. Review answers with explanations
4. Add "Practice Again" option

### Phase 4: Enhancements
1. Add progress bar during practice
2. Implement timer
3. Add bookmarking questions
4. Create analytics dashboard

---

## 📚 Documentation Files

- `README.md` - Project overview and setup
- `ARCHITECTURE.md` - Component structure and data flow
- `FLOW_GUIDE.md` - Complete user journey
- `UI_FEATURES.md` - Design elements and interactions
- `QUICK_START.md` - This file

---

## 💡 Pro Tips

1. **Use React DevTools** - Inspect component tree and context values
2. **Check Ant Design Docs** - https://ant.design/components/overview
3. **Test Dark Mode** - Many users prefer it
4. **Mobile First** - Always test on mobile viewport
5. **Console Logs** - Check for any warnings or errors
6. **Network Tab** - Monitor API calls (when integrated)

---

## 🎨 Customization Examples

### Change Primary Color:
```javascript
// src/utils/theme.js
export const lightTheme = {
  token: {
    colorPrimary: '#FF6B6B', // Your color here
    // ...
  }
}
```

### Add New Icon:
```javascript
// Import from @ant-design/icons
import { RocketOutlined } from '@ant-design/icons';

// Use in component
<RocketOutlined style={{ fontSize: 24, color: '#1DA1F2' }} />
```

### Modify Card Style:
```javascript
<Card
  style={{
    borderRadius: 20,        // Rounder corners
    border: '3px solid',     // Thicker border
    background: 'linear-gradient(...)' // Gradient
  }}
>
```

---

## ✅ Checklist Before Committing

- [ ] Code runs without errors
- [ ] All pages load correctly
- [ ] Theme switching works
- [ ] Navigation works (back buttons, auto-navigation)
- [ ] Selections are saved in context
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console warnings
- [ ] Code is clean and commented (if needed)

---

## 🚀 Ready to Code!

You now have a production-ready UI foundation. Start by:
1. Running the app (`npm run dev`)
2. Exploring each page
3. Testing all interactions
4. Reading the code in `src/pages/`
5. Planning API integration

**Happy Coding! 🎉**
