import { Project, Draft, LockInSession, PromptHistoryItem, UserSettings, WorkspaceTab } from '../types/index.ts';

const STORAGE_KEYS = {
  PROJECTS: 'devhq_projects',
  DRAFTS: 'devhq_drafts',
  LOCKIN_SESSIONS: 'devhq_lockin_sessions',
  PROMPTS: 'devhq_prompt_history',
  SETTINGS: 'devhq_settings',
  TABS: 'devhq_workspace_tabs',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-devhq',
    name: 'Dev HQ',
    description: 'Personal developer operating workspace combining a browser shell, project management, Google AI Studio integration, GitHub access, and Lock In productivity mode.',
    category: 'Development Workspace & OS',
    status: 'In Progress',
    techStack: 'TypeScript, React 19, Tailwind CSS v4, Express, Gemini 3.8 Flash',
    githubRepo: 'Jitvaraj/dev-hq',
    stagingUrl: 'https://devhq.app',
    productionUrl: 'https://github.com/Jitvaraj/dev-hq',
    aiStudioContext: 'Personal development operating workspace with browser-style multi-tab shell, server-side Gemini 3.8 Flash copilot, public GitHub telemetry, and IndexedDB persistence.',
    systemPrompt: 'You are developing DEV HQ, an elite developer operating workspace. Maintain dark glassmorphism discipline, zero dead clicks, and seamless Google AI Studio workflow.',
    notes: 'Self-hosting repository at github.com/Jitvaraj/dev-hq. Designed for landscape and touch mobile screens (Samsung A07).',
    tasks: [
      { id: 'dhq-1', title: 'Implement dark glassmorphism browser shell and tabs', completed: true, priority: 'high' },
      { id: 'dhq-2', title: 'Connect Google AI Studio context generator and playground', completed: true, priority: 'high' },
      { id: 'dhq-3', title: 'Build Lock In focus timer with distraction-free zen mode', completed: true, priority: 'high' },
      { id: 'dhq-4', title: 'Wire public GitHub repository telemetry for Jitvaraj/dev-hq', completed: true, priority: 'medium' },
      { id: 'dhq-5', title: 'Optimize offline IndexedDB storage & Samsung A07 performance', completed: false, priority: 'medium' },
    ],
    milestones: [
      { id: 'dhq-m1', title: 'v1.0 Core Shell & Hubs', dueDate: '2026-11-15', completed: true },
      { id: 'dhq-m2', title: 'v1.1 GitHub & AI Studio Sync', dueDate: '2026-11-30', completed: false },
    ],
    activity: [
      { id: 'dhq-a1', timestamp: 'Just now', description: 'Linked GitHub repository Jitvaraj/dev-hq', type: 'commit' },
      { id: 'dhq-a2', timestamp: '5 mins ago', description: 'Initialized DEV HQ self-hosting workspace roadmap', type: 'task' },
    ],
    iconType: 'code',
    createdAt: '2026-11-11T12:00:00Z',
    updatedAt: '2026-11-11T12:30:00Z',
  },
  {
    id: 'proj-jarvis',
    name: 'JARVIS',
    description: 'An intelligent personal development copilot and agentic assistant built for real-time code synthesis and workflow automation.',
    category: 'AI Assistant App',
    status: 'In Progress',
    techStack: 'TypeScript, React 19, Gemini 3.8 Flash, Node.js',
    githubRepo: 'Jitvaraj/jarvis-assistant',
    stagingUrl: 'https://jarvis-preview.devhq.app',
    aiStudioContext: 'Autonomous developer assistant with structured JSON responses, automated debugging context, and Gemini 3.8 Flash integration.',
    systemPrompt: 'You are JARVIS, an elite developer assistant. Always provide clean, testable, and robust TypeScript code.',
    notes: 'Prioritize low-latency streaming and clean glassmorphism UI. Ensure offline fallback with IndexedDB.',
    tasks: [
      { id: 't1', title: 'Implement Gemini 3.8 Flash streaming endpoint', completed: true, priority: 'high' },
      { id: 't2', title: 'Wire project context prompt generator', completed: true, priority: 'high' },
      { id: 't3', title: 'Add offline local persistence with IndexedDB', completed: false, priority: 'medium' },
      { id: 't4', title: 'Optimize mobile responsiveness for Samsung A07', completed: false, priority: 'medium' },
    ],
    milestones: [
      { id: 'm1', title: 'Core Agent Architecture', dueDate: '2026-11-20', completed: true },
      { id: 'm2', title: 'Google AI Studio Integration', dueDate: '2026-11-30', completed: false },
    ],
    activity: [
      { id: 'a1', timestamp: '10 mins ago', description: 'Updated system instruction for Gemini 3.8 Flash', type: 'ai' },
      { id: 'a2', timestamp: '1 hour ago', description: 'Pushed commit 4a9f21b to main: Add tab management', type: 'commit' },
    ],
    iconType: 'jarvis',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-11T12:00:00Z',
  },
  {
    id: 'proj-arc',
    name: 'Arc',
    description: 'High-performance collaborative web platform with real-time workspace sharing, live preview environments, and cloud sync.',
    category: 'Web Platform',
    status: 'Published',
    techStack: 'React, Tailwind CSS v4, Express, WebSocket',
    githubRepo: 'Jitvaraj/arc-web-platform',
    productionUrl: 'https://arc.devhq.app',
    stagingUrl: 'https://staging.arc.devhq.app',
    aiStudioContext: 'Full-stack collaborative canvas platform with optimistic UI updates and resilient state synchronization.',
    notes: 'Production version v2.4 deployed and healthy. All integration tests passing.',
    tasks: [
      { id: 't201', title: 'Audit bundle size and reduce chunk footprint', completed: true, priority: 'high' },
      { id: 't202', title: 'Configure auto-failover edge proxies', completed: true, priority: 'medium' },
      { id: 't203', title: 'Publish quarterly release notes', completed: true, priority: 'low' },
    ],
    milestones: [
      { id: 'm201', title: 'Public v2.4 Launch', dueDate: '2026-10-15', completed: true },
    ],
    activity: [
      { id: 'a201', timestamp: '2 days ago', description: 'Deployed production release v2.4.1', type: 'release' },
      { id: 'a202', timestamp: '3 days ago', description: 'Closed milestone: Public v2.4 Launch', type: 'task' },
    ],
    iconType: 'globe',
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-11-09T14:30:00Z',
  },
  {
    id: 'proj-orion',
    name: 'Orion Forge',
    description: 'Next-generation developer toolchain and WebAssembly code analysis engine with instant AST inspection.',
    category: 'Developer Tool',
    status: 'Completed',
    techStack: 'Rust, WebAssembly, Vite, TypeScript',
    githubRepo: 'Jitvaraj/Orion-Forge',
    productionUrl: 'https://github.com/Jitvaraj/Orion-Forge',
    aiStudioContext: 'AST inspection, zero-overhead WebAssembly bindings, fast syntax validation.',
    notes: 'Engine core completed. Hosted on GitHub repository Jitvaraj/Orion-Forge.',
    tasks: [
      { id: 't301', title: 'Implement WebAssembly compiler worker', completed: true, priority: 'high' },
      { id: 't302', title: 'Write comprehensive benchmarks', completed: true, priority: 'medium' },
    ],
    milestones: [
      { id: 'm301', title: 'v1.0 Gold Master', dueDate: '2026-10-01', completed: true },
    ],
    activity: [
      { id: 'a301', timestamp: '1 week ago', description: 'Tagged release v1.0.0 on GitHub', type: 'release' },
    ],
    iconType: 'gem',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-11-01T16:00:00Z',
  },
];

export const INITIAL_DRAFTS: Draft[] = [
  {
    id: 'draft-1',
    title: 'DEV HQ Architectural Blueprint & Personal OS Spec',
    type: 'spec',
    content: `# DEV HQ — Developer Operating Workspace
## Mission
Provide a unified, distraction-free environment that bridges local development with Google AI Studio and GitHub.

## Core Pillars
1. Browser Shell Navigation: Real tabs, address field, persistent history.
2. Glassmorphism Design: Deep dark navy surfaces, thin blue borders, subtle illumination.
3. Lock In Mode: High-intensity focus sessions with Pomodoro intervals.
4. Google AI Studio Bridge: Zero friction context transfer and deep linking.`,
    tags: ['Architecture', 'Blueprint', 'Design'],
    projectId: 'proj-jarvis',
    createdAt: '2026-11-10T14:00:00Z',
    updatedAt: '2026-11-10T14:00:00Z',
  },
  {
    id: 'draft-2',
    title: 'Google AI Studio Prompt Recipe: Full-Stack React & Node',
    type: 'prompt',
    content: `You are an expert full-stack engineer building production apps.
Rules:
- Write TypeScript with strict typing.
- Modularize components into src/components/ and src/utils/.
- Style with modern Tailwind CSS v4 and glassmorphism.
- Wire all event handlers; never leave dead buttons or placeholder mockups.
- Optimize for mobile touch and Samsung Galaxy A07 constraint budgets.`,
    tags: ['AI Studio', 'Prompts', 'Gemini'],
    projectId: 'proj-jarvis',
    createdAt: '2026-11-09T11:20:00Z',
    updatedAt: '2026-11-09T11:20:00Z',
  },
  {
    id: 'draft-3',
    title: 'Offline Sync & IndexedDB Fallback Strategy',
    type: 'idea',
    content: `Implement transparent fallback between IndexedDB and localStorage so user projects, drafts, and lock-in sessions never lose unsaved changes, even during flaky mobile connections.`,
    tags: ['Database', 'PWA', 'Offline'],
    createdAt: '2026-11-08T09:15:00Z',
    updatedAt: '2026-11-08T09:15:00Z',
  },
  {
    id: 'draft-4',
    title: 'Clean Architecture Template for Microservices',
    type: 'template',
    content: `// Service definition template
export interface ServiceContext {
  id: string;
  config: Record<string, unknown>;
  logger: (msg: string) => void;
}

export abstract class BaseService {
  abstract initialize(ctx: ServiceContext): Promise<void>;
  abstract execute(): Promise<void>;
  abstract teardown(): Promise<void>;
}`,
    tags: ['Template', 'Architecture', 'TypeScript'],
    createdAt: '2026-11-05T16:00:00Z',
    updatedAt: '2026-11-05T16:00:00Z',
  },
];

export const INITIAL_SETTINGS: UserSettings = {
  userName: 'Developer',
  userEmail: '',
  title: 'Full-Stack Developer & Software Architect',
  defaultFocusDuration: 25,
  ambientSound: false,
  shortcutsEnabled: true,
  autoSaveInterval: 30,
};

export const INITIAL_TABS: WorkspaceTab[] = [
  {
    id: 'tab-home',
    title: 'DEV HQ | Your Workspace',
    type: 'home',
    url: 'devhq.app',
    active: true,
  },
  {
    id: 'tab-project-detail-proj-devhq',
    title: 'Dev HQ | Workspace',
    type: 'project-detail',
    url: 'devhq.app/projects/proj-devhq',
    projectId: 'proj-devhq',
    active: false,
  },
];

// Helper functions for reading and writing with localStorage fallback
export function getSavedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return INITIAL_PROJECTS;
    const parsed: Project[] = JSON.parse(raw);
    if (!parsed.some((p) => p.id === 'proj-devhq')) {
      const merged = [INITIAL_PROJECTS[0], ...parsed];
      saveProjects(merged);
      return merged;
    }
    return parsed;
  } catch {
    return INITIAL_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects', e);
  }
}

export function getSavedDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    if (!raw) return INITIAL_DRAFTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_DRAFTS;
  }
}

export function saveDrafts(drafts: Draft[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  } catch (e) {
    console.error('Failed to save drafts', e);
  }
}

export function getSavedLockInSessions(): LockInSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCKIN_SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLockInSession(session: LockInSession): void {
  try {
    const sessions = getSavedLockInSessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.LOCKIN_SESSIONS, JSON.stringify(sessions.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export function getSavedPromptHistory(): PromptHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePromptHistoryItem(item: PromptHistoryItem): void {
  try {
    const list = getSavedPromptHistory();
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(list.slice(0, 30)));
  } catch (e) {
    console.error('Failed to save prompt', e);
  }
}

export function getSavedSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return INITIAL_SETTINGS;
    const parsed = JSON.parse(raw);
    const migrated = {
      ...INITIAL_SETTINGS,
      ...parsed,
      userName: parsed.userName && parsed.userName !== 'JARVIS' ? parsed.userName : 'Developer',
    };
    return migrated;
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getSavedTabs(): WorkspaceTab[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TABS);
    if (!raw) return INITIAL_TABS;
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : INITIAL_TABS;
  } catch {
    return INITIAL_TABS;
  }
}

export function saveTabs(tabs: WorkspaceTab[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
  } catch (e) {
    console.error('Failed to save tabs', e);
  }
}
