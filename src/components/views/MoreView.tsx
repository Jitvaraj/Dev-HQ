import React, { useState } from 'react';
import {
  Settings,
  Puzzle,
  FolderOpen,
  FileCode2,
  Database,
  Info,
  CheckCircle2,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Code2,
  Sparkles,
  HardDrive,
} from 'lucide-react';
import { UserSettings, Project, Draft, LockInSession } from '../../types/index.ts';

interface MoreViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  projects: Project[];
  drafts: Draft[];
  sessions: LockInSession[];
  onImportAllData: (data: { projects: Project[]; drafts: Draft[]; settings: UserSettings }) => void;
  onResetDemoData: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenGitHubPush?: () => void;
  isGoogleConnected?: boolean;
  currentUserEmail?: string;
}

export const MoreView: React.FC<MoreViewProps> = ({
  settings,
  onUpdateSettings,
  projects,
  drafts,
  sessions,
  onImportAllData,
  onResetDemoData,
  onOpenGoogleDrive,
  onOpenGitHubPush,
  isGoogleConnected = false,
  currentUserEmail = '',
}) => {
  const [activeSection, setActiveSection] = useState<
    'settings' | 'integrations' | 'files' | 'templates' | 'backups' | 'extensions' | 'about'
  >('settings');

  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportData = () => {
    const backupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      projects,
      drafts,
      sessions,
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhq-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.projects && parsed.drafts) {
          onImportAllData({
            projects: parsed.projects,
            drafts: parsed.drafts,
            settings: parsed.settings || settings,
          });
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const sections = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'files', label: 'File Manager', icon: FolderOpen },
    { id: 'templates', label: 'Templates', icon: FileCode2 },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'extensions', label: 'Extensions', icon: Sparkles },
    { id: 'about', label: 'About DEV HQ', icon: Info },
  ] as const;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-3 border-b border-sky-500/15">
        <h2 className="text-xl font-extrabold text-white tracking-tight">System Modules & Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure DEV HQ workspace preferences, integrations, storage backups, and extensions.
        </p>
      </div>

      {/* Grid: Navigation Sidebar & Content Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module Selector List */}
        <div className="lg:col-span-4 space-y-1.5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-transparent text-cyan-300 border border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#091122]/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-8 rounded-3xl border border-sky-400/25 bg-[#091122]/90 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] min-h-[450px]">
          {/* Section 1: Settings */}
          {activeSection === 'settings' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-sky-500/15">
                <div>
                  <h3 className="text-sm font-bold text-white">Developer Profile & Workspace Settings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Personalize identity and focus parameters.</p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                >
                  {saveSuccess ? 'Saved!' : 'Save Settings'}
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Developer Handle / Name</label>
                  <input
                    type="text"
                    value={localSettings.userName}
                    onChange={(e) => setLocalSettings({ ...localSettings, userName: e.target.value })}
                    className="w-full bg-[#050810] border border-sky-500/20 rounded-xl px-4 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Google Account Email</label>
                  <input
                    type="email"
                    value={localSettings.userEmail}
                    onChange={(e) => setLocalSettings({ ...localSettings, userEmail: e.target.value })}
                    className="w-full bg-[#050810] border border-sky-500/20 rounded-xl px-4 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={localSettings.title}
                    onChange={(e) => setLocalSettings({ ...localSettings, title: e.target.value })}
                    className="w-full bg-[#050810] border border-sky-500/20 rounded-xl px-4 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Default Focus Duration (Minutes)</label>
                  <input
                    type="number"
                    value={localSettings.defaultFocusDuration}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, defaultFocusDuration: parseInt(e.target.value) || 25 })
                    }
                    className="w-full bg-[#050810] border border-sky-500/20 rounded-xl px-4 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-300">Keyboard Shortcuts (Ctrl+K omnibar)</span>
                  <input
                    type="checkbox"
                    checked={localSettings.shortcutsEnabled}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, shortcutsEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Integrations */}
          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Connected Platforms & APIs</h3>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#0c162b] border border-sky-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center p-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Google AI Studio</div>
                      <div className="text-[11px] text-slate-400">Project Context Sync & Deep Launch</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Connected
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0c162b] border border-sky-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center p-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Gemini 3.8 Flash (Server-Side)</div>
                      <div className="text-[11px] text-slate-400">Real-time code generation and prompt crafting</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0c162b] border border-sky-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center p-1.5">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Google Drive Workspace Sync</div>
                      <div className="text-[11px] text-slate-400">
                        {isGoogleConnected ? `Connected as ${currentUserEmail || 'Google User'}` : 'Back up projects & drafts to private Drive'}
                      </div>
                    </div>
                  </div>
                  {onOpenGoogleDrive && (
                    <button
                      onClick={onOpenGoogleDrive}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        isGoogleConnected
                          ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30 hover:bg-cyan-500/25'
                      }`}
                    >
                      {isGoogleConnected ? 'Manage Drive' : 'Connect'}
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#0c162b] border border-sky-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center p-1.5">
                      <Code2 className="w-4 h-4 text-slate-200" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">GitHub (Jitvaraj/Dev-HQ)</div>
                      <div className="text-[11px] text-slate-400">Remote repository push & live commit explorer</div>
                    </div>
                  </div>
                  {onOpenGitHubPush && (
                    <button
                      onClick={onOpenGitHubPush}
                      className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-full hover:bg-cyan-500/25 transition-all"
                    >
                      Push Codebase
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: File Manager */}
          {activeSection === 'files' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Workspace File System</h3>
              <p className="text-xs text-slate-400">
                Local IndexedDB persistent cache footprint for projects and drafts.
              </p>

              <div className="p-4 rounded-2xl bg-[#050810] border border-sky-500/20 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>/devhq/projects/</span>
                  <span className="text-cyan-400">{projects.length} files</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>/devhq/drafts/</span>
                  <span className="text-cyan-400">{drafts.length} files</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>/devhq/sessions/</span>
                  <span className="text-cyan-400">{sessions.length} records</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Local Storage Mode:</span>
                  <span className="text-emerald-400 font-sans font-semibold">IndexedDB Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Templates */}
          {activeSection === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Starter Project Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'React 19 + Tailwind v4 SPA', stack: 'React 19, TypeScript, Tailwind' },
                  { name: 'Full-Stack Express + Node', stack: 'Express, tsx, Node.js, REST API' },
                  { name: 'Gemini Autonomous Agent', stack: 'Gemini 3.8 Flash, TypeScript' },
                  { name: 'Offline-First Touch PWA', stack: 'Service Worker, IndexedDB, Touch' },
                ].map((tpl) => (
                  <div key={tpl.name} className="p-3.5 rounded-2xl bg-[#0c162b] border border-sky-500/20">
                    <div className="text-xs font-bold text-white">{tpl.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{tpl.stack}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Backups */}
          {activeSection === 'backups' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Data Portability & Backups</h3>
              <p className="text-xs text-slate-400">
                Safeguard your projects, drafts, and focus history with personal Google Drive cloud snapshots and single-click JSON export/import.
              </p>

              {/* Personal Google Drive Sync Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d172e] via-[#0b1326] to-[#070b16] border border-sky-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">Google Drive Cloud Synchronization</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isGoogleConnected
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isGoogleConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Back up DEV HQ snapshots directly into your personal Google Drive account. Each visitor gets their own private backups.
                  </p>
                </div>

                {onOpenGoogleDrive && (
                  <button
                    onClick={onOpenGoogleDrive}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] shrink-0"
                  >
                    {isGoogleConnected ? 'Manage Drive Backups' : 'Connect Google Drive'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#0c162b] hover:bg-[#111e38] border border-sky-500/20 hover:border-sky-400/40 text-xs font-bold text-cyan-300 transition-all shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Export DEV HQ Backup (.json)</span>
                </button>

                <label className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#0c162b] hover:bg-[#111e38] border border-sky-500/20 hover:border-sky-400/40 text-xs font-bold text-slate-200 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Import Backup JSON</span>
                  <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (confirm('Reset all projects and drafts back to default seed state?')) {
                      onResetDemoData();
                    }
                  }}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Workspace Data to Demo Defaults</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 6: Extensions */}
          {activeSection === 'extensions' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">DEV HQ Workspace Extensions</h3>
              <div className="space-y-3">
                {[
                  { name: 'Google AI Studio Deep Linker', desc: 'Auto-formats project context and copies to clipboard.', active: true },
                  { name: 'Lock In Ambient White Noise', desc: 'Calming auditory frequency generator during deep work.', active: true },
                  { name: 'GitHub Read-Only Monitor', desc: 'Pulls commit logs and branch status without tokens.', active: true },
                ].map((ext) => (
                  <div
                    key={ext.name}
                    className="p-3.5 rounded-2xl bg-[#0c162b] border border-sky-500/15 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{ext.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ext.desc}</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                      Installed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: About DEV HQ */}
          {activeSection === 'about' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">DEV HQ</h3>
                  <p className="text-xs text-cyan-400 font-medium">Build. Develop. Innovate.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#050810] border border-sky-500/20 text-xs text-slate-300 leading-relaxed space-y-2">
                <p>
                  DEV HQ is a personal development operating workspace that combines a browser-style interface, project management, AI tools, GitHub access, and productivity features.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div>Version: <span className="text-white font-mono">1.0.0</span></div>
                  <div>Target Profile: <span className="text-white">Samsung Galaxy A07, 4 GB RAM, Android & Desktop</span></div>
                  <div>Storage Engine: <span className="text-emerald-400">IndexedDB + LocalStorage Sync</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
