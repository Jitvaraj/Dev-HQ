import React, { useState, useEffect } from 'react';
import {
  Lock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Maximize2,
  Minimize2,
  Coffee,
  Sparkles,
  FolderGit2,
  Clock,
  History,
} from 'lucide-react';
import { Project, LockInSession, LockInState } from '../../types/index.ts';
import { formatTimeDisplay, calculateSessionProgress } from '../../utils/workspaceLogic.ts';

interface LockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockInState: LockInState;
  onUpdateLockInState: React.Dispatch<React.SetStateAction<LockInState>>;
  projects: Project[];
  sessions: LockInSession[];
  onSaveSession: (session: LockInSession) => void;
}

export const LockInModal: React.FC<LockInModalProps> = ({
  isOpen,
  onClose,
  lockInState,
  onUpdateLockInState,
  projects,
  sessions,
  onSaveSession,
}) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'history'>('timer');

  // Timer Tick Effect
  useEffect(() => {
    let interval: any = null;
    if (lockInState.isActive && !lockInState.isPaused && lockInState.timeRemaining > 0) {
      interval = setInterval(() => {
        onUpdateLockInState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Completed!
            const proj = projects.find((p) => p.id === prev.selectedProjectId);
            onSaveSession({
              id: `sess-${Date.now()}`,
              projectId: prev.selectedProjectId,
              projectName: proj?.name || 'General Task',
              taskTitle: prev.currentTaskTitle || 'Focused Work Session',
              durationMinutes: Math.round(prev.totalDuration / 60),
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'completed',
            });
            return {
              ...prev,
              isActive: false,
              isPaused: false,
              timeRemaining: 0,
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockInState.isActive, lockInState.isPaused, lockInState.timeRemaining, onUpdateLockInState, projects, onSaveSession]);

  if (!isOpen) return null;

  const progress = calculateSessionProgress(lockInState.timeRemaining, lockInState.totalDuration);
  const selectedProj = projects.find((p) => p.id === lockInState.selectedProjectId) || projects[0];

  const handleStartTimer = () => {
    onUpdateLockInState((prev) => ({
      ...prev,
      isActive: true,
      isPaused: false,
    }));
  };

  const handlePauseTimer = () => {
    onUpdateLockInState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleResetTimer = (seconds: number = 1500, mode: LockInState['mode'] = 'pomodoro') => {
    onUpdateLockInState((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      isBreak: mode.includes('break'),
      mode,
      timeRemaining: seconds,
      totalDuration: seconds,
    }));
  };

  const handleToggleDistractionFree = () => {
    onUpdateLockInState((prev) => ({
      ...prev,
      distractionFree: !prev.distractionFree,
    }));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        lockInState.distractionFree
          ? 'bg-[#04070f] backdrop-blur-3xl'
          : 'bg-black/80 backdrop-blur-md'
      }`}
    >
      {/* Background Calming Ambient Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-cyan-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
      </div>

      <div
        className={`relative w-full ${
          lockInState.distractionFree ? 'max-w-4xl p-8' : 'max-w-xl p-6'
        } rounded-3xl bg-[#091122]/95 border border-sky-400/30 shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(56,189,248,0.25)] flex flex-col justify-between transition-all`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Lock In Mode</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {lockInState.isBreak ? 'Break Interval' : 'Deep Focus'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Zero distractions. Full cognitive throughput.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleDistractionFree}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors"
              title={lockInState.distractionFree ? 'Standard View' : 'Distraction-Free Zen View'}
            >
              {lockInState.distractionFree ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-rose-400 border border-slate-700/60 transition-colors"
              aria-label="Close Lock In"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-4 bg-[#060a14] p-1 rounded-xl border border-sky-500/15">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timer' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30' : 'text-slate-400'
            }`}
          >
            Focus Timer
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30' : 'text-slate-400'
            }`}
          >
            Session History ({sessions.length})
          </button>
        </div>

        {activeTab === 'timer' ? (
          /* Timer Body */
          <div className="space-y-6">
            {/* Project & Task Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Target Project
                </label>
                <select
                  value={lockInState.selectedProjectId}
                  onChange={(e) =>
                    onUpdateLockInState((prev) => ({ ...prev, selectedProjectId: e.target.value }))
                  }
                  className="w-full bg-[#060a14] border border-sky-500/20 text-xs text-cyan-300 rounded-xl px-3 py-2 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Current Single Focus Task
                </label>
                <input
                  type="text"
                  value={lockInState.currentTaskTitle}
                  onChange={(e) =>
                    onUpdateLockInState((prev) => ({ ...prev, currentTaskTitle: e.target.value }))
                  }
                  placeholder="What is your immediate goal?"
                  className="w-full bg-[#060a14] border border-sky-500/20 text-xs text-white rounded-xl px-3 py-2 focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            {/* Presets Row */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { label: 'Pomodoro 25m', seconds: 1500, mode: 'pomodoro' as const },
                { label: 'Deep Work 50m', seconds: 3000, mode: 'custom' as const },
                { label: 'Short Break 5m', seconds: 300, mode: 'short-break' as const },
                { label: 'Long Break 15m', seconds: 900, mode: 'long-break' as const },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleResetTimer(p.seconds, p.mode)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    lockInState.mode === p.mode && !lockInState.isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                      : 'bg-[#0c162b] text-slate-400 hover:text-slate-200 border border-sky-500/20'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Huge Clock Display */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                {formatTimeDisplay(lockInState.timeRemaining)}
              </div>

              {/* Circular / Linear Progress Bar */}
              <div className="w-full max-w-md h-2 rounded-full bg-slate-800 mt-6 overflow-hidden border border-sky-500/20">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between w-full max-w-md mt-2 text-[10px] text-slate-400 font-mono">
                <span>{progress}% Elapsed</span>
                <span>{formatTimeDisplay(lockInState.totalDuration)} Goal</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-4">
              {!lockInState.isActive ? (
                <button
                  onClick={handleStartTimer}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_30px_rgba(56,189,248,0.45)] active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Lock In</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all"
                >
                  <Pause className="w-4 h-4" />
                  <span>{lockInState.isPaused ? 'Resume Focus' : 'Pause Focus'}</span>
                </button>
              )}

              <button
                onClick={() => handleResetTimer(lockInState.totalDuration, lockInState.mode)}
                className="p-3.5 rounded-full bg-[#0c162b] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-sky-500/20 transition-all"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* History Body */
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-500">
                No focus sessions completed yet. Start a session to build your streak!
              </p>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-2xl bg-[#0c162b] border border-sky-500/15 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{sess.taskTitle}</div>
                    <div className="text-[10px] text-cyan-400 mt-0.5">{sess.projectName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-emerald-400 font-semibold">
                      +{sess.durationMinutes} mins
                    </div>
                    <div className="text-[10px] text-slate-500">{sess.completedAt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
