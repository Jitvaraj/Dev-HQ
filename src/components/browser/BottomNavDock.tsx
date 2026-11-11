import React from 'react';
import {
  Home,
  FolderGit2,
  Sparkles,
  GitBranch,
  FileText,
  LayoutGrid,
  ChevronUp,
} from 'lucide-react';
import { WorkspaceTabType } from '../../types/index.ts';

interface BottomNavDockProps {
  activeType: WorkspaceTabType;
  onNavigate: (type: WorkspaceTabType) => void;
  className?: string;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  activeType,
  onNavigate,
  className = '',
}) => {
  const items: { type: WorkspaceTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { type: 'home', label: 'Home', icon: Home },
    { type: 'projects', label: 'Projects', icon: FolderGit2 },
    { type: 'ai', label: 'AI', icon: Sparkles },
    { type: 'github', label: 'GitHub', icon: GitBranch },
    { type: 'drafts', label: 'Drafts', icon: FileText },
    { type: 'more', label: 'More', icon: LayoutGrid },
  ];

  return (
    <footer
      className={`fixed bottom-4 left-0 right-0 flex items-center justify-center px-4 pointer-events-none z-40 ${className}`}
    >
      <div className="w-full max-w-5xl flex items-center justify-between gap-4">
        {/* Spacer for left balance */}
        <div className="hidden lg:block w-48" />

        {/* Floating Glass Dock Capsule (Matches Prototype Image) */}
        <div className="pointer-events-auto mx-auto flex items-center justify-between sm:justify-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-[#0a1122]/90 backdrop-blur-2xl border border-sky-400/25 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(56,189,248,0.18)] max-w-full overflow-x-auto no-scrollbar">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeType === item.type || (item.type === 'projects' && activeType === 'project-detail');

            return (
              <button
                key={item.type}
                onClick={() => onNavigate(item.type)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold transition-all duration-200 shrink-0 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-[0_0_18px_rgba(56,189,248,0.45)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
                aria-label={item.label}
              >
                <Icon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />
                <span className="text-[11px] sm:text-xs whitespace-nowrap">{item.label}</span>
                {item.type === 'more' && (
                  <ChevronUp
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* System Status Mini Monitor (Right Edge - Matches Prototype) */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl bg-[#090f1d]/80 backdrop-blur-xl border border-sky-500/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)] shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">System Status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span className="text-xs font-semibold text-emerald-400">All systems good</span>
            </div>
          </div>
          {/* Mini Sparkline Chart SVG */}
          <div className="w-16 h-6 flex items-center">
            <svg viewBox="0 0 60 20" className="w-full h-full text-cyan-400 stroke-current fill-none" strokeWidth="2">
              <path d="M0,15 Q15,18 25,8 T45,12 T60,4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
};
