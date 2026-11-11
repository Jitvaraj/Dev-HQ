import React, { useState } from 'react';
import {
  GitBranch,
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  Search,
  CheckCircle2,
  GitCommit,
  FolderGit2,
  Layers,
  Clock,
  ShieldCheck,
  RefreshCw,
  UploadCloud,
  Download,
} from 'lucide-react';
import { Project } from '../../types/index.ts';

interface GitHubViewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onOpenGitHubPush?: () => void;
}

interface RepoData {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  defaultBranch: string;
  htmlUrl: string;
  updatedAt: string;
}

export const GitHubView: React.FC<GitHubViewProps> = ({ projects, onSelectProject, onOpenGitHubPush }) => {
  const [repoSearchInput, setRepoSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [queriedRepo, setQueriedRepo] = useState<RepoData | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleQueryRepo = async (repoName?: string) => {
    const target = (repoName || repoSearchInput).trim();
    if (!target) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/github/repo?repo=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (res.ok) {
        setQueriedRepo(data);
      } else {
        setSearchError(data.error || 'Repository not found');
      }
    } catch (err: any) {
      setSearchError(err?.message || 'Failed to fetch repository data');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <GitBranch className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">GitHub Repository Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Read-only repository integration, commit activity, and project mapping.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <a
            href="https://github.com/Jitvaraj"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
          >
            <span>@Jitvaraj</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Prominent Push to Jitvaraj/Dev-HQ Repository Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0c162b] via-[#0e1a33] to-[#091122] border border-sky-400/30 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_20px_rgba(56,189,248,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Target Repository
            </span>
            <a
              href="https://github.com/Jitvaraj/Dev-HQ"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm font-bold text-white hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <span>Jitvaraj/Dev-HQ</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
          <p className="text-xs text-slate-300">
            Deploy the complete DEV HQ codebase directly to your remote repository via Personal Access Token or download archive.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {onOpenGitHubPush && (
            <button
              onClick={onOpenGitHubPush}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(56,189,248,0.35)] active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Push All Work Now 🚀</span>
            </button>
          )}
          <a
            href="/api/git/export"
            download="Dev-HQ-complete-source.tar.gz"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#070d1a] hover:bg-slate-800 border border-sky-500/25 text-xs text-slate-200 hover:text-white font-semibold transition-all"
            title="Download full project archive"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export .tar.gz</span>
          </a>
        </div>
      </div>

      {/* Live GitHub Repository Explorer Bar */}
      <div className="p-4 rounded-3xl bg-[#091122]/90 border border-sky-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Live Public Repository Inspector
          </h3>
          {/* Quick chips for user's repos */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setRepoSearchInput('Jitvaraj/dev-hq');
                handleQueryRepo('Jitvaraj/dev-hq');
              }}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-cyan-300 border border-sky-500/30 hover:bg-sky-500/25"
            >
              Jitvaraj/dev-hq
            </button>
            <button
              onClick={() => {
                setRepoSearchInput('Jitvaraj/Orion-Forge');
                handleQueryRepo('Jitvaraj/Orion-Forge');
              }}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-cyan-300 border border-sky-500/30 hover:bg-sky-500/25"
            >
              Jitvaraj/Orion-Forge
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={repoSearchInput}
              onChange={(e) => setRepoSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQueryRepo()}
              placeholder="e.g. Jitvaraj/dev-hq, Jitvaraj/Orion-Forge, or owner/repo..."
              className="w-full bg-[#050810] border border-sky-500/20 focus:border-sky-400/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>
          <button
            onClick={() => handleQueryRepo()}
            disabled={isSearching || !repoSearchInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Querying...' : 'Fetch Repo'}</span>
          </button>
        </div>

        {searchError && (
          <div className="text-xs text-rose-400 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20">
            {searchError}
          </div>
        )}

        {queriedRepo && (
          <div className="p-4 rounded-2xl bg-[#0c162b] border border-sky-500/30 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-cyan-300 font-mono">{queriedRepo.fullName}</h4>
                <p className="text-xs text-slate-300 mt-1">{queriedRepo.description || 'No description provided'}</p>
              </div>
              <a
                href={queriedRepo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>Open GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Star className="w-3.5 h-3.5" />
                <span>{queriedRepo.stars.toLocaleString()} stars</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <GitFork className="w-3.5 h-3.5" />
                <span>{queriedRepo.forks.toLocaleString()} forks</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{queriedRepo.openIssues} issues</span>
              </span>
              <span className="font-mono text-cyan-400">{queriedRepo.language}</span>
              <span className="font-mono text-slate-500">branch: {queriedRepo.defaultBranch}</span>
            </div>
          </div>
        )}
      </div>

      {/* Project-to-Repository Mappings */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-cyan-400" />
          <span>Project Repository Mappings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="p-5 rounded-3xl bg-[#091122]/90 hover:bg-[#0c162b] border border-sky-500/20 hover:border-sky-400/40 cursor-pointer transition-all space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{proj.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  {proj.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-mono text-cyan-300/90 truncate">
                    {proj.githubRepo || 'No repo linked'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Main branch: main · Active</span>
                </div>
              </div>

              {/* Simulated Commits Preview */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Recent Commits
                </span>
                <div className="text-[11px] text-slate-300 font-mono truncate">
                  feat: Add persistent glassmorphism navigation
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  refactor: Modularize workspace components
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
