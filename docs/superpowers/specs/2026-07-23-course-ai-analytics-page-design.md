# Course AI Analytics & Notification Real-Time Sync - Design Specification

**Date:** 2026-07-23  
**Status:** Approved  
**Topic:** Model Tracking, Course-Specific AI Analytics Page (`/usage/courses/:courseId`) with Recharts Graphs, and Real-time Notification Reloading  

---

## 1. Overview & Objectives

1. **AI Model & Token Breakdown:** Add `modelName` to `AgentRun` model and API outputs to track exact AI models (e.g. `gemini-2.5-flash`, `gpt-4o`) alongside Input (Prompt) and Output (Completion) tokens.
2. **Course AI Analytics Page (`/usage/courses/:courseId`):** A dedicated analytics page for each course featuring metric summary cards, Recharts visualizations (Activity Donut Chart, Timeline Area Chart, Model Bar Chart), and an itemized execution log table.
3. **Notification Auto-Reload Fix:** Refactor `NotificationMenu.tsx` to refresh notifications when opening the dropdown and listen for real-time socket events so notifications sync immediately when Sonner toasts pop up.

---

## 2. Database Schema & Agent Run Tracking

### 2.1 Prisma Schema (`schema.prisma`)
Add `modelName String?` to `AgentRun`:

```prisma
model AgentRun {
  id               String         @id @default(cuid())
  agent            AgentType
  entityType       String
  entityId         String
  attempt          Int
  status           AgentRunStatus
  promptVersion    String
  modelName        String?
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

### 2.2 Agent Tracker Update (`agent-run.ts`)
Store `modelName: provider.info.model` when creating/updating `AgentRun` records.

---

## 3. Backend API Specification

### 3.1 `GET /api/ai/usage/courses/:courseId`
- Fetches detailed analytics for a single course:
  - **Summary**: Total Tokens, Input Tokens, Output Tokens, Total Runs, Primary Model.
  - **Activity Breakdown**: Tokens spent per agent type (`PLANNER`, `CONTENT`, `QUIZ`, `INTERVIEW`, `TUTOR`).
  - **Model Breakdown**: Token burn grouped by AI model.
  - **Timeline Data**: Token burn aggregated over time (daily).
  - **Runs List**: Full itemized execution list.

---

## 4. Frontend UI/UX Architecture

### 4.1 Course AI Analytics Page (`CourseUsageAnalyticsPage.tsx`)
- Registered at route `/usage/courses/:courseId`.
- **Top Summary Cards**: Total Tokens, Input (Prompt) Tokens, Output (Completion) Tokens, Primary AI Model.
- **Recharts Visualizations**:
  - **Activity Distribution Pie/Donut Chart** (`PieChart`, `Pie`, `Cell`, `Tooltip`).
  - **Token Burn Timeline Area Chart** (`AreaChart`, `Area`, `XAxis`, `YAxis`, `Tooltip`).
  - **Model Usage Bar Chart** (`BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`).
- **Itemized Execution Table**: Detailed table listing timestamp, item/lesson title, agent type, model name, input tokens, output tokens, total burn.

### 4.2 Notification Menu Auto-Reload Fix (`NotificationMenu.tsx`)
- Trigger `fetchNotifications()` whenever `isOpen` transitions to `true`.
- Subscribe to `socket.on("notification", ...)` from `useSocketContext` / socket hook to immediately reload notifications.

---

## 5. Verification Plan

1. **Database Sync:** Run `npx prisma db push` & `npx prisma generate`.
2. **Backend Verification:** Execute agent runs and verify `modelName`, `promptTokens`, and `completionTokens` in database.
3. **Analytics Page:** Navigate to `/usage/courses/:courseId` and verify Recharts rendering and table filtering.
4. **Notification Test:** Trigger a notification event and verify dropdown auto-reloads.
5. **Type Check:** Run `npm run typecheck` in `backend` and `npx tsc -b` in `frontend`.
