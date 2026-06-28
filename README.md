# Project Marko — System Architecture & Product Specification

---

##  1. Project Definition (What You Are Developing)

Project Marko is an autonomous, event-driven learning platform that transforms a user's high-level learning goal into a fully interactive, custom-generated educational curriculum. Instead of serving static, pre-recorded content, the system acts as a live educational architect and evaluator.

The application dynamically coordinates multiple specialized AI agents to plan courses, generate rich lesson content on-demand, produce targeted quizzes, and conduct a live, real-time conversational mock interview over WebSockets to evaluate whether the student has mastered the material.

---

## 2. Comprehensive System Architecture

The platform uses a decoupled, stateful architecture designed to handle asynchronous AI operations, transactional state changes, and real-time bidirectional data streaming.

```
                  [ React / Vite Frontend Client ]
                     │                      ▲
                     │ (REST APIs)          │ (WebSockets / Socket.io)
                     ▼                      ▼
         [ Express 5 Core API ] ───► [ Socket.io Gateway Server ]
                     │                      ▲
                     │                      │ (Pub/Sub Event Sync)
                     ▼                      ▼
         [ AgentRun Lifecycle ] ◄──► [ Redis Memory & Event Bus ]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  [ OpenAI SDK ]      [ Google Gen AI SDK ]
(Structured JSON)       (Structured JSON)
         │                       │
         └───────────┬───────────┘
                     ▼
       [ PostgreSQL DB via Prisma 7 ]

```

### Backend Architecture Components

* **Express 5 Application Server:** Manages standard REST HTTP lifecycles, body parsing, route authentication middleware, and execution guardrails.
* **Socket.io Gateway + Redis Adapter:** Establishes a persistent, stateful, bidirectional transport layer for the real-time chat interface. The `@socket.io/redis-adapter` binds the WebSocket layer to a Redis Pub/Sub instance, enabling multi-instance horizontal scaling and state synchronization.
* **AI Provider Engine (Factory Pattern):** A unified interface abstraction that routes incoming inference calls to either the `openai` SDK or the `@google/generative-ai` SDK. It mandates the use of **Native Structured Outputs** at the provider level, ensuring all LLM responses rigidly conform to the system's strict database types.
* **AgentRun Lifecycle Manager:** An isolated telemetry wrapper that intercepts every outbound AI request. It records execution metrics, inputs, outputs, timestamps, prompt versions, and errors to provide complete visibility into model behavior.
* **Prisma 7 ORM & PostgreSQL Database:** The data layer utilizing transactional guarantees to execute multi-row changes, blocking out race conditions during lazy content generation steps.

### Frontend UI Architecture Components

* **Feature-Sliced Client Structure:** Code is divided into clean operational domains (`course`, `lesson`, `quiz`, `chat`), ensuring complete isolation of UI components, hooks, and API calling files.
* **shadcn/ui Foundational Design:** Uses accessible, cleanly structured components (`Button`, `Card`, `ScrollArea`, `Progress`, `RadioGroup`) managed directly via Tailwind CSS utility classes.
* **21st.dev Micro-Interactions:** Infuses advanced visual enhancements directly into the layout, using specialized UI treatments like shimmer loading states, text-reveal thresholds for newly generated data, and real-time typing indicators within conversational streams.

---

## 3. Core Operational Workflow

The application operates as a reactive state machine. The lifecycle transitions systematically from initial course curation to final capstone evaluation.

```
[ User Input Goal ] ──► ( Planner Agent ) ──► State: Course READY / Lessons LOCKED
                                                     │
                                                     ▼
[ Access Lesson ]   ──► ( Content Agent ) ──► State: Lesson GENERATED / IN_PROGRESS
                                                     │
                                                     ▼
[ Request Assessment ] ──► ( Quiz Agent ) ──► State: Quiz GENERATED
                                                     │
                                                     ▼
[ Submit Answers ]  ──► [ Deterministic Eval ] ──► Pass? ──► YES ──► Unlock Next Lesson
                                   │                       └──► NO  ──► Generate Quiz V2
                                   ▼
                       All Lessons Completed? ──► Unlock Capstone Interview
                                                                   │
                                                                   ▼
[ Open WebSocket ] ──► ( Interview Agent ) ──► Real-Time Q&A ──► Final Evaluation

```

### Phase 1: Course Blueprinting

1. The user inputs a learning goal and an intended duration (in days) via the frontend client.
2. The system provisions a `Course` record locked in a `GENERATING` state.
3. The **Planner Agent** processes the parameters, generating a structured JSON array detailing individual lesson topics, modules, and their precise structural order.
4. On a successful response, a database transaction updates the `Course` state to `READY` and populates the `Lesson` records. The first lesson is set to `AVAILABLE`, while all subsequent lessons remain explicitly `LOCKED`.

### Phase 2: Lazy Content Engine

1. When a user clicks into an `AVAILABLE` lesson, the frontend triggers a data fetch.
2. A database transaction checks the `generationStatus`. If it reads `NOT_GENERATED`, the system immediately transitions the state to `GENERATING` and locks the record.
3. The **Content Agent** builds the markdown body based on the lesson's structural context.
4. The backend writes the payload to disk, updates the state to `GENERATED`, and delivers the markdown payload to the user client. Subsequent visits load the cached text instantly.

### Phase 3: Deterministic Progress Evaluation

1. Accessing a lesson quiz dynamically spins up the **Quiz Agent** to compile interactive questions if they do not yet exist.
2. The user answers the questions and hits submit.
3. The **Evaluation Engine** runs **purely deterministic server-side code** (no AI call). It computes a score by comparing the input indices against the correct answers saved in the JSON schema.
4. **Success Pipeline ($\ge 60\%$):** The current lesson shifts to `COMPLETED`, and the next sequential lesson's status transitions from `LOCKED` to `AVAILABLE`.
5. **Failure Pipeline ($< 60\%$):** The system flags the current quiz version as exhausted, auto-creates a new blank `Quiz` record incremented to `Version + 1`, and updates the status to `NOT_GENERATED`, prompting a fresh layout generation on the next attempt.

### Phase 4: Capstone Interview Real-Time Chat

1. Once all lessons are marked `COMPLETED`, the final capstone interview unlocks.
2. The user requests an interview initialization, triggering the **Interview Agent** to analyze the entire course history and pre-generate a master list of tailored examination milestones.
3. The frontend initiates a connection over WebSockets, establishing a persistent channel anchored to a dedicated `ChatSession`.
4. The server pushes the first question across the socket pipe. The conversation proceeds in real time. Each incoming answer is committed to the database as a `ChatMessage`, and the backend continuously serves succeeding follow-up questions over the active connection.

---

## 4. Data Pipeline & AI Processing Engine

All unstructured prompt parameters are wrapped in strict input/output control pipelines to prevent system errors.

### The Input-Output Sanitization Framework

```
[ Incoming Request / Event Payload ]
                 │
                 ▼
     [ Zod Request Validator ] ──── ( Rejects Bad Payloads Instantly )
                 │
                 ▼
   [ Prompt Template Orchestrator ] ── ( Injects Token Versions & System Instructions )
                 │
                 ▼
 [ LLM Engine w/ Native Structured Outputs ] ── ( OpenAI JSON Schema / Gemini ResponseSchema )
                 │
                 ▼
  [ Transactional Persistence Layer ] ── ( Atomic Database Writes )

```

1. **Request Ingestion:** User payload arrives via REST API or WebSocket packet.
2. **Schema Validation:** Zod schemas structurally validate incoming request fields before any AI modules trigger.
3. **Prompt Template Composition:** The system merges user parameters into versioned prompt templates stored explicitly within `src/agents/prompts/`. These templates contain immutable system directives, context definitions, and output expectations.
4. **Enforced Schema Inference:** Requests pass directly into the AI Engine (OpenAI/Gemini). By utilizing native SDK structured output flags (`response_format` or `responseSchema`), the API gateway forces the model's internal sampling engine to restrict its output vocabulary exclusively to a valid JSON map matching the database requirements.
5. **Atomic Persistence:** The returned JSON object maps directly onto PostgreSQL column types via Prisma transactions, minimizing the risk of corrupted or malformed writes.

---

## 5. Ultimate Project Output

The output of this system is a **personalized, high-fidelity learning management ecosystem** tailored to individual user goals. It provides concrete deliverables across three primary categories:

### Educational Assets

* **Custom Curriculum Blueprints:** Organized multi-day course paths with explicitly ordered instructional modules.
* **On-Demand Textbooks:** Completely context-aware markdown lesson segments styled dynamically on the client interface.
* **Dynamic Knowledge Checkpoints:** Tailored multiple-choice diagnostic quizzes containing detailed correct-answer rationale strings.

### Interactive Experiences

* **Real-Time Conversational Examination Suite:** A stateful, real-time chat interface driven by persistent WebSockets and backend Redis Pub/Sub management. It simulates an oral interview examination without page refreshes, round-trip HTTP delays, or disconnected UI states.

### Data & Telemetry Records

* **Diagnostic Transcripts:** Comprehensive conversation histories compiled chronologically inside structured relational tables (`ChatSession` and `ChatMessage`).
* **Mastery Performance Reviews:** Detailed final evaluations containing a quantitative grading score, pass/fail status updates, an analytical critique of student performance, and an AI-generated study plan outlining gaps in understanding.
* **System Execution Logging:** Immutable tracking logs detailing model latency, tokens consumed, and error traces inside the `AgentRun` schema for system auditing.

---

Here is the complete, comprehensive directory blueprint for both the backend and frontend. You can use this as your definitive file-creation reference map as you scale through the codebase.

---

## 1. Backend Directory Layout (`/backend`)

```text
backend/
├── prisma/
│   └── schema.prisma                 # Core PostgreSQL database schema (Tasks 1a-1g)
├── src/
│   ├── config/
│   │   └── env.ts                    # Zod environmental variable schema definition (Task 1h)
│   ├── middleware/
│   │   └── auth.middleware.ts        # Session identification & req.user injector middleware
│   ├── lib/
│   │   ├── ai.ts                     # AI multi-provider client factory with structured output rules (Task 2)
│   │   ├── agent-run.ts              # Higher-order interceptor wrapper for lifecycle metrics tracking (Task 3)
│   │   └── state-machine.ts          # Synchronous transaction transition helper utility (Task 4)
│   ├── agents/
│   │   ├── planner.agent.ts          # Course syllabus structuring model orchestrator (Task 5)
│   │   ├── content.agent.ts          # Article text generation and formatting asset compiler (Task 6)
│   │   ├── quiz.agent.ts             # Multiple choice verification dataset planner (Task 7)
│   │   ├── interview.agent.ts        # Active real-time dialogue and review evaluation builder (Task 8)
│   │   └── prompts/                  # Versioned model constraints templates mapping (Task 10)
│   │       ├── planner.prompt.ts
│   │       ├── content.prompt.ts
│   │       ├── quiz.prompt.ts
│   │       ├── interview-generate.prompt.ts
│   │       ├── interview-evaluate.prompt.ts
│   │       └── versions.ts
│   ├── modules/                      # Domain functional controllers split by layer vertical cuts
│   │   ├── course/
│   │   │   ├── course.controller.ts
│   │   │   ├── course.router.ts
│   │   │   ├── course.server.ts
│   │   │   ├── course.types.ts
│   │   │   └── course.validate.ts    # Zod schema input validator contracts (Task 11)
│   │   ├── lesson/
│   │   │   ├── lesson.controller.ts
│   │   │   ├── lesson.router.ts
│   │   │   ├── lesson.server.ts
│   │   │   ├── lesson.types.ts
│   │   │   └── lesson.validate.ts
│   │   ├── quiz/
│   │   │   ├── quiz.controller.ts
│   │   │   ├── quiz.router.ts
│   │   │   ├── quiz.server.ts
│   │   │   ├── quiz.types.ts
│   │   │   └── quiz.validate.ts
│   │   └── chat/                     # Real-time WebSocket architecture
│   │       ├── chat.gateway.ts       # Socket.io connection event bindings (Redis Pub/Sub backed)
│   │       ├── chat.controller.ts
│   │       ├── chat.router.ts
│   │       ├── chat.server.ts
│   │       ├── chat.types.ts
│   │       └── chat.validate.ts
│   └── server.ts                     # Central gateway bootstrapper and route application tier (Task 9)
├── .env                              # Local parameter keys repository
├── package.json
└── tsconfig.json

```

---

## 2. Frontend Directory Layout (`/frontend`)

```text
frontend/
├── src/
│   ├── assets/                       # Global branding resources and static vectors
│   ├── components/
│   │   ├── ui/                       # Accessible shadcn/ui components directory (atomic layout blocks)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── badge.tsx
│   │   │   └── toast.tsx
│   │   ├── animated/                 # 21st.dev inspired customized interface layout micro-interactions
│   │   │   ├── shimmer-button.tsx    # Custom premium state triggering element
│   │   │   ├── text-reveal.tsx       # Dynamic incremental visual reveal block for generated assets
│   │   │   └── typing-indicator.tsx  # Dynamic inline typing status component for conversation threads
│   │   └── layout/
│   │       ├── sidebar.tsx           # Global course curriculum catalog navigation panels
│   │       ├── navbar.tsx            # Context identity container elements
│   │       └── app-shell.tsx         # Unified frame composition grid engine
│   ├── config/
│   │   └── constants.ts              # Network interface paths and static configuration bindings
│   ├── hooks/
│   │   ├── useWebSocket.ts           # Socket.io connection instance manager handling recovery logic
│   │   └── useAuth.ts                # Session state context retrieval abstraction hook
│   ├── lib/
│   │   ├── axios.ts                  # Axios interceptors instance matching infrastructure standards
│   │   └── utils.ts                  # Standard tailwind-merge CSS grouping class compilers
│   ├── features/                     # Feature bundles grouping types, components, and services
│   │   ├── course/
│   │   │   ├── api/
│   │   │   │   └── course.api.ts     # Course structure REST mutations and queries mapping hooks
│   │   │   ├── components/
│   │   │   │   ├── CourseCard.tsx
│   │   │   │   ├── CourseList.tsx
│   │   │   │   └── PlannerForm.tsx   # Request parameter collector form panel
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── lesson/
│   │   │   ├── api/
│   │   │   │   └── lesson.api.ts
│   │   │   ├── components/
│   │   │   │   └── LessonViewer.tsx  # Dynamic structural markdown consumer wrapper page
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── quiz/
│   │   │   ├── api/
│   │   │   │   └── quiz.api.ts
│   │   │   ├── components/
│   │   │   │   └── QuizInterface.tsx # Radio-group selector array with submit processing
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── chat/
│   │       ├── api/
│   │       │   └── chat.api.ts
│   │       ├── components/
│   │       │   └── ChatUI.tsx        # Stream presentation chat interface built over ScrollArea
│   │       └── types/
│   │           └── index.ts
│   ├── pages/                        # Interface entry point coordinators assembling features layout
│   │   ├── Dashboard.tsx             # System user path summary page housing CourseList layout
│   │   ├── CourseView.tsx            # Context core workspace rendering lesson text frameworks
│   │   └── InterviewRoom.tsx         # Stateful operational module hosting WebSockets workspace components
│   ├── App.tsx                       # Universal react-router browser configuration tree node
│   └── main.tsx                      # Production instance boot wrapper
├── tailwind.config.js                # Design token mapping file configuration
├── components.json                   # Local shadcn structure config metadata configuration file
├── package.json
└── vite.config.ts

```


---

# Project Marko — Vertical Slices Implementation Plan

---

## Slice 1: Foundation & Infrastructure Setup

### Backend Tasks

* [ ] **Environment Configuration:** Initialize `backend/src/config/env.ts` using Zod validation:
```ts
PORT: z.string().default("3000"),
DATABASE_URL: z.string(),
REDIS_URL: z.string().default("redis://localhost:6379"),
OPENAI_API_KEY: z.string(),
GOOGLE_AI_API_KEY: z.string()

```


* [ ] **Database Initialization:** Run `npx prisma migrate dev --name init` to apply the baseline schema and generate the Prisma client.
* [ ] **Core AI Factory (`src/lib/ai.ts`):** Build a unified router managing OpenAI and Google Gen AI SDK clients. Implement native structured output schemas using `response_format` (OpenAI JSON Schema) and `responseSchema` (Gemini config).
* [ ] **AgentRun Telemetry (`src/lib/agent-run.ts`):** Program the `runAgent` higher-order interceptor function. Ensure it records row entries inside the `AgentRun` table matching execution states (`RUNNING`, `SUCCESS`, `FAILED`).
* [ ] **Server Initialization:** Configure Express 5 with global error handling, standard JSON body parsers, and a baseline authentication middleware stub injecting a fallback user context (`req.user.id`).

### Frontend Tasks

* [ ] **Environment Setup:** Scaffold a clean React + Vite + TypeScript runtime application.
* [ ] **Tailwind & shadcn/ui Setup:** Install Tailwind CSS and initialize components via `npx shadcn-ui@latest init`. Add the fundamental component layout assets: `Button`, `Card`, `Input`, and `Toast`.
* [ ] **HTTP Client Core (`src/lib/axios.ts`):** Instantiate an Axios client preset with global base URLs, interceptors tracking authentication payloads, and unified fallback error messaging.
* [ ] **AppShell Structure (`src/components/layout/`):** Code a baseline workspace dashboard containing a responsive sidebar utility list and main layout display portals.

### Verification Milestone

* Deploying a network ping target against `/api/health` from the frontend app shell completes without authentication degradation, returning an explicit database connection verify notice.

---

## Slice 2: The Planner Agent (Course Generation)

### Backend Tasks

* [ ] **Prompt Blueprint (`src/agents/prompts/planner.prompt.ts`):** Design strict template instructions enforcing structured layouts detailing individual core lesson profiles:
```json
{
  "title": "Course Title String",
  "description": "Comprehensive Description String",
  "lessons": [{ "title": "Lesson Subject", "order": 1 }]
}

```


* [ ] **Orchestration Logic (`src/agents/planner.agent.ts`):** Link the prompt template to the `runAgent` pipeline wrapper.
* [ ] **API Controller Surface (`src/modules/course/`):** Expose the execution target at `POST /api/courses`. Wrap the database initialization processes within an atomic **Prisma transaction** (`$transaction`):
* Create the base `Course` entry flagged as `GENERATING`.
* Deliver parameters to the AI layer.
* Write the lesson block structural rows to disk following an error-free execution layout return.
* Transition the parent `Course` record status parameter directly to `READY`.



### Frontend Tasks

* [ ] **Input Controller Surface (`src/features/course/components/PlannerForm.tsx`):** Build a structured course initialization layout using shadcn forms. Inject custom 21st.dev tracking treatments (e.g., an animated shimmer tracking button).
* [ ] **Dashboard Index View (`src/features/course/components/CourseList.tsx`):** Design an asynchronous summary table component to fetch and display active course collections (`GET /api/courses`). Add structural card skeletons to represent items actively processing inside the pipeline.

### Verification Milestone

* Submitting a goal parameter via the frontend UI triggers an asynchronous loader mechanism, blocks concurrent inputs, creates a course outline containing separate lesson objects in the database, and renders the course card dashboard elements successfully.

---

## Slice 3: The Content Agent (Lazy-Loaded Lessons)

### Backend Tasks

* [ ] **Prompt Blueprint (`src/agents/prompts/content.prompt.ts`):** Author detailed educational content guidelines demanding deep, markdown-formatted technical articles.
* [ ] **API Endpoint Controller (`src/modules/lesson/`):** Expose a safe data channel target at `GET /api/courses/:cId/lessons/:lId`.
* [ ] **Race Condition Prevention Engine:** Build row locking mechanics directly within the retrieval query layout inside a Prisma database transaction:
```ts
// Verify row state safely before executing downstream AI triggers
const lesson = await tx.lesson.findUnique({ where: { id: lId } });
if (lesson.generationStatus === 'NOT_GENERATED') {
  await tx.lesson.update({ where: { id: lId }, data: { generationStatus: 'GENERATING' } });
  // Trigger Content Agent execution out-of-band...
}

```



### Frontend Tasks

* [ ] **Markdown Render Context (`src/features/lesson/components/LessonViewer.tsx`):** Integrate an accessible parsing runtime library (e.g., `react-markdown`).
* [ ] **Content Layout View:** Establish visual layout panels containing modular list sidebars mapping out course directories side-by-side with text canvases. Insert a 21st.dev progressive text-fade reveal layer to animate incoming data blocks once an ongoing generation job resolves.

### Verification Milestone

* Selecting an ungenerated lesson triggers a localized processing state notice. The platform completes the core compilation pipeline out-of-band, caches the raw output safely inside the database table row, and displays the structured markdown components flawlessly on subsequent requests.

---

## Slice 4: The Evaluation Agent (Deterministic Quizzes)

### Backend Tasks

* [ ] **Quiz Generation Subsystem (`src/agents/quiz.agent.ts`):** Author a quiz generation agent that parses lesson content and structures a 4-option multiple-choice verification array matching database schema types.
* [ ] **Endpoint Infrastructure (`src/modules/quiz/`):** Expose access parameters via `GET /.../lessons/:lId/quiz` (running lazy compilation rules) and `POST /.../lessons/:lId/quiz/attempt`.
* [ ] **Deterministic Scoring Engine:** Code clean, algorithmic processing loops inside the controller logic to calculate quiz pass/fail rates ($\ge 60\%$) without triggering external AI inference engines.
* [ ] **Progress Engine Hooks:** If a student passes, update the current lesson to `COMPLETED` and unlock the next sequential lesson tracking ID. If they fail, increment the target metadata version counter (`version + 1`) and reset the generation parameter block back to `NOT_GENERATED` to support a clean re-test.

### Frontend Tasks

* [ ] **Form Evaluation Interface (`src/features/quiz/components/QuizInterface.tsx`):** Construct an multi-option radio group canvas utilizing accessible shadcn UI structures.
* [ ] **Feedback Rendering Suite:** Design analytical summary views highlighting accurate selections versus error selections along with contextual correct-answer rationale blocks upon form validation returns.

### Verification Milestone

* Submitting a set of quiz options yields immediate visual score metrics. Passing the threshold transitions the target lesson item's local sidebar token lock to active, while failing it generates a clean set of new quiz questions.

---

## Slice 5: The Capstone Chat (WebSockets & Redis)

### Backend Tasks

* [ ] **Gateway Bootstrap (`src/modules/chat/chat.gateway.ts`):** Attach standard `socket.io` server processes to the primary execution application stack. Integrate the official `@socket.io/redis-adapter` configuration to map messaging payloads through a Redis pub/sub broker instance.
* [ ] **Interview Generation Subsystem:** Code initialization controllers at `POST /api/interviews` to ingest course lesson text profiles and map out core diagnostic milestones inside the database `Interview` schema.
* [ ] **Event Transport Pipeline:** Program operational routing hooks for standard execution tracking operations:
* `join_session`: Validates authentication context parameters and joins the client socket to a single unique session identifier room.
* `send_message`: Appends user messaging records to the relational database structure, activates the conversational core **Interview Agent**, commits the generated response data payload as an assistant message string, and broadcasts the output payload back down the pipe via `socket.emit('new_message')`.



### Frontend Tasks

* [ ] **Transport Hook Setup (`src/hooks/useWebSocket.ts`):** Build a persistent custom hook using `socket.io-client` that handles automatic connection-recovery mechanisms and tracks transient session drops safely.
* [ ] **Real-Time Interface Layout (`src/features/chat/components/ChatUI.tsx`):** Use a shadcn `ScrollArea` component to maintain anchor tracking focus on arriving messaging streams. Add a 21st.dev reactive AI text typing indicator mechanism to visually signal active backend pipeline inference operations.

### Verification Milestone

* Launching the interview environment automatically hooks into the global WebSocket stream. Typing a response fires message payloads over the socket channel and receives immediate contextual follow-up questions from the interviewer agent without global page resets.