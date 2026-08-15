# JobPilot AI — Autonomous Job Search & Application Platform

![JobPilot AI](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

**Your AI Career Agent — Find the right jobs, understand your chances, apply smarter, and track everything.**

## 🚀 Features

### Core Platform
- **AI Profile Analysis** — Extract skills, experience, and projects from your resume/portfolio
- **Multi-Source Job Discovery** — Search across multiple legitimate job sources
- **AI Job Matching** — 8-factor weighted scoring system for accurate fit prediction
- **Shortlist Probability** — AI-estimated chance of being shortlisted
- **Smart Deduplication** — Same job from multiple sources shown as one opportunity
- **Assisted Applications** — Auto-generated cover letters, answers, and resume highlights

### Automation
- **3 Control Modes** — Manual, Assisted, or Autonomous (where permitted)
- **24/7 Job Monitoring** — Scheduled background scanning
- **Application Limits** — Configurable daily/hourly caps
- **Approval Rules** — Require human confirmation based on fit score

### Tracking & Analytics
- **Application Tracker** — Kanban and table views for all applications
- **Response Detection** — AI classification of recruiter emails
- **Career Analytics** — Response rates, best-performing roles, source performance
- **Activity Logs** — Complete audit trail of all actions

### Intelligence
- **AI Career Copilot** — Natural language interface for job search
- **Daily Briefing** — Personalized summary of opportunities
- **Learning Loop** — Recommendations based on application outcomes
- **Job Safety Scoring** — Scam detection and verification

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd jobpilot-ai
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb jobpilot_db

# Copy environment file
cp .env.example .env

# Edit .env with your database URL
DATABASE_URL=postgresql://user:password@localhost:5432/jobpilot_db
```

### 3. Initialize Database

```bash
npx drizzle-kit push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔐 Required Credentials for Production

### Minimum Required

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | Your database provider (Vercel Postgres, Supabase, Neon, etc.) |
| `SESSION_SECRET` | Session encryption key | Generate: `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Data encryption key | Generate: `openssl rand -base64 32` |

### AI Features (Required for full functionality)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `OPENAI_API_KEY` | OpenAI API key | [OpenAI Platform](https://platform.openai.com/api-keys) |
| **OR** `GOOGLE_AI_API_KEY` | Google Gemini API key | [Google AI Studio](https://aistudio.google.com/apikey) |
| **OR** `ANTHROPIC_API_KEY` | Anthropic Claude API key | [Anthropic Console](https://console.anthropic.com/) |

### Optional Integrations

| Variable | Description | How to Get |
|----------|-------------|------------|
| `GOOGLE_CLIENT_ID` | Gmail OAuth (response detection) | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Gmail OAuth secret | Same as above |
| `GITHUB_CLIENT_ID` | GitHub OAuth (profile import) | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | Same as above |
| `REDIS_URL` | Background job queue | [Upstash](https://upstash.com/) or self-hosted Redis |
| `SENTRY_DSN` | Error tracking | [Sentry](https://sentry.io/) |

## 🚀 Deployment to Vercel

### 1. Connect Repository

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your repository

### 2. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```
DATABASE_URL=your-postgres-url
SESSION_SECRET=your-secret
ENCRYPTION_KEY=your-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Database Setup

**Option A: Vercel Postgres**
1. In Vercel Dashboard → Storage → Create Database
2. Connect to your project
3. `DATABASE_URL` is auto-configured

**Option B: External Database**
1. Use Neon, Supabase, Railway, or your preferred provider
2. Set `DATABASE_URL` in environment variables

### 4. Deploy

```bash
vercel --prod
```

### 5. Initialize Database Schema

After first deployment:
```bash
npx drizzle-kit push
```

Or via Vercel CLI:
```bash
vercel env pull .env.local
npx drizzle-kit push
```

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js App Router + React + Tailwind CSS                  │
├─────────────────────────────────────────────────────────────┤
│                         API Layer                            │
│  /api/profile    /api/jobs    /api/applications             │
│  /api/copilot    /api/automation    /api/responses          │
├─────────────────────────────────────────────────────────────┤
│                      Core Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Scoring  │  │ Matching │  │ Document │  │ Copilot  │    │
│  │ Engine   │  │ Engine   │  │Generator │  │   AI     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    Job Source Adapters                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Demo   │  │ LinkedIn │  │  Indeed  │  │  Other   │    │
│  │ (Sample) │  │(Assisted)│  │(Assisted)│  │ Sources  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│                       Database                               │
│  PostgreSQL + Drizzle ORM                                   │
│  users, profiles, jobs, scores, applications, responses     │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 Job Source Integration

Most job platforms **do not provide public APIs** for automated applications. Our architecture supports:

| Mode | Description |
|------|-------------|
| **Connected** | Full API access (rare) |
| **Assisted** | We discover and prepare; you submit manually |
| **Unavailable** | Platform not yet integrated |

### Adding New Sources

Create an adapter in `src/lib/job-sources/`:

```typescript
import { JobSourceAdapter } from "./adapter";

export class MySourceAdapter implements JobSourceAdapter {
  sourceName = "mysource";
  displayName = "My Source";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params) { /* ... */ }
  async getJobDetails(jobId) { /* ... */ }
  getOriginalUrl(jobId) { /* ... */ }
  async checkApplicationStatus(id) { /* ... */ }
  async isAvailable() { /* ... */ }
}
```

## 🔒 Security & Compliance

- ✅ **No CAPTCHA bypass** — We never circumvent security measures
- ✅ **No credential theft** — OAuth only, no password storage
- ✅ **No fake data** — Demo mode clearly labeled
- ✅ **Platform TOS compliance** — Assisted mode when automation not permitted
- ✅ **Truthful applications** — Never fabricates experience or qualifications
- ✅ **Rate limiting** — Configurable application limits
- ✅ **Audit logging** — Complete activity trail

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/           # Authenticated app routes
│   │   ├── dashboard/   # Main dashboard
│   │   ├── jobs/        # Job discovery & details
│   │   ├── applications/# Application tracker
│   │   ├── responses/   # Response center
│   │   ├── automation/  # Automation settings
│   │   ├── analytics/   # Career analytics
│   │   ├── profile/     # Candidate profile
│   │   ├── settings/    # User settings
│   │   └── onboarding/  # Setup wizard
│   ├── api/             # API routes
│   └── page.tsx         # Landing page
├── components/          # React components
├── lib/
│   ├── ai/              # AI engines
│   ├── job-sources/     # Source adapters
│   └── types.ts         # TypeScript types
└── db/
    ├── schema.ts        # Database schema
    └── index.ts         # DB connection
```

## 🧪 Testing

```bash
# Type check
npm run typecheck

# Build
npm run build

# Run tests (when implemented)
npm test
```

## 📝 API Reference

### Profile
- `GET /api/profile` — Get candidate profile
- `POST /api/profile` — Create/update profile

### Jobs
- `POST /api/jobs/search` — Search for jobs
- `GET /api/jobs` — List discovered jobs
- `GET /api/jobs/[id]` — Get job details

### Applications
- `GET /api/applications` — List applications
- `POST /api/applications` — Create application
- `PUT /api/applications/[id]` — Update status

### AI Copilot
- `POST /api/copilot` — Query AI assistant
- `POST /api/copilot { type: "briefing" }` — Daily briefing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License — see LICENSE file

---

**Built with ❤️ for job seekers everywhere**

*JobPilot AI is an autonomous job search agent that respects platform rules and never fabricates information.*
