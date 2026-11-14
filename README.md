# SkillPath AI
> **"Your Skills. Your Career. Your Personalized Journey."**

SkillPath AI is a production-grade, AI-powered learning and career platform built for college and engineering students, fresh graduates, job seekers, and working professionals. It combines algorithmic skill intelligence, a 7-agent multi-agent backend architecture, verifiable topic assessments, context-aware mentoring, and an adaptive learning engine that automatically adjusts roadmap pacing based on measured competency.

---

## 🌟 Key Platform Features

### 1. Robust Authentication & Onboarding
- **Multi-method Auth**: Registration with college, education level, and terms acceptance; Secure JWT session management; Google Sign-In simulation; Password recovery with reset token dispatch.
- **Agentic Onboarding Wizard**: Guided 4-step intake covering academic background, existing skills (with 5 proficiency tiers and evidence), target career role, and personal learning preferences (hours/week, visual/practical style, velocity pace).
- **Automated Synthesis**: Onboarding immediately executes the multi-agent orchestration pipeline to generate a tailored 4-phase learning roadmap.

### 2. Multi-Agent AI System (7 Backend Agents)
Orchestrated via a structured JSON exchange pipeline with an **Agent Activity Monitor** displaying live telemetry, task summaries, latency in milliseconds, and execution sources:
1. **Profile Analyzer Agent**: Synthesizes background, degree, hours, and pace into an actionable learner archetype and velocity recommendation.
2. **Skill Gap Analyzer Agent**: Calculates mathematically rigorous, weighted deficit scores comparing verified and self-reported skills against role benchmarks.
3. **Career Intelligence Agent**: Analyzes industry hiring trends, recruiter checklists, salary benchmarks, and high-leverage capstone themes.
4. **Learning Path Agent**: Constructs tailored 4-phase milestone roadmaps with estimated durations, completion criteria, and verified external resources.
5. **Assessment Agent**: Evaluates quiz and coding challenge submissions, categorizing errors into *conceptual*, *syntax/API*, or *edge-case* categories and pinpointing weak subtopics.
6. **AI Mentor Agent**: Context-aware conversational mentor grounded in the user's active profile, target role, and recent scores, with suggested follow-up prompts and mock interview simulation.
7. **Progress Optimization Agent**: Evaluates velocity, streak, and diagnostic results to dynamically inject remediation tasks or accelerate mastery.

### 3. Adaptive Learning Engine
- **Remediation Trigger (<70% Score)**: Automatically identifies weak topics, analyzes wrong answers, injects targeted review tasks into the active roadmap phase, and schedules a retest.
- **Mastery Acceleration (≥85% Score)**: Recognizes verified competency, grants a verifiable badge, skips redundant beginner milestones, and advances the learner.
- **Career Goal Transition**: Dynamically recalculates benchmark deltas, updates readiness metrics, and adapts roadmap milestones when a user switches their target role.
- **Audit Logging**: Every single adaptive change is logged in the `RoadmapAdjustmentLog` and explainable to the user in the roadmap view.

### 4. Interactive Skill Intelligence & Gap Analysis
- 7 Categories: Languages, Frameworks, Databases, Cloud/DevOps, Analytics/AI, Soft Skills, Other.
- 5 Standardized Proficiency Levels: Beginner (1) to Expert (5) with project evidence notes and assessment dates.
- Clear distinction between **Self-Reported** skills and **Assessment-Verified** skills with verifiable score badges.
- Transparent readiness calculation with clear, strict employment disclaimers.

### 5. Verified Resource Library
- Searchable directory of verified courses, official documentation, tutorials, and platforms.
- Filterable by skill, difficulty (Beginner, Intermediate, Advanced), duration, and provider.
- All external links point to official destinations (MDN Web Docs, React.dev, Python.org, PostgreSQL Tutorial, Docker Curriculum, Harvard CS50, MIT OpenCourseWare, freeCodeCamp, Kaggle).

### 6. Interactive Quizzes & Assessments
- Multi-topic question bank covering JavaScript, React, Python, SQL, Git & DevOps, and Data Structures.
- Timed examination mode (5-minute countdown), code snippet rendering, and instant diagnostic scoring.
- Question-by-question explanations with error classification breakdowns.

### 7. Verifiable Certificates & Portfolio Projects
- Claim tamper-proof certificates of competency upon reaching milestones.
- Verifiable credential IDs, verification hashes, and print-to-PDF certificate views.
- Project showcase for tracking open-source repositories and live deployments.

---

## 🏗 Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Recharts, canvas-confetti, Vite 6.
- **Backend API**: Node.js, Express, TypeScript, tsx, JWT, bcryptjs, uuid.
- **Database Layer**: File-backed relational JSON database engine (`server/db/database.ts`) with atomic write locking, indexing, and automatic demo seeding.
- **AI Engine**: Google Gemini API client with structured JSON output enforcement + high-fidelity deterministic heuristic engine that ensures 100% uptime with zero crashes when an API key is omitted.
- **Testing**: Node.js native test runner (`node --test`) covering 16 end-to-end integration workflows.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher, tested on Node v24.14.0)
- npm (v9.0.0 or higher)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "1 prompt war"
npm install
```

### 2. Environment Configuration
Copy the example environment file to `.env`:
```bash
cp .env.example .env
```
Default configuration values:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=skillpath_ai_super_secret_jwt_key_2025_change_in_production
GEMINI_API_KEY=
CLIENT_URL=http://localhost:3000
```
*(Note: If `GEMINI_API_KEY` is left blank, SkillPath AI automatically runs using its intelligent heuristic fallback engine without any loss of functionality.)*

### 3. Run Development Servers
Start both the Express API server (port 5000) and the Vite development client (port 3000) concurrently:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build & Production Start
```bash
# Build frontend and compile server TypeScript
npm run build

# Start production server (serves API and client assets on port 5000)
npm start
```

### 5. Run Automated Test Suite
```bash
npm test
```
All 16 test workflows validate authentication, role matching, gap analysis, roadmap adjustments, assessments, mentor chat, and notifications.

---

## 👤 Pre-Seeded Demo Credentials

To evaluate the platform immediately without registration, use the pre-seeded account:
- **Email**: `demo@skillpath.ai`
- **Password**: `Password123!`
*(A 1-click "Autofill Demo Account" button is also provided directly on the Login screen).*

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user with academic info |
| `/api/auth/login` | `POST` | Authenticate with email/password and obtain JWT |
| `/api/auth/google` | `POST` | One-click simulated Google OAuth sign-in |
| `/api/auth/forgot-password` | `POST` | Request password reset token |
| `/api/auth/reset-password` | `POST` | Set new password with token |
| `/api/profile` | `GET/PUT` | Retrieve or update user profile and preferences |
| `/api/profile/onboarding` | `POST` | Submit onboarding wizard and synthesize roadmap |
| `/api/skills` | `GET/POST` | List or declare new technical skills |
| `/api/skills/:id` | `PUT/DELETE`| Update proficiency level or delete skill |
| `/api/skills/gap-analysis` | `GET` | Calculate weighted readiness delta against target role |
| `/api/careers` | `GET` | List all 9 pre-configured career roles |
| `/api/careers/:id/intelligence` | `GET` | Run Career Intelligence Agent for a specific role |
| `/api/careers/select-target` | `POST` | Change target career and adapt roadmap |
| `/api/roadmap` | `GET` | Fetch active 4-phase learning roadmap |
| `/api/roadmap/task/:id/toggle` | `POST` | Toggle milestone completion and update progress |
| `/api/roadmap/regenerate` | `POST` | Recompute roadmap based on latest competencies |
| `/api/roadmap/adjustments` | `GET` | Audit log of all adaptive optimizations |
| `/api/assessments/questions` | `GET` | Retrieve questions by topic and difficulty |
| `/api/assessments/submit` | `POST` | Evaluate submission, classify errors, update badges |
| `/api/assessments/history` | `GET` | View previous assessment scores |
| `/api/mentor/chat` | `POST` | Context-aware technical mentorship query |
| `/api/agents/activity` | `GET` | Telemetry logs for all 7 multi-agent executions |
| `/api/agents/run` | `POST` | Manually invoke any individual agent |
| `/api/analytics` | `GET` | Retrieve radar chart, weekly activity, and streak data |
| `/api/resources` | `GET` | Filter verified courses, documentation, and guides |
| `/api/projects` | `GET/POST` | Manage user portfolio projects |
| `/api/certificates` | `GET/POST` | View and claim verifiable completion credentials |
| `/api/notifications` | `GET/PUT` | Manage real-time adaptive alerts |

---

## 📝 Limitations & Workarounds

1. **LLM Provider Quota & Offline Environments**:
   - *Limitation*: External LLM endpoints may be rate-limited, unreachable, or missing an API key.
   - *Workaround*: SkillPath AI includes a built-in deterministic heuristic engine for all 7 agents that generates structured JSON responses mirroring LLM outputs, ensuring 100% operational resilience.
2. **Third-Party OAuth Providers**:
   - *Limitation*: Live Google OAuth credentials require external Google Cloud Console project registration and domain verification.
   - *Workaround*: SkillPath AI provides a one-click simulated Google OAuth login endpoint (`POST /api/auth/google`) that provisions authentic sessions without external console setup.
3. **Email Dispatch in Development**:
   - *Limitation*: SMTP servers require external credentials to deliver physical emails.
   - *Workaround*: The password recovery flow returns a simulated reset token directly in the API response and guides the user through the reset interface.

---

## 📄 License
This project is licensed under the MIT License.
