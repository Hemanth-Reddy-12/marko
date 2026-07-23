# Token Usage Tracking & Tutor UI Enhancements - Design Specification

**Date:** 2026-07-23  
**Status:** Approved  
**Topic:** Token Usage Metrics, AI Agent Execution History Table, Compact Hover Button & Fullscreen AI Tutor Drawer  

---

## 1. Overview & Objectives

This specification covers three key user experience and system analytics enhancements:

1. **Hover-Only Floating Tutor Button:** A compact circular FAB by default showing only the Bot icon, expanding on hover to reveal the text label.
2. **Fullscreen AI Tutor Mode:** A Maximize/Minimize toggle in the header of `CourseTutorDrawer` allowing learners to switch between side-drawer and peaceful 100% fullscreen mode.
3. **Account AI Token Burn Dashboard & History Table:** Full tracking of AI token consumption (`promptTokens`, `completionTokens`, `totalTokens`) across all system agents (Planner, Content Generator, Quiz Engine, Oral Examiner, and AI Tutor), presented in a clean UI stats cards & history table.

---

## 2. Database Schema & Token Tracking

### 2.1 Prisma Schema Update (`schema.prisma`)
Add token consumption fields to the `AgentRun` model:

```prisma
model AgentRun {
  id               String         @id @default(cuid())
  agent            AgentType
  entityType       String
  entityId         String
  attempt          Int
  status           AgentRunStatus
  promptVersion    String
  input            Json?
  output           Json?
  error            String?
  promptTokens     Int            @default(0)
  completionTokens Int            @default(0)
  totalTokens      Int            @default(0)
  startedAt        DateTime
  finishedAt       DateTime?
  userId           String?
  user             User?          @relation(fields: [userId], references: [id])
  createdAt        DateTime       @default(now())

  @@index([entityType, entityId])
  @@index([userId])
}
```

---

## 3. Backend API & Token Metric Services

### 3.1 AI Provider Integration & Token Estimation
- Update `runAgent` in `backend/src/lib/agent-run.ts` to capture usage metadata or estimate tokens based on input/output character length (approx 4 chars/token standard fallback) if direct provider metadata is absent.
- Update AI Tutor turn runner to log `AgentRun` for `TUTOR` agent execution with prompt and completion token counts.

### 3.2 AI Usage API Router (`backend/src/modules/ai-config/ai-config.controller.ts`)
Add endpoint:
- **`GET /api/ai/usage`**: Returns:
  - `stats`: `{ totalTokens: number, promptTokens: number, completionTokens: number, totalRuns: number }`
  - `history`: List of `AgentRun` objects sorted by `createdAt desc`.

---

## 4. Frontend UI/UX Components

### 4.1 Hover-Only Tutor Button (`TutorFloatingButton.tsx`)
- Default state: `w-12 h-12 rounded-full p-0 flex items-center justify-center` displaying the Bot icon.
- Hover state: Smoothly expands to `px-4 py-3 rounded-full` revealing `"Ask AI Tutor"`.

### 4.2 Fullscreen AI Chat Drawer (`CourseTutorDrawer.tsx`)
- Adds Maximize/Minimize toggle icon (`Maximize2` / `Minimize2`) in the drawer header.
- Dynamic drawer width:
  - Standard: `w-full sm:w-[480px] md:w-[540px]`
  - Fullscreen: `w-full h-full inset-0`

### 4.3 Token Burn & Usage History Component (`AiTokenUsageDashboard.tsx`)
- Embedded in `SettingsPage.tsx` under AI Providers & Usage tab.
- Includes:
  - **3 Metric Summary Cards:** Total Tokens Burned, Generation Tokens (Planner/Content/Quiz), Interactive Tokens (Examiner/Tutor).
  - **Execution History Table:** Columns for Date/Time, Agent Type, Target Entity, Prompt Tokens, Completion Tokens, Total Burn, Status.

---

## 5. Verification Plan

1. **Prisma Push:** Run `npx prisma db push` and `npx prisma generate`.
2. **Backend Verification:** Execute agent runs (Planner, Content, Tutor) and confirm `AgentRun` records save token counts.
3. **Frontend Verification:** Test hover expansion on `TutorFloatingButton`, test drawer fullscreen toggle, and verify `GET /api/ai/usage` table rendering on Settings page.
4. **Type Check:** Run `npm run typecheck` across backend and frontend.
