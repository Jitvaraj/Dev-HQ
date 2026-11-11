import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Tag,
  Copy,
  Check,
  Trash2,
  Edit3,
  ExternalLink,
  FolderGit2,
  Lightbulb,
  FileCode,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Draft, DraftType, Project } from '../../types/index.ts';
import { filterDrafts } from '../../utils/workspaceLogic.ts';

interface DraftVaultViewProps {
  drafts: Draft[];
  projects: Project[];
  onSaveDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const DraftVaultView: React.FC<DraftVaultViewProps> = ({
  drafts,
  projects,
  onSaveDraft,
  onDeleteDraft,
  onSelectProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [activeDraftId, setActiveDraftId] = useState<string>(drafts[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editing state
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<DraftType>('idea');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editProjectId, setEditProjectId] = useState<string>('');

  const filtered = filterDrafts(drafts, searchQuery, typeFilter, selectedTag);
  const activeDraft = drafts.find((d) => d.id === activeDraftId) || filtered[0] || drafts[0];

  const handleStartNewDraft = () => {
    setEditTitle('New Development Specification');
    setEditType('spec');
    setEditContent('# Title\n\n## Overview\nDescribe the system architecture and requirements here.');
    setEditTags('Architecture, Spec');
    setEditProjectId(projects[0]?.id || '');
    setIsEditing(true);
  };

  const handleStartEdit = (draft: Draft) => {
    setEditTitle(draft.title);
    setEditType(draft.type);
    setEditContent(draft.content);
    setEditTags(draft.tags.join(', '));
    setEditProjectId(draft.projectId || '');
    setIsEditing(true);
  };

  const handleSaveDraft = () => {
    if (!editTitle.trim()) return;
    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const draftToSave: Draft = {
      id: activeDraft?.id && isEditing && editTitle === activeDraft.title ? activeDraft.id : `draft-${Date.now()}`,
      title: editTitle.trim(),
      type: editType,
      content: editContent,
      tags: tagsArray.length > 0 ? tagsArray : ['General'],
      projectId: editProjectId || undefined,
      createdAt: activeDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveDraft(draftToSave);
    setActiveDraftId(draftToSave.id);
    setIsEditing(false);
  };

  const handleCopyContent = () => {
    if (!activeDraft) return;
    navigator.clipboard.writeText(activeDraft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = (type: DraftType) => {
    switch (type) {
      case 'spec':
        return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'prompt':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'template':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'idea':
      default:
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Draft Vault</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Store development specs, prompt templates, architecture ideas, and project notes.
          </p>
        </div>

        <button
          onClick={handleStartNewDraft}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Draft</span>
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
            placeholder="Search saved ideas, specs, prompts, and tags..."
            className="w-full bg-[#070b16] border border-sky-500/20 focus:border-sky-400/50 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['all', 'spec', 'prompt', 'idea', 'template'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                typeFilter === type
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Drafts List & Viewer/Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Drafts Index */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((draft) => {
            const isSelected = draft.id === (activeDraft?.id || '');
            const linkedProj = projects.find((p) => p.id === draft.projectId);

            return (
              <div
                key={draft.id}
                onClick={() => {
                  setActiveDraftId(draft.id);
                  setIsEditing(false);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d1a33] border-cyan-400/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'bg-[#091122]/90 border-sky-500/15 hover:border-sky-500/35 hover:bg-[#0c162b]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(draft.type)}
                    <span className="text-xs font-bold text-white line-clamp-1">{draft.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {draft.type}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {draft.content.replace(/[#*`]/g, '')}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {draft.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-cyan-400/80">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {linkedProj && (
                    <span className="text-slate-400 truncate max-w-[120px]">
                      {linkedProj.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Draft Viewer or Editor */}
        <div className="lg:col-span-7 rounded-3xl border border-sky-400/25 bg-[#091122]/90 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between min-h-[500px]">
          {isEditing ? (
            /* Editing Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Edit Draft</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                  >
                    Save Draft
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Draft title..."
                  className="w-full bg-[#050810] border border-sky-500/25 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="bg-[#050810] border border-sky-500/25 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="spec">Development Spec</option>
                    <option value="prompt">AI Prompt</option>
                    <option value="idea">Idea</option>
                    <option value="template">Template</option>
                  </select>

                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    className="bg-[#050810] border border-sky-500/25 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="">No Project Linked</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="Tags separated by commas (e.g. React, Architecture, Security)..."
                  className="w-full bg-[#050810] border border-sky-500/25 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={12}
                  placeholder="Write draft content in markdown or plain text..."
                  className="w-full bg-[#050810] border border-sky-500/25 rounded-xl p-4 text-xs text-slate-200 focus:outline-none font-mono leading-relaxed"
                />
              </div>
            </div>
          ) : activeDraft ? (
            /* View Mode */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-sky-500/15">
                <div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(activeDraft.type)}
                    <h3 className="text-base font-bold text-white">{activeDraft.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="capitalize">{activeDraft.type}</span>
                    <span>·</span>
                    <span>{new Date(activeDraft.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyContent}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700"
                    title="Copy Content"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleStartEdit(activeDraft)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700"
                    title="Edit Draft"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${activeDraft.title}"?`)) {
                        onDeleteDraft(activeDraft.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 border border-slate-700"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags & Project Link */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeDraft.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full bg-sky-500/15 text-cyan-300 border border-sky-500/25 text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {activeDraft.projectId && (
                  <button
                    onClick={() => onSelectProject(activeDraft.projectId!)}
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>View Linked Project</span>
                  </button>
                )}
              </div>

              {/* Markdown Content Area */}
              <div className="bg-[#050810] border border-sky-500/20 rounded-2xl p-5 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {activeDraft.content}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">No draft selected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
