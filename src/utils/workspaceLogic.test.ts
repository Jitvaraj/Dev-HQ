import test from 'node:test';
import assert from 'node:assert/strict';
import {
  openOrActivateTab,
  closeTab,
  filterProjects,
  filterDrafts,
  formatTimeDisplay,
  calculateSessionProgress,
  formatGoogleAIStudioExport,
} from './workspaceLogic.ts';
import { WorkspaceTab, Project, Draft } from '../types/index.ts';

test('openOrActivateTab activates existing tab if present', () => {
  const initialTabs: WorkspaceTab[] = [
    { id: 'tab-1', title: 'Home', type: 'home', url: 'devhq.app', active: true },
    { id: 'tab-2', title: 'Projects', type: 'projects', url: 'devhq.app/projects', active: false },
  ];

  const result = openOrActivateTab(initialTabs, {
    id: 'tab-3',
    title: 'Projects',
    type: 'projects',
    url: 'devhq.app/projects',
  });

  assert.equal(result.tabs.length, 2);
  assert.equal(result.activeTabId, 'tab-2');
  assert.equal(result.tabs.find((t) => t.id === 'tab-2')?.active, true);
  assert.equal(result.tabs.find((t) => t.id === 'tab-1')?.active, false);
});

test('openOrActivateTab appends new tab if not present', () => {
  const initialTabs: WorkspaceTab[] = [
    { id: 'tab-1', title: 'Home', type: 'home', url: 'devhq.app', active: true },
  ];

  const result = openOrActivateTab(initialTabs, {
    id: 'tab-new',
    title: 'AI Hub',
    type: 'ai',
    url: 'devhq.app/ai',
  });

  assert.equal(result.tabs.length, 2);
  assert.equal(result.activeTabId, 'tab-new');
  assert.equal(result.tabs[1].active, true);
  assert.equal(result.tabs[0].active, false);
});

test('closeTab handles closing active tab and keeps adjacent active', () => {
  const initialTabs: WorkspaceTab[] = [
    { id: 't1', title: 'Home', type: 'home', url: 'devhq.app', active: false },
    { id: 't2', title: 'Projects', type: 'projects', url: 'devhq.app/projects', active: true },
    { id: 't3', title: 'Drafts', type: 'drafts', url: 'devhq.app/drafts', active: false },
  ];

  const result = closeTab(initialTabs, 't2');
  assert.equal(result.tabs.length, 2);
  assert.equal(result.activeTabId, 't3');
  assert.equal(result.tabs.find((t) => t.id === 't3')?.active, true);
});

test('formatTimeDisplay formats mm:ss accurately', () => {
  assert.equal(formatTimeDisplay(1500), '25:00');
  assert.equal(formatTimeDisplay(65), '01:05');
  assert.equal(formatTimeDisplay(0), '00:00');
  assert.equal(formatTimeDisplay(-10), '00:00');
});

test('calculateSessionProgress computes elapsed percentage properly', () => {
  assert.equal(calculateSessionProgress(1500, 1500), 0);
  assert.equal(calculateSessionProgress(750, 1500), 50);
  assert.equal(calculateSessionProgress(0, 1500), 100);
});

test('filterProjects correctly filters by query and status', () => {
  const dummyProjects: Project[] = [
    {
      id: 'p1',
      name: 'JARVIS',
      description: 'AI Assistant App',
      category: 'AI Assistant App',
      status: 'In Progress',
      techStack: 'TypeScript, Gemini',
      tasks: [],
      milestones: [],
      activity: [],
      iconType: 'jarvis',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'p2',
      name: 'Arc',
      description: 'Web Platform for teams',
      category: 'Web Platform',
      status: 'Published',
      techStack: 'React, Node',
      tasks: [],
      milestones: [],
      activity: [],
      iconType: 'globe',
      createdAt: '',
      updatedAt: '',
    },
  ];

  assert.equal(filterProjects(dummyProjects, 'jarvis', 'all').length, 1);
  assert.equal(filterProjects(dummyProjects, '', 'Published').length, 1);
  assert.equal(filterProjects(dummyProjects, 'platform', 'Published').length, 1);
  assert.equal(filterProjects(dummyProjects, 'nonexistent', 'all').length, 0);
});

test('formatGoogleAIStudioExport generates formatted markdown prompt', () => {
  const project: Project = {
    id: 'p1',
    name: 'JARVIS',
    description: 'Personal dev assistant with AI',
    category: 'AI Tool',
    status: 'In Progress',
    techStack: 'React 19, TypeScript',
    tasks: [{ id: '1', title: 'Build voice UI', completed: false, priority: 'high' }],
    milestones: [],
    activity: [],
    iconType: 'jarvis',
    createdAt: '',
    updatedAt: '',
  };

  const output = formatGoogleAIStudioExport(project);
  assert.ok(output.includes('SYSTEM INSTRUCTIONS FOR GOOGLE AI STUDIO'));
  assert.ok(output.includes('Project: JARVIS'));
  assert.ok(output.includes('Build voice UI'));
});
