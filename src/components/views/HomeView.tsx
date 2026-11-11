import React, { useState } from 'react';
import {
  FolderGit2,
  Sparkles,
  GitBranch,
  ArrowRight,
  MoreHorizontal,
  Send,
  Plus,
  Bell,
  Search,
  ExternalLink,
  Bot,
  Globe,
  Gem,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import { Project, WorkspaceTabType } from '../../types/index.ts';

interface HomeViewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNavigate: (type: WorkspaceTabType) => void;
  onNewProject: () => void;
  onOpenOmnibar: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenGitHubPush?: () => void;
  userName?: string;
  userEmail?: string;
  isGoogleConnected?: boolean;
  currentUserPhoto?: string | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
  onNewProject,
  onOpenOmnibar,
  onOpenGoogleDrive,
  onOpenGitHubPush,
  userName = 'Developer',
  userEmail = '',
  isGoogleConnected = false,
  currentUserPhoto = null,
}) => {
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isSendingAi, setIsSendingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleSendQuickAi = async (promptText?: string) => {
    const textToSend = promptText || quickPrompt;
    if (!textToSend.trim() || isSendingAi) return;

    setIsSendingAi(true);
    setAiResponse(null);

    try {
      const activeProject = projects[0];
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          projectContext: activeProject
            ? {
                name: activeProject.name,
                techStack: activeProject.techStack,
                description: activeProject.description,
                status: activeProject.status,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiResponse(data.reply);
      } else {
        setAiResponse(`Error: ${data.error || 'Failed to communicate with Gemini assistant'}`);
      }
    } catch (err: any) {
      setAiResponse(`Network Error: ${err?.message || 'Unable to connect to assistant'}`);
    } finally {
      setIsSendingAi(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-400 text-emerald-300';
      case 'Completed':
        return 'bg-purple-400 text-purple-300';
      case 'In Progress':
      default:
        return 'bg-cyan-400 text-cyan-300';
    }
  };

  const renderProjectIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-emerald-400" />;
      case 'gem':
        return <Gem className="w-5 h-5 text-purple-400" />;
      case 'jarvis':
      default:
        return <Bot className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Row with Search & Account (Matches Screenshot) */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-1">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-cyan-300/30">
            <span className="font-mono font-extrabold text-sm">&lt;/&gt;</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              DEV HQ
            </h1>
            <p className="text-xs text-cyan-400/80 font-medium">Build · Develop · Innovate</p>
          </div>
        </div>

        {/* Center Omnibar Search Bar */}
        <div className="w-full lg:max-w-xl">
          <button
            onClick={onOpenOmnibar}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-[#0d1628]/80 hover:bg-[#101b33] border border-sky-400/25 hover:border-sky-400/40 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">Search projects, tools, or ask anything...</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 group-hover:text-cyan-300 shrink-0">
              Ctrl + K
            </span>
          </button>
        </div>

        {/* Right Google Drive & Notifications */}
        <div className="flex items-center gap-3 self-end lg:self-auto shrink-0">
          {/* Google Drive Connected / Sync Pill */}
          <div
            onClick={onOpenGoogleDrive}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all group ${
              isGoogleConnected
                ? 'bg-[#0d1628]/95 border-emerald-500/40 hover:border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                : 'bg-[#0d1628]/90 border-sky-400/25 hover:border-sky-400/45'
            }`}
            title={isGoogleConnected ? `Google Drive Connected: ${userEmail}` : 'Click to connect your personal Google Drive'}
          >
            {/* Google Logo Mark */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-semibold text-slate-200 group-hover:text-cyan-300">
                Google Drive
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isGoogleConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-cyan-400 shadow-[0_0_6px_#38bdf8]'
                  }`}
                />
                <span className={`text-[10px] font-medium ${isGoogleConnected ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {isGoogleConnected ? 'Connected' : 'Connect Drive'}
                </span>
              </div>
            </div>
          </div>

          {/* GitHub Push Header Action */}
          {onOpenGitHubPush && (
            <button
              onClick={onOpenGitHubPush}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d1628]/80 hover:bg-[#121f38] border border-sky-500/25 text-xs text-slate-300 hover:text-cyan-300 transition-all font-mono shadow-[0_0_10px_rgba(56,189,248,0.1)]"
              title="Push to GitHub Jitvaraj/Dev-HQ"
            >
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Push Dev-HQ</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => onNavigate('more')}
            className="relative p-2 rounded-full bg-[#0d1628]/80 border border-sky-500/20 text-slate-300 hover:text-cyan-300 hover:border-sky-400/40 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
          </button>

          {/* User Avatar Circle */}
          <div
            onClick={onOpenGoogleDrive || (() => onNavigate('more'))}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold border border-cyan-300/40 shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all overflow-hidden"
            title={userName ? `${userName} (${userEmail || 'Local'})` : 'Developer Profile'}
          >
            {currentUserPhoto ? (
              <img src={currentUserPhoto} alt={userName} className="w-full h-full object-cover" />
            ) : (
              (userName || 'D').charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Left: Hero Welcome Banner (Matches Screenshot with Blue Smoke Visual) */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-sky-400/25 bg-gradient-to-br from-[#0c162b] via-[#091122] to-[#060a16] p-6 lg:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(56,189,248,0.12)]">
          {/* Subtle Abstract Wave Effect */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl" />
            <svg
              className="absolute inset-0 w-full h-full text-cyan-500/10"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 500 200"
              preserveAspectRatio="none"
            >
              <path
                d="M0,120 C150,200 350,50 500,100 L500,200 L0,200 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full min-h-[170px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Welcome back, {userName} 👋
                </h2>
                <p className="text-sm text-slate-300 font-normal mt-1.5">
                  Your development hub is ready.
                </p>
              </div>

              {/* Status Badge in Banner */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1428]/80 border border-sky-500/25 text-xs text-emerald-400 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.15)] shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span>Online</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6 flex-wrap">
              <button
                onClick={onNewProject}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>

              <button
                onClick={() => onNavigate('ai')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0f1b33]/80 hover:bg-[#142445] border border-sky-400/30 hover:border-sky-400/50 text-cyan-300 text-xs font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.15)] active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Ask AI</span>
              </button>

              {onOpenGitHubPush && (
                <button
                  onClick={onOpenGitHubPush}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0c162b]/90 hover:bg-[#112040] border border-sky-500/30 hover:border-sky-400/50 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] active:scale-95"
                  title="Push complete codebase to Jitvaraj/Dev-HQ"
                >
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span>Push to GitHub</span>
                </button>
              )}

              {onOpenGoogleDrive && (
                <button
                  onClick={onOpenGoogleDrive}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0c162b]/90 hover:bg-[#112040] border border-sky-500/30 hover:border-sky-400/50 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] active:scale-95"
                  title="Sync and backup workspace to Google Drive"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Drive Sync</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top Right: Quick Access Card (Matches Screenshot: Google AI Studio, ChatGPT, GitHub) */}
        <div className="lg:col-span-5 rounded-3xl border border-sky-400/25 bg-[#091122]/90 backdrop-blur-xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.4),0_0_20px_rgba(56,189,248,0.1)] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-cyan-400 font-bold text-sm">⚡</span>
            <h3 className="text-sm font-bold text-white tracking-wide">Quick Access</h3>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* 1. Google AI Studio */}
            <div
              onClick={() => onNavigate('aistudio')}
              className="flex flex-col items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#0c162b]/80 hover:bg-[#101d38] border border-sky-500/20 hover:border-sky-400/40 cursor-pointer transition-all group text-center shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/80 flex items-center justify-center p-2 mb-1.5 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white text-center leading-tight">Google AI Studio</span>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold mt-2 group-hover:translate-x-0.5 transition-transform">
                <span>Direct Access</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* 2. ChatGPT */}
            <div
              onClick={() => onNavigate('ai')}
              className="flex flex-col items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#0c162b]/80 hover:bg-[#101d38] border border-sky-500/20 hover:border-sky-400/40 cursor-pointer transition-all group text-center shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/80 flex items-center justify-center p-2 mb-1.5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white text-center leading-tight">ChatGPT</span>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold mt-2 group-hover:translate-x-0.5 transition-transform">
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* 3. GitHub */}
            <div
              onClick={() => onNavigate('github')}
              className="flex flex-col items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#0c162b]/80 hover:bg-[#101d38] border border-sky-500/20 hover:border-sky-400/40 cursor-pointer transition-all group text-center shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/80 flex items-center justify-center p-2 mb-1.5 group-hover:scale-105 transition-transform">
                <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-slate-100" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white text-center leading-tight">GitHub</span>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold mt-2 group-hover:translate-x-0.5 transition-transform">
                <span>View Repos</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Middle Left: "Your Projects" (Matches Screenshot with 3 Cards) */}
        <div className="lg:col-span-7 rounded-3xl border border-sky-400/25 bg-[#091122]/90 backdrop-blur-xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.4),0_0_20px_rgba(56,189,248,0.1)]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">Your Projects</h3>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Project Cards Grid (Matches Screenshot: JARVIS, Arc, Orion Forge) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[#0c162b]/80 hover:bg-[#101d38] border border-sky-500/20 hover:border-sky-400/45 cursor-pointer transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {renderProjectIcon(proj.iconType)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(proj.id);
                      }}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800/40"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {proj.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{proj.category}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      proj.status === 'Published'
                        ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                        : proj.status === 'Completed'
                        ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]'
                        : 'bg-cyan-400 shadow-[0_0_6px_#38bdf8]'
                    }`}
                  />
                  <span className={`text-[11px] font-semibold ${getStatusColor(proj.status)}`}>
                    {proj.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Right: "AI Assistant (Beta)" Card (Matches Screenshot with prompt input and chips) */}
        <div className="lg:col-span-5 rounded-3xl border border-sky-400/25 bg-[#091122]/90 backdrop-blur-xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.4),0_0_20px_rgba(56,189,248,0.1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">AI Assistant</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Beta
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Ask, plan, or get help with your projects.
            </p>

            {/* Prompt Input Box with Send Button (Matches Screenshot) */}
            <div className="relative mb-3">
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendQuickAi();
                }}
                placeholder="What do you want to build today?"
                className="w-full bg-[#0a1224] border border-sky-500/25 focus:border-sky-400/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] pr-12"
              />
              <button
                onClick={() => handleSendQuickAi()}
                disabled={isSendingAi || !quickPrompt.trim()}
                className="absolute right-2 top-2 p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                aria-label="Send Prompt"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingAi ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            {/* Quick Suggestion Chips (Matches Screenshot) */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Plan a project', prompt: 'Create an architecture and milestone plan for a modern web application.' },
                { label: 'Write code', prompt: 'Generate a TypeScript utility function for resilient offline storage sync.' },
                { label: 'Explain this', prompt: 'Explain the benefits of glassmorphism and modern browser shell architecture.' },
                { label: 'More ideas', prompt: 'Suggest 3 high-impact features for a personal development operating workspace.' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setQuickPrompt(chip.prompt);
                    handleSendQuickAi(chip.prompt);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#0c162b]/80 hover:bg-sky-500/15 border border-sky-500/20 hover:border-sky-400/40 text-[11px] font-medium text-slate-300 hover:text-cyan-300 transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real AI Result Output (if generated) */}
          {aiResponse && (
            <div className="mt-4 p-3 rounded-2xl bg-[#070d1a] border border-sky-500/30 text-xs text-slate-200 animate-in fade-in">
              <div className="flex items-center justify-between mb-1 text-[10px] text-cyan-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Gemini 3.8 Flash Assistant
                </span>
                <button
                  onClick={() => onNavigate('ai')}
                  className="hover:underline flex items-center gap-1 text-slate-400 hover:text-cyan-300"
                >
                  <span>Full Chat</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto pr-1 text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
