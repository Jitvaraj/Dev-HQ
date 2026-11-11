import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Code2,
  FolderGit2,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { Project, WorkspaceTabType, PromptHistoryItem } from '../../types/index.ts';

interface AIViewProps {
  projects: Project[];
  activeProjectId?: string;
  onNavigate: (type: WorkspaceTabType) => void;
  promptHistory: PromptHistoryItem[];
  onSavePromptHistory: (item: PromptHistoryItem) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIView: React.FC<AIViewProps> = ({
  projects,
  activeProjectId,
  onNavigate,
  promptHistory,
  onSavePromptHistory,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || projects[0]?.id || ''
  );
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `Hello! I am JARVIS, your development assistant in DEV HQ powered by Gemini 3.8 Flash.
I can help you with:
- Architectural planning and system blueprints
- Code synthesis, TypeScript refactoring, and debugging
- API contracts and documentation
- Generating tailored system prompts for Google AI Studio

Which project are we accelerating today?`,
      timestamp: 'Just now',
    },
  ]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      const historyForApi = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: historyForApi,
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
      const reply = data.reply || 'No response returned from assistant.';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save to prompt history
      onSavePromptHistory({
        id: `ph-${Date.now()}`,
        title: prompt.slice(0, 40) + '...',
        prompt,
        response: reply,
        category: 'chat',
        projectId: selectedProjectId,
        timestamp: new Date().toLocaleDateString(),
      });
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `Error communicating with Gemini: ${err?.message}`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Top Header & Shortcuts Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">AI Development Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Gemini 3.8 Flash copilot with contextual project grounding.
          </p>
        </div>

        {/* External AI Shortcuts (Matches Req #8) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('aistudio')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0d1628] hover:bg-[#111e38] border border-sky-400/30 text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
          >
            <span>Google AI Studio</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </button>

          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0d1628] hover:bg-[#111e38] border border-sky-500/20 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <span>ChatGPT</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main Chat & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-8 rounded-3xl border border-sky-400/25 bg-[#091122]/90 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col h-[600px]">
          {/* Project Grounding Selector Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-500/15">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-300 font-medium">Grounding Context:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-[#0c162b] border border-sky-500/20 text-xs text-cyan-300 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.techStack})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: `m-reset-${Date.now()}`,
                    role: 'assistant',
                    content: 'Chat session reset. How can I help with your project?',
                    timestamp: 'Just now',
                  },
                ])
              }
              className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'bg-[#0c162b]/90 border border-sky-500/20 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-cyan-300 transition-opacity flex items-center gap-1"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-300 shrink-0 border border-sky-500/30">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>JARVIS is thinking with Gemini 3.8 Flash...</span>
              </div>
            )}
          </div>

          {/* Prompt Input Box */}
          <div className="pt-3 border-t border-sky-500/15">
            <div className="relative">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask JARVIS anything about ${selectedProject?.name || 'your project'}...`}
                className="w-full bg-[#070b16] border border-sky-500/25 focus:border-sky-400/50 rounded-2xl pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isGenerating || !inputPrompt.trim()}
                className="absolute right-2 top-2 p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white disabled:opacity-40 shadow-[0_0_10px_rgba(56,189,248,0.3)] transition-all"
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Context Prompts & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Context Generator */}
          <div className="p-5 rounded-3xl bg-[#091122]/90 border border-sky-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Instant Prompt Starters
              </h3>
            </div>
            <div className="space-y-1.5">
              {[
                { title: 'System Architecture Review', prompt: 'Perform a comprehensive architectural review of this project. Suggest decoupling points and resilience improvements.' },
                { title: 'API Contract & Schema', prompt: 'Generate strict TypeScript interfaces and validation schemas for the core entities in this project.' },
                { title: 'Unit Test Strategy', prompt: 'Write an end-to-end unit test suite plan using node:test for the critical business logic.' },
                { title: 'Refactor for Mobile', prompt: 'Audit this stack for a Samsung Galaxy A07 (4 GB RAM, Android). Suggest memory-efficient DOM practices.' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputPrompt(p.prompt);
                    handleSendMessage(p.prompt);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-[#0c162b]/80 hover:bg-[#101e3d] border border-sky-500/15 hover:border-sky-400/40 text-xs text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between"
                >
                  <span className="truncate">{p.title}</span>
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Vault History */}
          <div className="p-5 rounded-3xl bg-[#091122]/90 border border-sky-500/20 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Prompt Vault
            </h3>
            {promptHistory.length === 0 ? (
              <p className="text-xs text-slate-500">No prompt history yet. Queries will be saved automatically.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {promptHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInputPrompt(item.prompt);
                    }}
                    className="p-2.5 rounded-xl bg-[#0c162b] border border-sky-500/15 text-xs text-slate-300 hover:text-cyan-300 hover:border-sky-500/35 cursor-pointer transition-all"
                  >
                    <div className="font-semibold truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
