import React, { useState } from 'react';
import {
  ArrowLeft,
  GitBranch,
  ExternalLink,
  Sparkles,
  CheckSquare,
  Square,
  Plus,
  Copy,
  Check,
  Send,
  Flag,
  Calendar,
  Layers,
  FileCode,
  Lock,
  Globe,
  Bot,
  Gem,
  Activity,
  Trash2,
} from 'lucide-react';
import { Project, ProjectTask, WorkspaceTabType } from '../../types/index.ts';
import { formatGoogleAIStudioExport } from '../../utils/workspaceLogic.ts';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  onNavigate: (type: WorkspaceTabType) => void;
  onStartLockIn: (projectId: string, taskTitle: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onUpdateProject,
  onNavigate,
  onStartLockIn,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tasks' | 'ai' | 'notes' | 'activity'>('overview');
  const [copiedContext, setCopiedContext] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [generatedPromptText, setGeneratedPromptText] = useState('');

  const toggleTask = (taskId: string) => {
    const updatedTasks = project.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updated: Project = {
      ...project,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          description: `Updated task status in ${project.name}`,
          type: 'task',
        },
        ...project.activity,
      ],
    };
    onUpdateProject(updated);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
    };
    const updated: Project = {
      ...project,
      tasks: [...project.tasks, newTask],
      updatedAt: new Date().toISOString(),
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          description: `Added task: "${newTask.title}"`,
          type: 'task',
        },
        ...project.activity,
      ],
    };
    onUpdateProject(updated);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (taskId: string) => {
    const updated: Project = {
      ...project,
      tasks: project.tasks.filter((t) => t.id !== taskId),
    };
    onUpdateProject(updated);
  };

  const handleCopyAIStudioPrompt = () => {
    const text = formatGoogleAIStudioExport(project);
    navigator.clipboard.writeText(text);
    setCopiedContext(true);
    setTimeout(() => setCopiedContext(false), 2000);
  };

  const handleGenerateSystemPrompt = async () => {
    setIsGeneratingPrompt(true);
    setGeneratedPromptText('');

    try {
      const res = await fetch('/api/gemini/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            name: project.name,
            description: project.description,
            techStack: project.techStack,
            status: project.status,
          },
          category: 'Architecture and System Instructions',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedPromptText(data.prompt);
      } else {
        setGeneratedPromptText(`Failed to generate prompt: ${data.error}`);
      }
    } catch (err: any) {
      setGeneratedPromptText(`Error: ${err?.message}`);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const completedCount = project.tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-sky-500/15">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#091122] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-sky-500/20 transition-all"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-white tracking-tight">{project.name}</h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {project.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{project.category} · {project.techStack}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyAIStudioPrompt}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d172e] hover:bg-[#122144] border border-sky-400/30 text-cyan-300 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(56,189,248,0.15)]"
          >
            {copiedContext ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedContext ? 'Context Copied!' : 'Copy AI Studio Prompt'}</span>
          </button>

          <button
            onClick={() => onNavigate('aistudio')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open in AI Studio</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1 bg-[#091122]/90 p-1.5 rounded-2xl border border-sky-500/20 max-w-2xl">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'tasks', label: `Tasks (${completedCount}/${project.tasks.length})` },
          { id: 'ai', label: 'AI Context & Prompts' },
          { id: 'notes', label: 'Notes & Specs' },
          { id: 'activity', label: 'Activity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap text-center ${
              activeSubTab === tab.id
                ? 'bg-gradient-to-r from-blue-600/40 via-cyan-500/30 to-blue-600/40 text-cyan-300 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Mission */}
            <div className="p-6 rounded-3xl bg-[#091122]/90 border border-sky-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-sm font-bold text-white mb-2">Project Mission & Architecture</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Tasks Summary */}
            <div className="p-6 rounded-3xl bg-[#091122]/90 border border-sky-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Roadmap & Next Tasks</h3>
                <button
                  onClick={() => setActiveSubTab('tasks')}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Manage all tasks
                </button>
              </div>

              <div className="space-y-2">
                {project.tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0c162b]/80 hover:bg-[#101e3d] border border-sky-500/15 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                      <span
                        className={`text-xs ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    {!task.completed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartLockIn(project.id, task.title);
                        }}
                        className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20"
                        title="Start focus timer on this task"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Lock In</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Meta, Repos & Links */}
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-[#091122]/90 border border-sky-500/20 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Deployment & Links
              </h3>

              <div className="space-y-2.5 text-xs">
                {project.githubRepo && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c162b] border border-sky-500/15">
                    <div className="flex items-center gap-2 text-slate-300">
                      <GitBranch className="w-4 h-4 text-cyan-400" />
                      <span className="truncate max-w-[130px]">{project.githubRepo}</span>
                    </div>
                    <button
                      onClick={() => onNavigate('github')}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {project.productionUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c162b] border border-sky-500/15">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="truncate max-w-[130px]">Production</span>
                    </div>
                    <a
                      href={project.productionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {project.stagingUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c162b] border border-sky-500/15">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span className="truncate max-w-[130px]">Staging Preview</span>
                    </div>
                    <a
                      href={project.stagingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Milestones */}
            <div className="p-5 rounded-3xl bg-[#091122]/90 border border-sky-500/20 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Milestones
              </h3>
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Flag className={`w-3.5 h-3.5 ${m.completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className={m.completed ? 'text-slate-400 line-through' : 'text-slate-200'}>
                      {m.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{m.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks & Milestones */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6">
          {/* Add New Task Form */}
          <div className="p-5 rounded-3xl bg-[#091122]/90 border border-sky-500/20 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add new task or milestone item..."
              className="w-full sm:flex-1 bg-[#0c162b] border border-sky-500/20 focus:border-sky-400/50 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-[#0c162b] border border-sky-500/20 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0c162b]/80 hover:bg-[#101e3d] border border-sky-500/15 transition-all"
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  {task.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span
                    className={`text-xs ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono ${
                      task.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!task.completed && (
                    <button
                      onClick={() => onStartLockIn(project.id, task.title)}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Lock In</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Context & Prompts */}
      {activeSubTab === 'ai' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#091122]/90 border border-sky-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Project AI Context & Studio Directives
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-configured system instructions to use inside Google AI Studio or local LLM assistants.
                </p>
              </div>

              <button
                onClick={handleGenerateSystemPrompt}
                disabled={isGeneratingPrompt}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingPrompt ? 'Generating...' : 'Auto-Generate with Gemini'}</span>
              </button>
            </div>

            <div className="bg-[#050810] border border-sky-500/20 rounded-2xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {generatedPromptText || formatGoogleAIStudioExport(project)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyAIStudioPrompt}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-cyan-300 text-xs font-bold"
              >
                {copiedContext ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedContext ? 'Copied to Clipboard!' : 'Copy Formatted Prompt'}</span>
              </button>

              <button
                onClick={() => onNavigate('aistudio')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Google AI Studio Tab</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notes & Specs */}
      {activeSubTab === 'notes' && (
        <div className="p-6 rounded-3xl bg-[#091122]/90 border border-sky-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white">Project Notes & Development Specs</h3>
          <textarea
            value={project.notes || ''}
            onChange={(e) =>
              onUpdateProject({ ...project, notes: e.target.value, updatedAt: new Date().toISOString() })
            }
            placeholder="Write architecture notes, design decisions, API contracts..."
            rows={8}
            className="w-full bg-[#050810] border border-sky-500/20 focus:border-sky-400/50 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-sans leading-relaxed"
          />
          <p className="text-[11px] text-slate-500">Auto-saved to local workspace.</p>
        </div>
      )}

      {/* Tab 5: Activity */}
      {activeSubTab === 'activity' && (
        <div className="p-6 rounded-3xl bg-[#091122]/90 border border-sky-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white">Project Activity Timeline</h3>
          <div className="space-y-3">
            {project.activity.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shadow-[0_0_6px_#38bdf8]" />
                <div className="flex-1">
                  <p className="text-slate-200">{act.description}</p>
                  <span className="text-[10px] text-slate-500">{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
