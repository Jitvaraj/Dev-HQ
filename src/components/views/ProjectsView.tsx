import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  ArrowRight,
  GitBranch,
  Bot,
  Globe,
  Gem,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  Code2,
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types/index.ts';
import { filterProjects } from '../../utils/workspaceLogic.ts';

interface ProjectsViewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onSelectProject,
  onNewProject,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = filterProjects(projects, searchQuery, statusFilter);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Published':
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'Completed':
        return 'text-purple-400 bg-purple-500/15 border-purple-500/30';
      case 'Archived':
        return 'text-slate-400 bg-slate-500/15 border-slate-500/30';
      case 'In Progress':
      default:
        return 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
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
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Project Workspaces</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your development projects, repositories, and AI contexts.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0a1224]/80 p-3 rounded-2xl border border-sky-500/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter projects by title, stack, or category..."
            className="w-full bg-[#070b16] border border-sky-500/20 focus:border-sky-400/50 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['all', 'In Progress', 'Published', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((proj) => {
          const completedTasks = proj.tasks.filter((t) => t.completed).length;
          const totalTasks = proj.tasks.length;

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="group relative flex flex-col justify-between p-5 rounded-3xl bg-[#091122]/90 hover:bg-[#0c162b] border border-sky-500/20 hover:border-sky-400/45 cursor-pointer transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {renderProjectIcon(proj.iconType)}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(
                      proj.status
                    )}`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-cyan-400/80 font-medium">{proj.category}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="mt-5 space-y-3 pt-4 border-t border-slate-800/60">
                {/* Tech stack badge & GitHub */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[150px] font-mono text-[10px] text-slate-400">
                    {proj.techStack}
                  </span>
                  {proj.githubRepo && (
                    <span className="flex items-center gap-1 text-slate-400 hover:text-cyan-300">
                      <GitBranch className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{proj.githubRepo.split('/')[1] || proj.githubRepo}</span>
                    </span>
                  )}
                </div>

                {/* Task Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Tasks</span>
                    <span>
                      {completedTasks}/{totalTasks}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                      style={{
                        width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                {/* Open Workspace Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-cyan-400 font-semibold group-hover:underline flex items-center gap-1">
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {onDeleteProject && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${proj.name}"?`)) {
                          onDeleteProject(proj.id);
                        }
                      }}
                      className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
