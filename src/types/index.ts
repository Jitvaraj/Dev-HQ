export type WorkspaceTabType =
  | 'home'
  | 'projects'
  | 'project-detail'
  | 'ai'
  | 'aistudio'
  | 'github'
  | 'drafts'
  | 'lockin'
  | 'more';

export interface WorkspaceTab {
  id: string;
  title: string;
  type: WorkspaceTabType;
  url: string;
  iconName?: string;
  projectId?: string;
  active: boolean;
}

export type ProjectStatus = 'In Progress' | 'Published' | 'Completed' | 'Archived' | 'Concept';

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface ProjectActivity {
  id: string;
  timestamp: string;
  description: string;
  type: 'commit' | 'task' | 'ai' | 'release' | 'note';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  techStack: string;
  githubRepo?: string;
  aiStudioContext?: string;
  systemPrompt?: string;
  notes?: string;
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  stagingUrl?: string;
  productionUrl?: string;
  activity: ProjectActivity[];
  iconType: 'jarvis' | 'globe' | 'gem' | 'code' | 'cpu' | 'sparkles';
  createdAt: string;
  updatedAt: string;
}

export type DraftType = 'idea' | 'spec' | 'prompt' | 'note' | 'template';

export interface Draft {
  id: string;
  title: string;
  type: DraftType;
  content: string;
  tags: string[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LockInSession {
  id: string;
  projectId: string;
  projectName: string;
  taskTitle: string;
  durationMinutes: number;
  completedAt: string;
  status: 'completed' | 'interrupted';
  notes?: string;
}

export interface LockInState {
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
  mode: 'pomodoro' | 'short-break' | 'long-break' | 'custom';
  currentTaskId: string;
  currentTaskTitle: string;
  selectedProjectId: string;
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  distractionFree: boolean;
}

export interface PromptHistoryItem {
  id: string;
  title: string;
  prompt: string;
  response: string;
  category: string;
  projectId?: string;
  timestamp: string;
}

export interface UserSettings {
  userName: string;
  userEmail: string;
  title: string;
  defaultFocusDuration: number; // in minutes
  ambientSound: boolean;
  shortcutsEnabled: boolean;
  autoSaveInterval: number;
}
