import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FolderGit2,
  Sparkles,
  GitBranch,
  FileText,
  Lock,
  Plus,
  ExternalLink,
  X,
  Code2,
} from 'lucide-react';
import { Project, Draft, WorkspaceTabType } from '../../types/index.ts';

interface OmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  drafts: Draft[];
  onSelectProject: (projectId: string) => void;
  onNavigate: (type: WorkspaceTabType) => void;
  onToggleLockIn: () => void;
  onNewProject: () => void;
}

export const OmniSearchModal: React.FC<OmniSearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  drafts,
  onSelectProject,
  onNavigate,
  onToggleLockIn,
  onNewProject,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredProjects = projects.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.techStack.toLowerCase().includes(q)
  );

  const filteredDrafts = drafts.filter(
    (d) => !q || d.title.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q))
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#090f1e]/95 border border-sky-400/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-sky-500/20 bg-[#0c1426]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, drafts, tools, or type a command... (Esc to close)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {!q && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-1.5">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onNewProject();
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/25 transition-all text-left"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Create New Project</span>
                </button>
                <button
                  onClick={() => {
                    onToggleLockIn();
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/25 transition-all text-left"
                >
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Toggle Lock In Mode</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('aistudio');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/25 transition-all text-left"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Open Google AI Studio</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('github');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/25 transition-all text-left"
                >
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span>GitHub Repository Hub</span>
                </button>
              </div>
            </div>
          )}

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-1.5">
                Projects ({filteredProjects.length})
              </p>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-sky-500/15 border border-transparent hover:border-sky-500/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-cyan-400">
                        <FolderGit2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-sm">
                          {p.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drafts Results */}
          {filteredDrafts.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-1.5">
                Drafts ({filteredDrafts.length})
              </p>
              <div className="space-y-1">
                {filteredDrafts.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onNavigate('drafts');
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-sky-500/15 border border-transparent hover:border-sky-500/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                          {d.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{d.type}</span>
                          <span>·</span>
                          <span>{d.tags.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
