/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommit,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Download,
  X,
  Key,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface GitHubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitRepoStatus {
  branch: string;
  remote: string;
  targetRepo: string;
  isClean: boolean;
  changedFilesCount: number;
  recentCommits: Array<{ hash: string; subject: string; time: string }>;
}

export const GitHubPushModal: React.FC<GitHubPushModalProps> = ({ isOpen, onClose }) => {
  const [gitStatus, setGitStatus] = useState<GitRepoStatus | null>(null);
  const [token, setToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; output?: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const fetchGitStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/git/status');
      if (res.ok) {
        const data = await res.json();
        setGitStatus(data);
      }
    } catch (err) {
      console.error('Failed to get git status', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGitStatus();
    }
  }, [isOpen]);

  const handlePush = async () => {
    if (!token.trim()) return;

    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          branch: 'main',
          force: false,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPushResult({
          success: true,
          message: data.message || 'Successfully pushed all work to https://github.com/Jitvaraj/Dev-HQ!',
          output: data.output,
        });
        fetchGitStatus();
      } else {
        setPushResult({
          success: false,
          message: data.error || 'Push failed. Please check your token permissions.',
          output: data.help,
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: err?.message || 'Network error while pushing to GitHub',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const manualCmd = `git remote set-url origin https://${token ? '<YOUR_TOKEN>' : '<TOKEN>'}@github.com/Jitvaraj/Dev-HQ.git\ngit push -u origin main`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(manualCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#091122]/95 border border-sky-400/30 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.2)] text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Push All Work to Jitvaraj/Dev-HQ</h2>
              <p className="text-xs text-slate-400">
                Deploy the complete DEV HQ workspace codebase directly to your remote repository.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Repository Target Card */}
        <div className="p-4 rounded-2xl bg-[#0c162b] border border-sky-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Remote Target:</span>
              <a
                href="https://github.com/Jitvaraj/Dev-HQ"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>https://github.com/Jitvaraj/Dev-HQ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-slate-400 flex items-center gap-3">
              <span>Branch: <span className="text-emerald-400 font-mono font-semibold">main</span></span>
              <span>•</span>
              <span>Pending files: <span className="text-cyan-400 font-mono font-semibold">{gitStatus?.changedFilesCount || 0}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="/api/git/export"
              download="Dev-HQ-complete-source.tar.gz"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all text-xs"
              title="Download entire project source archive"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download Archive</span>
            </a>
            <button
              onClick={fetchGitStatus}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Refresh git status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Push Form with Token */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-sky-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1-Click Push via GitHub Access Token
              </h3>
            </div>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Get Token on GitHub</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <p className="text-xs text-slate-400">
            Because this application runs in an isolated container without a terminal prompt, pushing over HTTPS requires a Personal Access Token with <code className="text-cyan-300">repo</code> (or <code className="text-cyan-300">contents:write</code>) permission.
          </p>

          <div className="space-y-3 pt-1">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste GitHub Personal Access Token (ghp_...)"
              className="w-full bg-[#050810] border border-sky-500/25 focus:border-sky-400/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
            />

            <button
              onClick={handlePush}
              disabled={isPushing || !token.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95"
            >
              <UploadCloud className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
              <span>{isPushing ? 'Pushing Commits to GitHub...' : 'Push All Work to Jitvaraj/Dev-HQ Now 🚀'}</span>
            </button>
          </div>
        </div>

        {/* Push Result Banner */}
        {pushResult && (
          <div
            className={`p-4 rounded-2xl flex flex-col gap-2 text-xs font-medium animate-in fade-in ${
              pushResult.success
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {pushResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="font-bold text-sm">{pushResult.message}</span>
            </div>
            {pushResult.output && (
              <pre className="p-2.5 rounded-xl bg-black/40 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto text-slate-300 border border-slate-800">
                {pushResult.output}
              </pre>
            )}
            {pushResult.success && (
              <a
                href="https://github.com/Jitvaraj/Dev-HQ"
                target="_blank"
                rel="noreferrer"
                className="self-start mt-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold flex items-center gap-1.5 text-xs border border-emerald-500/40"
              >
                <span>View Pushed Repository on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Recent Local Commits */}
        {gitStatus?.recentCommits && gitStatus.recentCommits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Local Commits Ready in main</span>
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {gitStatus.recentCommits.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#0c162b] border border-sky-500/15 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-cyan-400 font-bold">{c.hash}</span>
                    <span className="text-slate-300 truncate">{c.subject}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">{c.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Terminal Commands */}
        <div className="p-3.5 rounded-2xl bg-[#050810] border border-sky-500/15 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Or push manually via Terminal / CLI:</span>
            <button
              onClick={handleCopyCmd}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCmd ? 'Copied!' : 'Copy Commands'}</span>
            </button>
          </div>
          <pre className="p-2.5 rounded-xl bg-[#091122] text-[11px] font-mono text-cyan-300/90 overflow-x-auto whitespace-pre">
            {manualCmd}
          </pre>
        </div>
      </div>
    </div>
  );
};
