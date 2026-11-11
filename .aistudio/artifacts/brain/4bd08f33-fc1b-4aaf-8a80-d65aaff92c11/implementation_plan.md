# Dev HQ Project Creation & GitHub Integration

Create a dedicated project workspace for **Dev HQ** mapped to GitHub account **Jitvaraj** (`Jitvaraj/dev-hq`) with a complete self-hosting roadmap, task tracking, Google AI Studio integration, and live repository telemetry.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements were confirmed during the interactive clarification interview:

- **Confirmed GitHub Account**: Target repository target `Jitvaraj/dev-hq` under user profile [https://github.com/Jitvaraj](https://github.com/Jitvaraj).
- **Confirmed Project Template**: Self-hosting workspace blueprint with complete roadmap, milestones, and architectural specifications for DEV HQ.
- **Confirmed Access Mode**: Public read-only sync and commit telemetry (requiring zero token exposure).

---

## 1. Overview & Core Concept

- **What It Delivers**:
  1. A first-class project profile and workspace tab for **Dev HQ** inside DEV HQ.
  2. Direct binding to GitHub repository `Jitvaraj/dev-hq` with real-time public repository stats, live branch inspection, and commit tracking.
  3. Pre-populated task list and milestones mapping out the DEV HQ feature roadmap (browser shell, Google AI Studio integration, Lock In mode, offline PWA persistence).
  4. Integration with Google AI Studio: auto-generated system instructions and prompt context for extending DEV HQ.
  5. Sync of the user profile across DEV HQ (updating author and account profile to `Jitvaraj`).

---

## 2. User Experience & Visual Design

- **Home Dashboard**:
  - The new project **Dev HQ** will appear prominently in the "Your Projects" grid with an active cyan status badge (`In Progress`), tech stack tags (`TypeScript, React 19, Gemini 3.8 Flash`), and repository link to `Jitvaraj/dev-hq`.
  - Quick action to enter the Dev HQ workspace in one click.

- **Dev HQ Project Workspace Tab**:
  - Automatically opens a dedicated browser tab: `DEV HQ | Dev HQ Workspace` (`devhq.app/projects/proj-devhq`).
  - **Roadmap & Tasks**: Interactive checkboxes for key Dev HQ milestones (e.g. Glassmorphism Browser Shell, Google AI Studio Context Bridge, Lock In Focus Engine, IndexedDB Sync, Mobile Touch Refinements).
  - **AI Studio Directives**: Structured markdown prompt context tuned specifically for developing and extending DEV HQ features with Gemini 3.8 Flash.
  - **GitHub Hub Mapping**: Real-time card linking to `https://github.com/Jitvaraj/dev-hq` with commit status and branch monitoring.

- **GitHub Hub Updates**:
  - Lists both `Jitvaraj/dev-hq` and the user's existing public repository `Jitvaraj/Orion-Forge` with live stars, open issues, and commit timelines.

---

## 3. Technical Architecture & Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DEV HQ Browser Shell                     │
│  [Tabs: Home | Dev HQ Workspace | Google AI Studio | GitHub] │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌─────────────────────────────┐       ┌───────────────────────┐
│     Dev HQ Project View     │       │    GitHub Hub View    │
│ ├─ Tasks & Roadmap (0/5)    │       │ ├─ Jitvaraj/dev-hq    │
│ ├─ AI Studio System Prompt  │       │ ├─ Jitvaraj/Orion-Forge
│ ├─ Architecture Specs       │       │ └─ Live Repo Query    │
│ └─ Lock In Focus Launcher   │       └───────────┬───────────┘
└──────────────┬──────────────┘                   │
               │                                  ▼
               ▼                      ┌───────────────────────┐
┌─────────────────────────────┐       │  Express GitHub Proxy │
│    IndexedDB / LocalStore   │       │  /api/github/repo     │
│  - Projects State           │       │  (Public REST API)    │
│  - Tabs & Settings Sync     │       └───────────────────────┘
└─────────────────────────────┘
```

---

## 4. Proposed Implementation Steps

1. **Storage & Seed Updates (`src/utils/storage.ts`)**:
   - Add `Dev HQ` to the project registry with repository `Jitvaraj/dev-hq`, category `Development Workspace & OS`, tech stack `TypeScript, React 19, Tailwind CSS v4, Express, Gemini 3.8 Flash`, and detailed roadmap tasks.
   - Update user profile settings to `Jitvaraj` (`Jitvaraj · System Architect`).
   - Add `Jitvaraj/Orion-Forge` repository mapping in default data.

2. **GitHub View & Inspector (`src/components/views/GitHubView.tsx`)**:
   - Pre-configure `Jitvaraj/dev-hq` and `Jitvaraj/Orion-Forge` in the active repository list.
   - Enable quick one-click inspection of any `Jitvaraj/*` repository.

3. **Workspace Navigation (`src/App.tsx`)**:
   - Open the new **Dev HQ** workspace tab upon creation.
   - Update profile initials in the top browser bar and header to reflect `Jitvaraj`.

4. **Verification**:
   - Re-run logic unit tests (`node:test`).
   - Run compilation (`compile_applet`) and linting (`lint_applet`).
   - Capture Playwright browser screenshots to verify the new project card, tab navigation, and GitHub repo mapping.
