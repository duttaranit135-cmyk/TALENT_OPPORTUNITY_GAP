# SkillBridge Backend

Complete, secure, deterministic backend for **SkillBridge** built with Next.js 14 App Router, TypeScript, Prisma ORM, PostgreSQL, Supabase Authentication (`@supabase/ssr`), and Zod.

> **Zero AI/ML Policy:** Built entirely using deterministic algorithms, TypeScript logic, Prisma queries, and predefined templates. No AI/ML packages or external AI APIs.

---

## 1. Architecture & Tech Stack

- **Framework:** Next.js 14 App Router (`src/app/api/...`)
- **Language:** TypeScript 5
- **ORM:** Prisma 5.22.0
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- **Validation:** Zod 3

---

## 2. Database Schema (Prisma)

The database schema (`prisma/schema.prisma`) implements **exactly 8 models** and **6 enums**:

### Enums
- `Role`: `STUDENT`, `ORG_ADMIN`
- `ArtifactType`: `GITHUB_URL`, `PDF_LINK`, `TEXT`, `VIDEO_URL`, `FIGMA_URL`
- `SkillCategory`: `PROGRAMMING`, `DESIGN`, `RESEARCH`, `COMMUNICATION`, `DATA`, `OTHER`
- `OrgType`: `STARTUP`, `NGO`, `RESEARCH`, `CORPORATE`, `GOVERNMENT`
- `CommitmentType`: `ONE_TIME`, `PART_TIME`, `FULL_TIME`, `INTERNSHIP`
- `ProblemStatus`: `OPEN`, `CLOSED`, `DRAFT`

### Models
1. **User**: Maps directly to Supabase Auth UID. Stores student/admin profile details (`email`, `name`, `role`, `university`, `major`).
2. **Artifact**: User work submissions (`type`, `url`, `description`, `userId`).
3. **Skill**: Predefined skills across 6 categories.
4. **SkillProof**: Relates User, Skill, and Artifact with `confidenceScore: 80` and `source: "SELF_REPORTED"`. Unique constraint prevents duplicate proofs.
5. **Organization**: Community partners, startups, NGOs posting opportunities.
6. **Problem**: Real-world projects with required skills, deadline, commitment type, and status.
7. **Match**: Stores computed matching score, overlapping skills, and skill gaps between user and problem.
8. **OutreachDraft**: Saved personalized cold outreach emails generated from structured templates.

---

## 3. Predefined Skill Database & Seeding

Contains 35 skills across 6 categories:
- **PROGRAMMING (10):** Python, JavaScript, TypeScript, Java, C++, React, Node.js, SQL, HTML/CSS, Git
- **DESIGN (5):** UI Design, UX Research, Figma, Graphic Design, Prototyping
- **RESEARCH (5):** Data Analysis, Literature Review, Survey Design, Statistical Modeling, Academic Writing
- **COMMUNICATION (5):** Public Speaking, Technical Writing, Project Management, Team Leadership, Presentation
- **DATA (5):** Machine Learning, Data Visualization, Excel, Pandas, Tableau
- **OTHER (5):** Event Planning, Social Media, Video Editing, Photography, Fundraising

### Running Seed:
```bash
npm run db:seed
```

---

## 4. API Endpoints

### 1. Create Artifact
- **Endpoint:** `POST /api/artifacts`
- **Auth Required:** Yes
- **Body:**
```json
{
  "type": "GITHUB_URL",
  "url": "https://github.com/user/repo",
  "description": "My web app project",
  "skillNames": ["React", "TypeScript", "Node.js"]
}
```
- **Response (`201 Created`):**
```json
{
  "artifact": {
    "id": "uuid",
    "userId": "uuid",
    "type": "GITHUB_URL",
    "url": "https://github.com/user/repo",
    "description": "My web app project"
  },
  "skills": ["React", "TypeScript", "Node.js"]
}
```

### 2. List Open Problems With Match Scores
- **Endpoint:** `GET /api/problems`
- **Auth Required:** Yes
- **Formula:** `matchScore = Math.round((matchingSkills / totalRequiredSkills) * 100)`
- **Response (`200 OK`):**
```json
[
  {
    "id": "problem-uuid",
    "title": "Build a Dashboard",
    "organizationName": "Campus Food Bank",
    "matchScore": 67,
    "skillOverlap": ["React", "SQL"],
    "skillGap": ["Data Visualization"],
    "deadline": "2025-08-01T00:00:00.000Z",
    "commitmentType": "PART_TIME"
  }
]
```

### 3. Single Problem Details
- **Endpoint:** `GET /api/problems/[id]`
- **Auth Required:** Yes
- **Response (`200 OK`):**
```json
{
  "problem": {
    "id": "problem-uuid",
    "title": "Build a Dashboard",
    "description": "Full problem description...",
    "organizationName": "Campus Food Bank",
    "organization": { "id": "org-uuid", "name": "Campus Food Bank" },
    "requiredSkills": ["React", "Data Visualization", "SQL"]
  },
  "match": {
    "matchScore": 67,
    "skillOverlap": ["React", "SQL"],
    "skillGap": ["Data Visualization"]
  }
}
```

### 4. Skill Gap Learning Action Plan
- **Endpoint:** `GET /api/matches/[problemId]/action-plan`
- **Auth Required:** Yes
- **Formula:** `predictedScoreBoost = Math.round(100 / totalRequiredSkills)`
- **Response (`200 OK`):**
```json
{
  "steps": [
    {
      "skill": "Data Visualization",
      "url": "https://observablehq.com/tutorials",
      "description": "Observable tutorials",
      "minutes": 120,
      "predictedScoreBoost": 33
    }
  ]
}
```

### 5. Generate Cold Outreach Email
- **Endpoint:** `POST /api/outreach/generate`
- **Auth Required:** Yes
- **Body:**
```json
{
  "problemId": "problem-uuid",
  "tone": "formal" // 'formal' | 'casual' | 'enthusiastic'
}
```
- **Response (`201 Created`):**
```json
{
  "id": "draft-uuid",
  "problemId": "problem-uuid",
  "tone": "formal",
  "subjectLine": "Application: Build a Dashboard — Student Name",
  "body": "Dear Campus Food Bank Team,\n\n...",
  "createdAt": "2026-11-05T15:00:00.000Z"
}
```

---

## 5. Environment Configuration

Create a `.env` file in the root or backend directory:
```ini
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

## 6. Testing

Run the test suite:
```bash
npm test
```
Runs:
1. `tests/backend.test.ts`: Formula verification, Zod parsing, templates.
2. `tests/routes.test.ts`: Rejection of unauthorized requests (HTTP 401).
3. `tests/endpoints-logic.test.ts`: Mocked transactional database checks and calculation accuracy.
