import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  FolderGit2,
  Send,
  Play,
  Info,
  CheckCircle2,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { Project } from '../../types/index.ts';
import { formatGoogleAIStudioExport } from '../../utils/workspaceLogic.ts';

interface GoogleAIStudioWorkspaceProps {
  projects: Project[];
  activeProjectId?: string;
  userEmail?: string;
  userName?: string;
}

export const GoogleAIStudioWorkspace: React.FC<GoogleAIStudioWorkspaceProps> = ({
  projects,
  activeProjectId,
  userEmail = '',
  userName = 'Developer',
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || projects[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Build a clean TypeScript debounce hook with cancellation support.');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'architecture' | 'code' | 'debug' | 'docs'>('code');

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleCopyContext = () => {
    if (!selectedProject) return;
    const exportText = formatGoogleAIStudioExport(selectedProject);
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenOfficialStudio = () => {
    if (selectedProject) {
      handleCopyContext();
    }
    window.open('https://aistudio.google.com/prompts/new_chat', '_blank', 'noopener,noreferrer');
  };

  const handleRunPlaygroundTest = async () => {
    if (!testPrompt.trim() || isTesting) return;
    setIsTesting(true);
    setTestResponse('');

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testPrompt,
          projectContext: selectedProject
            ? {
                name: selectedProject.name,
                techStack: selectedProject.techStack,
                description: selectedProject.description,
                status: selectedProject.status,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResponse(data.reply);
      } else {
        setTestResponse(`API Error: ${data.error || 'Failed to execute query'}`);
      }
    } catch (err: any) {
      setTestResponse(`Network Error: ${err?.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Workspace Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c162b] via-[#091122] to-[#060a16] border border-sky-400/25 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_25px_rgba(56,189,248,0.12)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-sky-400/30 flex items-center justify-center p-2.5 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              {/* Google G Logo */}
              <svg className="w-full h-full" viewBox="0 0 24 24">
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
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Google AI Studio Integration
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {userEmail ? 'Account Connected' : 'Google Bridge Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {userEmail ? (
                  <>Active Google Account: <span className="text-cyan-300 font-semibold">{userEmail}</span></>
                ) : (
                  <>Workspace context generator and live Gemini prompt synthesis ready</>
                )}
              </p>
            </div>
          </div>

          {/* Quick Launch Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenOfficialStudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-[0_0_25px_rgba(56,189,248,0.35)] active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Official AI Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Embedding Transparency Card (Fulfills Req #7) */}
      <div className="p-4 rounded-2xl bg-[#0b1325]/80 border border-sky-500/20 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white">Browser Security & Embedding Policy: </span>
          Google AI Studio officially blocks iframe embedding using{' '}
          <code className="text-cyan-300 font-mono text-[11px] bg-slate-900 px-1 py-0.5 rounded">
            X-Frame-Options: SAMEORIGIN
          </code>{' '}
          to safeguard your Google account authentication and credentials. DEV HQ provides the closest reliable
          integrated experience: 1-click workspace synchronization, automated project system instructions formatting,
          and a direct Gemini 3.8 Flash playground inside your workspace tab.
        </div>
      </div>

      {/* Main Grid: Project Context Synchronization & In-Tab Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Project Context Configurator */}
        <div className="lg:col-span-6 rounded-3xl border border-sky-400/25 bg-[#091122]/90 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Select Project for AI Studio</h3>
            </div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#0c162b] border border-sky-500/20 text-xs text-cyan-300 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Export Preview (Ready for AI Studio)</span>
                <button
                  onClick={handleCopyContext}
                  className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy System Instructions'}</span>
                </button>
              </div>

              <div className="bg-[#050810] border border-sky-500/20 rounded-2xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                {formatGoogleAIStudioExport(selectedProject)}
              </div>

              <div className="p-3 rounded-xl bg-[#0c162b] border border-sky-500/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Recommended Model:</span>
                  <span className="font-mono text-cyan-300 font-bold">gemini-3.8-flash</span>
                </div>
                <button
                  onClick={handleOpenOfficialStudio}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>Sync & Open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: In-Tab Gemini Playground */}
        <div className="lg:col-span-6 rounded-3xl border border-sky-400/25 bg-[#091122]/90 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">In-Workspace Gemini Playground</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-cyan-300 border border-sky-500/30">
                Gemini 3.8 Flash
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Test your instructions and queries with live Gemini generation without leaving DEV HQ.
            </p>

            {/* Playground Input Area */}
            <div className="space-y-3">
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter prompt or test query for this project..."
                rows={3}
                className="w-full bg-[#050810] border border-sky-500/25 focus:border-sky-400/50 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>Context:</span>
                  <span className="text-cyan-300 font-semibold">{selectedProject?.name}</span>
                </div>

                <button
                  onClick={handleRunPlaygroundTest}
                  disabled={isTesting || !testPrompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold disabled:opacity-40 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                >
                  <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Running...' : 'Run Prompt'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test Response Output */}
          {testResponse && (
            <div className="mt-4 p-4 rounded-2xl bg-[#050810] border border-sky-500/25 max-h-60 overflow-y-auto font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-2 pb-1 border-b border-slate-800">
                <span>Output Response</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(testResponse);
                  }}
                  className="hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              {testResponse}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
