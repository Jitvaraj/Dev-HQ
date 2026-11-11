import React from 'react';
import {
  Code2,
  Home,
  FolderGit2,
  Sparkles,
  GitBranch,
  FileText,
  LayoutGrid,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { WorkspaceTabType } from '../../types/index.ts';

interface QuickLauncherProps {
  activeType: WorkspaceTabType;
  onNavigate: (type: WorkspaceTabType) => void;
  isLockInActive: boolean;
  onToggleLockIn: () => void;
  className?: string;
}

export const QuickLauncher: React.FC<QuickLauncherProps> = ({
  activeType,
  onNavigate,
  isLockInActive,
  onToggleLockIn,
  className = '',
}) => {
  const navItems: { type: WorkspaceTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { type: 'home', label: 'Home', icon: Home },
    { type: 'projects', label: 'Projects', icon: FolderGit2 },
    { type: 'ai', label: 'AI', icon: Sparkles },
    { type: 'github', label: 'GitHub', icon: GitBranch },
    { type: 'drafts', label: 'Drafts', icon: FileText },
    { type: 'more', label: 'More', icon: LayoutGrid },
  ];

  return (
    <aside
      className={`w-56 shrink-0 flex flex-col justify-between p-3 border-r border-sky-500/15 bg-[#060a14]/90 backdrop-blur-xl ${className}`}
    >
      {/* Top Branding Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] border border-cyan-300/30">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
              <span>DEV HQ</span>
            </div>
            <p className="text-[10px] text-cyan-400/80 font-medium tracking-tight">
              Build · Develop · Innovate
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeType === item.type || (item.type === 'projects' && activeType === 'project-detail');

            return (
              <button
                key={item.type}
                onClick={() => onNavigate(item.type)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-transparent text-cyan-300 border border-sky-400/35 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400 drop-shadow-[0_0_6px_#38bdf8]' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.type === 'more' && (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Lock In Widget & Status */}
      <div className="space-y-3 pt-4 border-t border-sky-500/15">
        {/* Lock In Focus Mode Card (Matches Screenshot) */}
        <div
          onClick={onToggleLockIn}
          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            isLockInActive
              ? 'bg-blue-950/40 border-cyan-400/50 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
              : 'bg-[#0b1222]/80 border-sky-500/20 hover:border-sky-500/40 hover:bg-[#0e172a]/90'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isLockInActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400'
              }`}
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Lock In</span>
              </div>
              <p className="text-[10px] text-slate-400">Focus mode</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              isLockInActive ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                isLockInActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Version & Online Badge */}
        <div className="px-3 py-2 rounded-xl bg-[#090f1d]/60 border border-sky-500/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="font-medium text-slate-300">DEV HQ v1.0</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Local · Online</span>
        </div>
      </div>
    </aside>
  );
};
