import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Star,
  Download,
  Grid,
  X,
  Plus,
  Minus,
  Square,
  Search,
} from 'lucide-react';
import { WorkspaceTab } from '../../types/index.ts';

interface BrowserTopBarProps {
  tabs: WorkspaceTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
  onNavigateHome: () => void;
  onOpenOmnibar: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenGitHubPush?: () => void;
  userEmail?: string;
  userName?: string;
  currentUserPhoto?: string | null;
  isGoogleConnected?: boolean;
}

export const BrowserTopBar: React.FC<BrowserTopBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onNavigateHome,
  onOpenOmnibar,
  onOpenGoogleDrive,
  onOpenGitHubPush,
  userEmail = 'developer@devhq.app',
  userName = 'Developer',
  currentUserPhoto = null,
  isGoogleConnected = false,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const [urlInput, setUrlInput] = useState(activeTab?.url || 'devhq.app');
  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onOpenOmnibar();
    }
  };

  return (
    <header className="w-full bg-[#050810]/90 backdrop-blur-md border-b border-sky-500/15 select-none z-30 shrink-0">
      {/* Upper Tab Bar Row */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 gap-2">
        {/* Left App / Window Icon */}
        <div className="flex items-center gap-2 shrink-0 pr-1">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-[0_0_10px_rgba(56,189,248,0.3)]">
            <span className="text-[10px]">HQ</span>
          </div>
        </div>

        {/* Workspace Tabs Container */}
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition-all max-w-[220px] shrink-0 border-t border-x ${
                  isActive
                    ? 'bg-[#0d1628]/95 text-cyan-300 border-sky-500/30 shadow-[0_-2px_10px_rgba(56,189,248,0.12)]'
                    : 'bg-[#090f1d]/50 text-slate-400 border-transparent hover:bg-[#0c1425]/60 hover:text-slate-200'
                }`}
                title={tab.title}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-cyan-400 shadow-[0_0_6px_#38bdf8]' : 'bg-slate-600'
                  }`}
                />
                <span className="truncate">{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-rose-400 transition-opacity ml-1"
                    aria-label={`Close ${tab.title}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={onNewTab}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/40 transition-colors shrink-0"
            aria-label="New Workspace Tab"
            title="Open new workspace tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window Controls (Mac/PC style) */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2 text-slate-400">
          <button
            className="p-1 hover:text-slate-200 hover:bg-slate-800/40 rounded transition-colors"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 hover:text-slate-200 hover:bg-slate-800/40 rounded transition-colors"
            aria-label="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            className="p-1 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lower Navigation & Address Bar Row */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#070b16]/70 border-t border-sky-500/10">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <button
            onClick={() => {}}
            className="p-1.5 rounded-md hover:text-cyan-300 hover:bg-slate-800/40 transition-colors disabled:opacity-30"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {}}
            className="p-1.5 rounded-md hover:text-cyan-300 hover:bg-slate-800/40 transition-colors disabled:opacity-30"
            aria-label="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-md hover:text-cyan-300 hover:bg-slate-800/40 transition-colors ${
              isRefreshing ? 'animate-spin text-cyan-400' : ''
            }`}
            aria-label="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateHome}
            className="p-1.5 rounded-md hover:text-cyan-300 hover:bg-slate-800/40 transition-colors"
            aria-label="Workspace Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibar / Address bar */}
        <div className="flex-1 flex items-center relative max-w-3xl">
          <div
            onClick={onOpenOmnibar}
            className="w-full flex items-center gap-2 bg-[#0a101f]/80 hover:bg-[#0c1426] border border-sky-500/20 hover:border-sky-400/40 rounded-full px-3.5 py-1.5 text-xs text-slate-300 transition-all cursor-pointer shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] group"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
            <span className="font-mono text-cyan-300/90 font-medium">devhq.app</span>
            <span className="text-slate-500">/</span>
            <span className="truncate text-slate-300">{activeTab?.type}</span>
            <div className="ml-auto flex items-center gap-2 text-slate-500">
              <span className="text-[10px] bg-slate-800/80 border border-slate-700/60 rounded px-1.5 py-0.5 group-hover:text-cyan-300 group-hover:border-sky-500/30">
                Ctrl + K
              </span>
              <Star className="w-3.5 h-3.5 hover:text-amber-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* Right utility items */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* GitHub Push Quick Button */}
          {onOpenGitHubPush && (
            <button
              onClick={onOpenGitHubPush}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-[11px] font-semibold text-slate-300 hover:text-white transition-all shadow-[0_0_10px_rgba(0,0,0,0.3)]"
              title="Push all work to GitHub (Jitvaraj/Dev-HQ)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
              <span className="font-mono text-[10px]">Dev-HQ</span>
            </button>
          )}

          {/* Google Drive Status & Sync Button */}
          {onOpenGoogleDrive && (
            <button
              onClick={onOpenGoogleDrive}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                isGoogleConnected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                  : 'bg-sky-950/40 border-sky-500/30 text-cyan-300 hover:bg-sky-900/40 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
              }`}
              title={isGoogleConnected ? 'Google Drive Connected - Click to view or create backups' : 'Connect your Google Drive'}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
              <span className="hidden sm:inline">
                {isGoogleConnected ? 'Drive Connected' : 'Google Drive'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenOmnibar}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/40 rounded-md transition-colors"
            aria-label="Search"
            title="Search projects and tools"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Profile Avatar with Connected Dot */}
          <div
            onClick={onOpenGoogleDrive}
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold border border-cyan-300/40 shadow-[0_0_10px_rgba(56,189,248,0.4)] cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all shrink-0 ml-1 overflow-hidden"
            title={userName ? `${userName} (${userEmail})` : 'Developer Profile'}
          >
            {currentUserPhoto ? (
              <img src={currentUserPhoto} alt={userName} className="w-full h-full object-cover" />
            ) : (
              (userName || 'D').charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
