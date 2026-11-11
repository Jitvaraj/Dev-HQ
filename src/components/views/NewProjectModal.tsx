import React, { useState } from 'react';
import {
  X,
  Plus,
  GitBranch,
  FileCode,
  Sparkles,
  Bot,
  Globe,
  Gem,
  ArrowRight,
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types/index.ts';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [workflowMode, setWorkflowMode] = useState<'scratch' | 'github' | 'template'>('scratch');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Web Application');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('TypeScript, React 19, Tailwind');
  const [githubRepo, setGithubRepo] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [iconType, setIconType] = useState<Project['iconType']>('jarvis');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      description: description.trim() || 'A new development project created in DEV HQ.',
      status,
      techStack: techStack.trim() || 'TypeScript, React',
      githubRepo: githubRepo.trim() || undefined,
      aiStudioContext: `Project ${name}: ${category}. Focus on modern TypeScript, clean patterns, and full functionality.`,
      tasks: [
        { id: `t-${Date.now()}-1`, title: 'Define project scope and architectural spec', completed: false, priority: 'high' },
        { id: `t-${Date.now()}-2`, title: 'Configure Google AI Studio prompt context', completed: false, priority: 'medium' },
      ],
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Initial Prototype & Spec', dueDate: '2026-12-01', completed: false },
      ],
      activity: [
        {
          id: `a-${Date.now()}`,
          timestamp: 'Just now',
          description: `Created project ${name} via ${workflowMode} workflow`,
          type: 'task',
        },
      ],
      iconType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateProject(newProject);
    onClose();
  };

  const applyTemplate = (tpl: { name: string; category: string; stack: string; desc: string; icon: Project['iconType'] }) => {
    setName(tpl.name);
    setCategory(tpl.category);
    setTechStack(tpl.stack);
    setDescription(tpl.desc);
    setIconType(tpl.icon);
    setWorkflowMode('scratch');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#091122]/95 border border-sky-400/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(56,189,248,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-sky-500/20 bg-[#0c1426]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">New Project Workflow</h3>
              <p className="text-xs text-slate-400">Initialize a dedicated project workspace in DEV HQ.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workflow Selection Tabs */}
        <div className="flex items-center gap-2 px-5 pt-4 bg-[#091122]">
          {[
            { id: 'scratch', label: 'Start from Scratch', icon: Plus },
            { id: 'github', label: 'Import GitHub Repo', icon: GitBranch },
            { id: 'template', label: 'From Template', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = workflowMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setWorkflowMode(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        {workflowMode === 'template' ? (
          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-slate-400 mb-2">Select a starter template to pre-fill configuration:</p>
            {[
              {
                name: 'Gemini Autonomous Assistant',
                category: 'AI Assistant App',
                stack: 'TypeScript, React 19, Gemini 3.8 Flash, Express',
                desc: 'Intelligent AI copilot connected directly to Google AI Studio with streaming execution.',
                icon: 'jarvis' as const,
              },
              {
                name: 'Modern Web Operating Platform',
                category: 'Web Platform',
                stack: 'React 19, Tailwind CSS v4, Node.js',
                desc: 'High-throughput browser-style workspace with tabs and offline IndexedDB support.',
                icon: 'globe' as const,
              },
              {
                name: 'Developer Toolchain Engine',
                category: 'Developer Tool',
                stack: 'Rust, WebAssembly, TypeScript, Vite',
                desc: 'Low-latency code analysis engine with syntax validation and instant benchmarks.',
                icon: 'gem' as const,
              },
            ].map((tpl) => (
              <div
                key={tpl.name}
                onClick={() => applyTemplate(tpl)}
                className="p-3.5 rounded-2xl bg-[#0c162b] hover:bg-[#101e3d] border border-sky-500/15 hover:border-sky-400/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {tpl.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tpl.desc}</div>
                  <div className="text-[10px] text-cyan-400/80 font-mono mt-1">{tpl.stack}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {workflowMode === 'github' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  GitHub Repository (owner/repo)
                </label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => {
                    setGithubRepo(e.target.value);
                    if (!name) {
                      const parts = e.target.value.split('/');
                      if (parts[1]) setName(parts[1]);
                    }
                  }}
                  placeholder="e.g. yourname/repo-name"
                  className="w-full bg-[#050810] border border-sky-500/25 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apollo Forge"
                className="w-full bg-[#050810] border border-sky-500/25 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. AI Assistant App"
                  className="w-full bg-[#050810] border border-sky-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#050810] border border-sky-500/25 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Published">Published</option>
                  <option value="Completed">Completed</option>
                  <option value="Concept">Concept</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tech Stack</label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g. TypeScript, React 19, Gemini 3.8 Flash"
                className="w-full bg-[#050810] border border-sky-500/25 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Goal</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief summary of architecture and objectives..."
                className="w-full bg-[#050810] border border-sky-500/25 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Icon</label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'jarvis', icon: Bot, label: 'AI/Bot' },
                  { id: 'globe', icon: Globe, label: 'Web' },
                  { id: 'gem', icon: Gem, label: 'Tool' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = iconType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIconType(item.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                          : 'bg-[#050810] text-slate-400 border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)] disabled:opacity-40"
              >
                Create Workspace
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
