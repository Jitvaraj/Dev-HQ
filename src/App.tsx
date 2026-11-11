import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { WorkspaceTab, WorkspaceTabType, Project, Draft, LockInSession, LockInState, UserSettings, PromptHistoryItem } from './types/index.ts';
import {
  getSavedProjects,
  saveProjects,
  getSavedDrafts,
  saveDrafts,
  getSavedTabs,
  saveTabs,
  getSavedSettings,
  saveSettings,
  getSavedLockInSessions,
  saveLockInSession,
  getSavedPromptHistory,
  savePromptHistoryItem,
  INITIAL_PROJECTS,
  INITIAL_DRAFTS,
  INITIAL_SETTINGS,
} from './utils/storage.ts';
import { openOrActivateTab, closeTab } from './utils/workspaceLogic.ts';
import { onGoogleAuthStateChanged, getCachedGoogleToken } from './services/googleDrive.ts';
import { BrowserTopBar } from './components/browser/BrowserTopBar.tsx';
import { QuickLauncher } from './components/browser/QuickLauncher.tsx';
import { BottomNavDock } from './components/browser/BottomNavDock.tsx';
import { OmniSearchModal } from './components/browser/OmniSearchModal.tsx';
import { HomeView } from './components/views/HomeView.tsx';
import { ProjectsView } from './components/views/ProjectsView.tsx';
import { ProjectDetailView } from './components/views/ProjectDetailView.tsx';
import { GoogleAIStudioWorkspace } from './components/views/GoogleAIStudioWorkspace.tsx';
import { AIView } from './components/views/AIView.tsx';
import { GitHubView } from './components/views/GitHubView.tsx';
import { DraftVaultView } from './components/views/DraftVaultView.tsx';
import { LockInModal } from './components/views/LockInModal.tsx';
import { MoreView } from './components/views/MoreView.tsx';
import { NewProjectModal } from './components/views/NewProjectModal.tsx';
import { GoogleDriveModal } from './components/views/GoogleDriveModal.tsx';
import { GitHubPushModal } from './components/views/GitHubPushModal.tsx';

export default function App() {
  const [tabs, setTabs] = useState<WorkspaceTab[]>(getSavedTabs);
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const saved = getSavedTabs();
    return saved.find((t) => t.active)?.id || saved[0]?.id || 'tab-home';
  });

  const [projects, setProjects] = useState<Project[]>(getSavedProjects);
  const [drafts, setDrafts] = useState<Draft[]>(getSavedDrafts);
  const [settings, setSettings] = useState<UserSettings>(getSavedSettings);
  const [lockInSessions, setLockInSessions] = useState<LockInSession[]>(getSavedLockInSessions);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>(getSavedPromptHistory);

  // Modals state
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isLockInModalOpen, setIsLockInModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const [isGitHubPushModalOpen, setIsGitHubPushModalOpen] = useState(false);

  // Google Account state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onGoogleAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const effectiveUserName = currentUser?.displayName || settings.userName || 'Developer';
  const effectiveUserEmail = currentUser?.email || settings.userEmail || '';
  const currentUserPhoto = currentUser?.photoURL || null;
  const isGoogleConnected = !!currentUser && !!getCachedGoogleToken();

  // Focus Lock-In state
  const [lockInState, setLockInState] = useState<LockInState>({
    isActive: false,
    isPaused: false,
    isBreak: false,
    mode: 'pomodoro',
    currentTaskId: '',
    currentTaskTitle: 'Deep Code Synthesis',
    selectedProjectId: projects[0]?.id || '',
    timeRemaining: 1500,
    totalDuration: 1500,
    distractionFree: false,
  });

  // Sync state to local persistence
  useEffect(() => {
    saveTabs(tabs);
  }, [tabs]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveDrafts(drafts);
  }, [drafts]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Navigation router through browser workspace tabs
  const handleNavigateToType = (type: WorkspaceTabType, projectId?: string) => {
    let title = 'DEV HQ | Your Workspace';
    let url = 'devhq.app';

    switch (type) {
      case 'home':
        title = 'DEV HQ | Your Workspace';
        url = 'devhq.app';
        break;
      case 'projects':
        title = 'Projects Workspace';
        url = 'devhq.app/projects';
        break;
      case 'project-detail': {
        const proj = projects.find((p) => p.id === projectId);
        title = proj ? `${proj.name} | Workspace` : 'Project Details';
        url = proj ? `devhq.app/projects/${proj.id}` : 'devhq.app/projects/detail';
        break;
      }
      case 'aistudio':
        title = 'Google AI Studio Workspace';
        url = 'aistudio.google.com/devhq';
        break;
      case 'ai':
        title = 'AI Development Hub';
        url = 'devhq.app/ai';
        break;
      case 'github':
        title = 'GitHub Repository Hub';
        url = 'devhq.app/github';
        break;
      case 'drafts':
        title = 'Draft Vault';
        url = 'devhq.app/drafts';
        break;
      case 'more':
        title = 'Settings & Modules';
        url = 'devhq.app/more';
        break;
    }

    const { tabs: newTabs, activeTabId: newActiveId } = openOrActivateTab(tabs, {
      id: `tab-${type}${projectId ? `-${projectId}` : ''}`,
      title,
      type,
      url,
      projectId,
    });

    setTabs(newTabs);
    setActiveTabId(newActiveId);
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    setTabs((prev) =>
      prev.map((t) => ({
        ...t,
        active: t.id === tabId,
      }))
    );
  };

  const handleCloseTab = (tabId: string) => {
    const { tabs: remainingTabs, activeTabId: nextActiveId } = closeTab(tabs, tabId);
    setTabs(remainingTabs);
    setActiveTabId(nextActiveId);
  };

  const handleNewTab = () => {
    setIsOmniSearchOpen(true);
  };

  const handleSelectProject = (projectId: string) => {
    handleNavigateToType('project-detail', projectId);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeTab.projectId === projectId) {
      handleNavigateToType('projects');
    }
  };

  const handleCreateProject = (newProj: Project) => {
    setProjects((prev) => [newProj, ...prev]);
    const { tabs: newTabs, activeTabId: newActiveId } = openOrActivateTab(tabs, {
      id: `tab-project-detail-${newProj.id}`,
      title: `${newProj.name} | Workspace`,
      type: 'project-detail',
      url: `devhq.app/projects/${newProj.id}`,
      projectId: newProj.id,
    });
    setTabs(newTabs);
    setActiveTabId(newActiveId);
  };

  const handleSaveDraft = (draft: Draft) => {
    setDrafts((prev) => {
      const exists = prev.findIndex((d) => d.id === draft.id);
      if (exists !== -1) {
        const copy = [...prev];
        copy[exists] = draft;
        return copy;
      }
      return [draft, ...prev];
    });
  };

  const handleDeleteDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const handleSaveSession = (session: LockInSession) => {
    saveLockInSession(session);
    setLockInSessions(getSavedLockInSessions());
  };

  const handleSavePromptHistory = (item: PromptHistoryItem) => {
    savePromptHistoryItem(item);
    setPromptHistory(getSavedPromptHistory());
  };

  const handleStartLockInForTask = (projectId: string, taskTitle: string) => {
    setLockInState((prev) => ({
      ...prev,
      selectedProjectId: projectId,
      currentTaskTitle: taskTitle,
      isActive: true,
      isPaused: false,
      timeRemaining: 1500,
      totalDuration: 1500,
    }));
    setIsLockInModalOpen(true);
  };

  const handleResetDemoData = () => {
    setProjects(INITIAL_PROJECTS);
    setDrafts(INITIAL_DRAFTS);
    setSettings(INITIAL_SETTINGS);
    alert('Reset all data to demo seed state.');
  };

  const activeProject = projects.find((p) => p.id === activeTab.projectId) || projects[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b14] text-slate-100 overflow-hidden select-none">
      {/* 1. Browser Shell Top Chrome (Tabs & Navigation) */}
      <BrowserTopBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onNavigateHome={() => handleNavigateToType('home')}
        onOpenOmnibar={() => setIsOmniSearchOpen(true)}
        onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
        onOpenGitHubPush={() => setIsGitHubPushModalOpen(true)}
        userName={effectiveUserName}
        userEmail={effectiveUserEmail}
        currentUserPhoto={currentUserPhoto}
        isGoogleConnected={isGoogleConnected}
      />

      {/* 2. Main Workspace Body (Left QuickLauncher + Center Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Quick Launcher (Desktop / Landscape View) */}
        <QuickLauncher
          activeType={activeTab.type}
          onNavigate={(type) => handleNavigateToType(type)}
          isLockInActive={lockInState.isActive || isLockInModalOpen}
          onToggleLockIn={() => setIsLockInModalOpen((prev) => !prev)}
          className="hidden md:flex"
        />

        {/* Center Canvas Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {activeTab.type === 'home' && (
              <HomeView
                projects={projects}
                onSelectProject={handleSelectProject}
                onNavigate={handleNavigateToType}
                onNewProject={() => setIsNewProjectOpen(true)}
                onOpenOmnibar={() => setIsOmniSearchOpen(true)}
                onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
                onOpenGitHubPush={() => setIsGitHubPushModalOpen(true)}
                userName={effectiveUserName}
                userEmail={effectiveUserEmail}
                currentUserPhoto={currentUserPhoto}
                isGoogleConnected={isGoogleConnected}
              />
            )}

            {activeTab.type === 'projects' && (
              <ProjectsView
                projects={projects}
                onSelectProject={handleSelectProject}
                onNewProject={() => setIsNewProjectOpen(true)}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {activeTab.type === 'project-detail' && activeProject && (
              <ProjectDetailView
                project={activeProject}
                onBack={() => handleNavigateToType('projects')}
                onUpdateProject={handleUpdateProject}
                onNavigate={handleNavigateToType}
                onStartLockIn={handleStartLockInForTask}
              />
            )}

            {activeTab.type === 'aistudio' && (
              <GoogleAIStudioWorkspace
                projects={projects}
                activeProjectId={activeProject?.id}
                userEmail={effectiveUserEmail}
                userName={effectiveUserName}
              />
            )}

            {activeTab.type === 'ai' && (
              <AIView
                projects={projects}
                activeProjectId={activeProject?.id}
                onNavigate={handleNavigateToType}
                promptHistory={promptHistory}
                onSavePromptHistory={handleSavePromptHistory}
              />
            )}

            {activeTab.type === 'github' && (
              <GitHubView
                projects={projects}
                onSelectProject={handleSelectProject}
                onOpenGitHubPush={() => setIsGitHubPushModalOpen(true)}
              />
            )}

            {activeTab.type === 'drafts' && (
              <DraftVaultView
                drafts={drafts}
                projects={projects}
                onSaveDraft={handleSaveDraft}
                onDeleteDraft={handleDeleteDraft}
                onSelectProject={handleSelectProject}
              />
            )}

            {activeTab.type === 'more' && (
              <MoreView
                settings={settings}
                onUpdateSettings={setSettings}
                projects={projects}
                drafts={drafts}
                sessions={lockInSessions}
                onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
                onOpenGitHubPush={() => setIsGitHubPushModalOpen(true)}
                isGoogleConnected={isGoogleConnected}
                currentUserEmail={effectiveUserEmail}
                onImportAllData={(data) => {
                  setProjects(data.projects);
                  setDrafts(data.drafts);
                  if (data.settings) setSettings(data.settings);
                }}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </div>
        </main>
      </div>

      {/* 3. Floating Bottom Navigation Dock (Matches Prototype Screenshot) */}
      <BottomNavDock
        activeType={activeTab.type}
        onNavigate={(type) => handleNavigateToType(type)}
      />

      {/* 4. Modals & Productivity Overlays */}
      <LockInModal
        isOpen={isLockInModalOpen}
        onClose={() => setIsLockInModalOpen(false)}
        lockInState={lockInState}
        onUpdateLockInState={setLockInState}
        projects={projects}
        sessions={lockInSessions}
        onSaveSession={handleSaveSession}
      />

      <OmniSearchModal
        isOpen={isOmniSearchOpen}
        onClose={() => setIsOmniSearchOpen(false)}
        projects={projects}
        drafts={drafts}
        onSelectProject={handleSelectProject}
        onNavigate={handleNavigateToType}
        onToggleLockIn={() => setIsLockInModalOpen(true)}
        onNewProject={() => setIsNewProjectOpen(true)}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={setCurrentUser}
        projects={projects}
        drafts={drafts}
        sessions={lockInSessions}
        settings={settings}
        onRestoreWorkspace={(data) => {
          setProjects(data.projects);
          setDrafts(data.drafts);
          if (data.settings) setSettings(data.settings);
        }}
      />

      <GitHubPushModal
        isOpen={isGitHubPushModalOpen}
        onClose={() => setIsGitHubPushModalOpen(false)}
      />
    </div>
  );
}
