# Course-Wise AI Token Usage Page - Design Specification

**Date:** 2026-07-23  
**Status:** Approved  
**Topic:** Dedicated `/usage` Page with Course-Wise Token Burn Aggregation & Breakdown  

---

## 1. Overview & Goals

Create a standalone **AI Token Usage Page** (`/usage`) that groups AI token consumption **course-wise**. Instead of an unorganized flat log, users can see total token burn per course, broken down into exact counts for:
- Course Outline Generation (`PLANNER`)
- Individual Lesson Content Generation (`CONTENT`)
- Quiz Generation (`QUIZ`)
- Capstone Oral Examination (`INTERVIEW`)
- Live AI Tutor Q&A Chat (`TUTOR`)

---

## 2. Backend Data Aggregation & API Specification

### 2.1 API Endpoint (`GET /api/ai/usage/courses`)
- Computes course-wise token totals by joining `AgentRun` records with `Course`, `Lesson`, `Quiz`, `Interview`, and `ChatSession` models.
- **Response Structure:**
  ```json
  {
    "overall": {
      "totalTokens": 14500,
      "promptTokens": 10200,
      "completionTokens": 4300,
      "totalCourses": 3,
      "totalRuns": 18
    },
    "courses": [
      {
        "courseId": "cuid123",
        "courseTitle": "Full-Stack React & Node.js",
        "status": "ACTIVE",
        "totalTokens": 8200,
        "promptTokens": 5800,
        "completionTokens": 2400,
        "breakdown": {
          "planner": 1200,
          "content": 4500,
          "quiz": 800,
          "interview": 1100,
          "tutor": 600
        },
        "runs": [
          {
            "id": "run1",
            "agent": "CONTENT",
            "entityType": "Lesson",
            "entityId": "lesson1",
            "label": "Lesson 1: Introduction to Components",
            "promptTokens": 700,
            "completionTokens": 450,
            "totalTokens": 1150,
            "createdAt": "2026-07-23T12:00:00Z"
          }
        ]
      }
    ],
    "unassociated": {
      "totalTokens": 300,
      "runs": []
    }
  }
  ```

---

## 3. Frontend UI/UX Architecture (`UsagePage.tsx`)

### 3.1 Route & Sidebar Navigation
- Register `/usage` route in `App.tsx`.
- Add **Token Usage** to `primaryNav` in `sidebar.tsx` with `Flame` icon.
- Update profile dropdown link in `sidebar.tsx` to point to `/usage`.

### 3.2 Page Component Layout (`UsagePage.tsx`)
1. **Top Summary Cards**: Overall Tokens Burned, Total Active Courses, Top Token Consuming Course.
2. **Course Cards Accordion List**:
   - Each course rendered as an expandable card.
   - **Card Header**: Course Title, Status Badge, Total Tokens Burned, and Activity Distribution Progress Bar.
   - **Card Body (Expanded)**:
     - 5 Sub-metric badges (Planner, Lessons, Quizzes, Capstone, Tutor).
     - **Itemized Execution Table**: Lists actual token counts per lesson/quiz/chat turn with timestamps and prompt/completion breakdowns.

---

## 4. Verification Plan

1. **API Verification:** Test `GET /api/ai/usage/courses` with curl or fetch to verify course grouping logic.
2. **UI Verification:** Test `/usage` route, expandable course accordions, and token count accuracy.
3. **Type Check:** Run `npm run typecheck` in `backend` and `npx tsc -b` in `frontend`.
