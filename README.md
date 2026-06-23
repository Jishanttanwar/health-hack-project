# 🧠 MindMate — Mental Wellness Companion

> *Your private daily mental wellness companion — no login, no cloud, 100% you.*

Built by **Synapse Squad** for the **VIT Bhopal × Johns Hopkins Health Hackathon 2026**

---

## ✨ Features

### 🏠 Onboarding
- Animated splash screen with slide-through feature highlights
- One-time intro (remembered via `localStorage`) — skipped on return visits

### 📊 Daily Check-in
- Emoji mood picker (Happy → Very Low)
- 4 wellness sliders: **Stress**, **Sleep Quality**, **Energy**, **Focus**
- "Overwhelmed?" toggle with a calming suggestion card + redirect to breathing
- One-word-for-today field

### 🔥 Streak & Stats Counter
- **Day streak** — counts consecutive days with check-ins
- **Total check-ins** and **total journal entries** displayed on the hero

### 💬 Motivational Quotes
- Curated library of mental wellness quotes
- Refreshes on each visit and on "New Quote" click with a fade animation

### ✍️ Quick Journal
- "What drained you today?" — free-write reflection
- "One thing I could do better tomorrow?" — growth mindset prompt
- **🌻 Gratitude Section** — 3 things you're grateful for today

### 📔 Journal History (`journal.html`)
- Full glassmorphism redesign with animated background
- **Sticky header** with back button and live search filter
- **Stats bar** — total entries, gratitude items logged, days journaled
- **Delete entries** with smooth fade-out animation
- XSS-safe rendering of all user content

### 🧘 Guided Breathing Exercises
Three modes:
| Mode | Pattern | Duration |
|------|---------|---------|
| **Box Breathing** | Inhale 4s → Hold 4s → Exhale 4s → Hold 4s | ~2 min (6 cycles) |
| **4-7-8 Breathing** | Inhale 4s → Hold 7s → Exhale 8s | ~4 cycles |
| **30s Panic Reset** | Breathe in 3s → Breathe out 3s | 5 cycles |

- Smooth easing animation on the breathing circle
- Color-coded circle states (purple → blue → pink → green)
- Cycle counter and completion celebration

### 📈 Weekly Insights
- Line chart powered by **Chart.js**
- Toggle between: **Stress**, **Sleep**, **Energy**, **Focus**
- Covers last 7 check-ins
- Beautiful tooltips styled to match the app

### 🔒 Privacy-first
- No login required
- No server, no cloud, no analytics
- All data stored in your browser's `localStorage`
- One-tap "Clear All Data" to wipe everything

### 🌙 Dark Mode
- Fully supported via `prefers-color-scheme: dark`
- Custom dark palette throughout all sections

### 📱 Responsive Design
- Mobile-first layout
- Sticky navbar with hamburger menu on mobile
- Touch-friendly sliders, moods, and buttons

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS (glassmorphism, CSS variables, dark mode) |
| Logic | Vanilla JavaScript (ES6+) |
| Charts | [Chart.js v3.9](https://www.chartjs.org/) |
| Fonts | [Google Fonts — Poppins](https://fonts.google.com/specimen/Poppins) |
| Storage | Browser `localStorage` |

**Zero dependencies** beyond Chart.js and Google Fonts. No build tools required.

---

## 🚀 Getting Started

### Option 1 — Open directly (simplest)
```bash
# Clone the repo
git clone https://github.com/your-username/health-hack-project.git
cd health-hack-project

# Open in browser
open intro.html     # macOS
# or
start intro.html    # Windows
```

### Option 2 — Local dev server (recommended)
Using Python:
```bash
python3 -m http.server 8080
# Open http://localhost:8080/intro.html
```

Using Node.js / `npx`:
```bash
npx serve .
# Open the URL shown in terminal
```

Using VS Code:
> Install the **Live Server** extension → right-click `intro.html` → **Open with Live Server**

---

## 📁 Project Structure

```
health-hack-project/
├── intro.html          # Onboarding / splash screen (entry point)
├── intro.css           # Intro page styles & animations
├── intro.js            # Intro animation controller & localStorage logic
├── index.html          # Main app (check-in, journal, breathing, insights)
├── mindmate.css        # Main app styles (glassmorphism, dark mode, components)
├── mindmate.js         # Main app logic (mood, journal, breathing, charts)
├── journal.html        # Journal history page (search, delete, gratitude view)
└── README.md           # This file
```

---

## 🧩 Data Schema

All data is stored in `localStorage` under these keys:

### `mindmate_checkins`
Array of daily check-in objects:
```json
{
  "date": "2026-06-23",
  "timestamp": "2026-06-23T17:30:00.000Z",
  "mood": "happy",
  "stress": 2,
  "sleep": 4,
  "energy": 4,
  "focus": 3,
  "overwhelmed": false,
  "oneWord": "hopeful"
}
```

### `mindmate_journals`
Array of journal entry objects:
```json
{
  "date": "2026-06-23",
  "timestamp": "2026-06-23T17:31:00.000Z",
  "drained": "Back-to-back meetings with no breaks.",
  "better": "Schedule a 15-minute walk between meetings.",
  "gratitude": ["Good coffee", "A kind message from a friend", "Sunshine"]
}
```

### `mindmate_seen_intro`
A `"true"` / `null` flag to skip the intro on return visits.

---

## 🔮 Potential Future Features

- [ ] Mood trend analysis (weekly/monthly summary)
- [ ] Export data as JSON/CSV
- [ ] Push notification reminders (PWA)
- [ ] Custom breathing pattern creator
- [ ] Offline support via Service Worker (PWA)
- [ ] Tags/categories for journal entries
- [ ] Confetti celebration on milestone streaks

---

## 👥 Team — Synapse Squad

| Name | Role |
|------|------|
| Jishant Tanwar | Lead Developer | Team leader
| Riddhima Saluja | UI/UX Designer | Team member
| Sneha Singh | Developer & Animator | Team member
| Maitri Srivastava | Content Writer & Lead UX | Team member
| Kavya | Research and content | Team member

---

## 🏆 Hackathon

**VIT Bhopal × Johns Hopkins Health Hackathon 2026**  
Theme: *Mental Wellness & Accessible Health Tech*

---


