import { WorkspaceTab, WorkspaceTabType, Project, Draft } from '../types/index.ts';

/**
 * Creates or activates a workspace tab.
 * If a tab with the same type (and projectId if applicable) already exists, it activates it.
 */
export function openOrActivateTab(
  tabs: WorkspaceTab[],
  newTab: Omit<WorkspaceTab, 'active'>
): { tabs: WorkspaceTab[]; activeTabId: string } {
  const existingIndex = tabs.findIndex((t) => {
    if (newTab.projectId && t.projectId) {
      return t.type === newTab.type && t.projectId === newTab.projectId;
    }
    return t.type === newTab.type;
  });

  if (existingIndex !== -1) {
    const updated = tabs.map((t, idx) => ({
      ...t,
      active: idx === existingIndex,
    }));
    return { tabs: updated, activeTabId: tabs[existingIndex].id };
  }

  const created: WorkspaceTab = {
    ...newTab,
    active: true,
  };

  const updated = tabs.map((t) => ({ ...t, active: false })).concat(created);
  return { tabs: updated, activeTabId: created.id };
}

/**
 * Closes a tab by id. Never closes the home tab if it's the only one left.
 * Automatically activates the previous or adjacent tab if the active one is closed.
 */
export function closeTab(
  tabs: WorkspaceTab[],
  tabIdToClose: string
): { tabs: WorkspaceTab[]; activeTabId: string } {
  if (tabs.length <= 1) {
    return { tabs, activeTabId: tabs[0]?.id || 'home' };
  }

  const targetIndex = tabs.findIndex((t) => t.id === tabIdToClose);
  if (targetIndex === -1) {
    const currentActive = tabs.find((t) => t.active)?.id || tabs[0].id;
    return { tabs, activeTabId: currentActive };
  }

  const wasActive = tabs[targetIndex].active;
  const filtered = tabs.filter((t) => t.id !== tabIdToClose);

  if (!wasActive) {
    const currentActive = filtered.find((t) => t.active)?.id || filtered[0].id;
    return { tabs: filtered, activeTabId: currentActive };
  }

  // Activate the adjacent tab
  const newActiveIndex = Math.min(targetIndex, filtered.length - 1);
  const updated = filtered.map((t, idx) => ({
    ...t,
    active: idx === newActiveIndex,
  }));

  return { tabs: updated, activeTabId: updated[newActiveIndex].id };
}

/**
 * Filters projects by query and status filter.
 */
export function filterProjects(
  projects: Project[],
  query: string,
  statusFilter: string
): Project[] {
  const q = query.trim().toLowerCase();
  return projects.filter((p) => {
    const matchesStatus =
      statusFilter === 'all' ||
      p.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.techStack.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });
}

/**
 * Filters drafts by query, category/type filter, and tag.
 */
export function filterDrafts(
  drafts: Draft[],
  query: string,
  typeFilter: string,
  tagFilter?: string
): Draft[] {
  const q = query.trim().toLowerCase();
  return drafts.filter((d) => {
    const matchesType = typeFilter === 'all' || d.type === typeFilter;
    const matchesTag = !tagFilter || d.tags.includes(tagFilter);
    const matchesQuery =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q));

    return matchesType && matchesTag && matchesQuery;
  });
}

/**
 * Format seconds into mm:ss display string.
 */
export function formatTimeDisplay(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Calculates focus session progress percentage (0 - 100).
 */
export function calculateSessionProgress(timeRemaining: number, totalDuration: number): number {
  if (totalDuration <= 0) return 100;
  const elapsed = totalDuration - timeRemaining;
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
}

/**
 * Serializes project details into structured prompt context for Google AI Studio.
 */
export function formatGoogleAIStudioExport(project: Project): string {
  const taskList = project.tasks
    .map((t) => `- [${t.completed ? 'x' : ' '}] ${t.title} (${t.priority})`)
    .join('\n');

  return `### SYSTEM INSTRUCTIONS FOR GOOGLE AI STUDIO
Project: ${project.name} (${project.category})
Status: ${project.status}
Tech Stack: ${project.techStack}
Repository: ${project.githubRepo || 'None linked'}

### Overview & Architecture
${project.description}

${project.aiStudioContext ? `### Project Context & Guidelines\n${project.aiStudioContext}\n` : ''}
### Current Tasks & Roadmap
${taskList || 'No active tasks'}

### Developer Directives
1. Strictly follow modern TypeScript and React patterns.
2. Provide complete, production-ready code with no mock stubs.
3. Optimize for performance, readability, and testability.`;
}
