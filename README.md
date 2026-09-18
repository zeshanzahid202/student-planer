# 🎓 AI Student Study Planner

A modern, full-stack intelligent study planner application designed to help students optimize their study routines, manage courses, meet deadlines, and maximize academic productivity.

---

## 🚀 Features

- **⚡ AI Study Schedule Engine**: Automatically generates a balanced, personalized 7-day timetable based on your active courses, assignments, study preferences, and daily study hour targets.
- **📊 Interactive Dashboard**: Real-time study streak counter, daily focus hour progress, upcoming urgent deadlines, and daily active-recall insight banners.
- **📝 Task & Deadline Manager**: Complete task lifecycle management with priority badges, course tags, time estimates, status filters, and search.
- **📚 Course & Exam Hub**: Track course credits, target grades, instructor contact, and task completion progress per subject.
- **⏱️ Focus & Pomodoro Timer**: Dedicated Focus, Short Break, and Long Break modes that automatically record verified study hours to your profile.
- **🔒 Authentication & Security**: Secure user registration and login with bcrypt password hashing and JWT authorization.
- **💾 Embedded Database**: Persistent local SQLite storage with zero external database configuration requirements.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v6
- **Backend**: Node.js, Express.js, REST API architecture
- **Database**: SQLite (`sql.js` WebAssembly + Persistent Disk Storage)
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs`
- **Testing**: Built-in `node:test` and `node:assert` test suite

---

## 📦 Project Structure

```
AI STUDENT PLANNER/
├── client/                     # Frontend React + Vite Application
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Layout, Modal, StatCard, Badge
│   │   ├── context/            # AuthContext (global state)
│   │   ├── pages/              # Dashboard, Planner, Tasks, Courses, Focus, Settings, Login, Register
│   │   └── services/           # Centralized API client
│   └── package.json
├── server/                     # Backend Express.js API
│   ├── src/
│   │   ├── controllers/        # Auth, Courses, Tasks, Sessions, Planner, Analytics
│   │   ├── db/                 # SQLite connection & schema initialization
│   │   ├── middleware/         # JWT Auth middleware
│   │   ├── routes/             # Express API routes
│   │   └── services/           # AI algorithmic study planner engine
│   ├── test/                   # Automated API test suite
│   └── package.json
└── README.md
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Environment Setup

Copy `.env.example` in `server/` to `.env`:
```bash
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=
```

### 3. Start Development Servers

**Backend:**
```bash
cd server
npm run dev
```
*Server runs on `http://localhost:5000`*

**Frontend:**
```bash
cd client
npm run dev
```
*Client runs on `http://localhost:3000`*

---

## 🧪 Running Tests

To run the automated backend test suite:
```bash
cd server
npm test
```

---

## 📄 License

MIT License. Created for students worldwide.
