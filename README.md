# QuizApp

Minimal quiz app using React + Vite. Fetches questions from Open Trivia DB, shows one question at a time, tracks score, displays results, and allows restart. Code is kept small and easy to change.

## Features
- Clean, responsive UI; one question at a time with four options
- Next, Previous/Skip, Finish
- Score tracking and results summary
- Progress bar and 30s timer per question
- Choose difficulty and number of questions (5–10)
- Persists last results in localStorage

## Tech
- React hooks (useState, useEffect)
- React Router (`/quiz`, `/results`)
- CSS for styling

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:5173`.

## Build
```bash
npm run build
npm run preview
```

## Architecture & Design Decisions

```text
quiz-app/
├── src/
│   ├── pages/
│   │   ├── Quiz.jsx
│   │   └── Results.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md

### Component Structure
- **src/App.jsx**: Root component with React Router setup and conditional navigation
- **src/pages/Quiz.jsx**: Main quiz logic with state management, API integration, and timer
- **src/pages/Results.jsx**: Results display with localStorage integration, take new quiz action

### State Management
- **Local state** with React hooks (useState, useEffect) - no external state library needed
- **localStorage** for persistence (quiz results, settings, previous questions)
- **URL parameters** to distinguish between new quiz vs restart

### Data Flow
1. **Load**: Fetch questions from Open Trivia DB API
2. **Quiz**: User selects → lock answer → next question → repeat
3. **Complete**: Calculate score → save to localStorage → navigate to results
4. **Restart**: Reuse stored questions OR fetch new ones based on navigation source

### Design Decisions
- **Minimal dependencies**: Only React Router added to keep bundle small
- **Single-page flow**: One question at a time for better UX
- **Progressive enhancement**: Works without JS (basic), enhanced with React
- **Responsive-first**: Mobile-friendly with simple CSS
- **Error resilience**: Handles API failures, timeouts, and edge cases gracefully

## API
Open Trivia DB: `https://opentdb.com/api.php?amount=10&type=multiple&difficulty=easy` (amount/difficulty vary). Handles loading, empty/short data, and timeouts.


