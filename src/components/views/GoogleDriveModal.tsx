/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  CloudUpload,
  CloudDownload,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Shield,
  FileJson,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  signInWithGoogleDrive,
  signOutGoogle,
  onGoogleAuthStateChanged,
  listDriveBackups,
  uploadBackupToDrive,
  downloadBackupFromDrive,
  deleteBackupFromDrive,
  GoogleDriveFile,
  getCachedGoogleToken,
} from '../../services/googleDrive.ts';
import { Project, Draft, LockInSession, UserSettings } from '../../types/index.ts';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChanged: (user: User | null) => void;
  projects: Project[];
  drafts: Draft[];
  sessions: LockInSession[];
  settings: UserSettings;
  onRestoreWorkspace: (data: { projects: Project[]; drafts: Draft[]; settings?: UserSettings }) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  projects,
  drafts,
  sessions,
  settings,
  onRestoreWorkspace,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [backups, setBackups] = useState<GoogleDriveFile[]>([]);
  const [customBackupName, setCustomBackupName] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = onGoogleAuthStateChanged((user) => {
      onUserChanged(user);
      if (user && getCachedGoogleToken()) {
        fetchBackups();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchBackups = async () => {
    if (!getCachedGoogleToken()) return;
    setIsLoading(true);
    try {
      const files = await listDriveBackups();
      setBackups(files);
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to list Google Drive files', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const { user } = await signInWithGoogleDrive();
      onUserChanged(user);
      setStatusMessage({ text: `Signed in as ${user.displayName || user.email}. Google Drive connected!`, type: 'success' });
      await fetchBackups();
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to authenticate with Google Drive', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutGoogle();
      onUserChanged(null);
      setBackups([]);
      setStatusMessage({ text: 'Signed out from Google Account', type: 'info' });
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to sign out', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupNow = async () => {
    if (!getCachedGoogleToken()) {
      setStatusMessage({ text: 'Please sign in with Google first to access your Google Drive.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const backupPayload = {
        app: 'DEV HQ',
        version: '1.0.0',
        backedUpAt: new Date().toISOString(),
        userEmail: currentUser?.email || settings.userEmail,
        settings,
        projects,
        drafts,
        sessions,
      };

      const name = customBackupName.trim()
        ? (customBackupName.endsWith('.json') ? customBackupName : `${customBackupName}.json`)
        : `DEV_HQ_Workspace_Backup_${new Date().toISOString().slice(0, 10)}.json`;

      const result = await uploadBackupToDrive(backupPayload, name);
      setStatusMessage({ text: `Backup "${result.name}" saved directly to your Google Drive!`, type: 'success' });
      setCustomBackupName('');
      await fetchBackups();
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to upload backup to Google Drive', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (file: GoogleDriveFile) => {
    if (!confirm(`Restore DEV HQ workspace from "${file.name}"? This will sync all projects and drafts.`)) {
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await downloadBackupFromDrive(file.id);
      if (data && Array.isArray(data.projects) && Array.isArray(data.drafts)) {
        onRestoreWorkspace({
          projects: data.projects,
          drafts: data.drafts,
          settings: data.settings,
        });
        setStatusMessage({ text: `Successfully restored workspace from "${file.name}"!`, type: 'success' });
      } else {
        throw new Error('Downloaded file has an invalid DEV HQ backup structure.');
      }
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to restore backup from Drive', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBackup = async (fileId: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await deleteBackupFromDrive(fileId);
      setIsConfirmingDelete(null);
      setStatusMessage({ text: 'Backup file permanently deleted from Google Drive.', type: 'info' });
      await fetchBackups();
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to delete file from Google Drive', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#091122]/95 border border-sky-400/30 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.2)] text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Personal Google Drive Workspace Sync</h2>
              <p className="text-xs text-slate-400">
                Connect your personal Google Account to back up and restore your DEV HQ workspace.
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

        {/* User Account Status Box */}
        <div className="p-4 rounded-2xl bg-[#0c162b] border border-sky-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Google User'}
                className="w-11 h-11 rounded-full border border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)] object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm border border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {currentUser ? currentUser.displayName || 'Google Account' : 'Guest Developer (Not signed in)'}
                </span>
                {currentUser && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Drive Authorized
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {currentUser ? currentUser.email : 'Sign in to access your personal Google Drive'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 border border-slate-700 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all active:scale-95"
              >
                {/* Google "G" icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#ffffff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#ffffff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Message Toast / Banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                : 'bg-sky-950/40 border border-sky-500/30 text-sky-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Save to Drive Card */}
        <div className="p-4 rounded-2xl bg-[#091122] border border-sky-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudUpload className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Create Google Drive Snapshot
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Includes {projects.length} projects, {drafts.length} drafts
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              value={customBackupName}
              onChange={(e) => setCustomBackupName(e.target.value)}
              placeholder="Backup file name (e.g. DEV_HQ_Workspace_v1)"
              className="flex-1 w-full bg-[#050810] border border-sky-500/20 focus:border-sky-400/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
            />
            <button
              onClick={handleBackupNow}
              disabled={isLoading || !currentUser}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Save to My Drive</span>
            </button>
          </div>
        </div>

        {/* Backups List on Google Drive */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Backups on Google Drive ({backups.length})
              </h3>
            </div>
            {currentUser && (
              <button
                onClick={fetchBackups}
                disabled={isLoading}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
          </div>

          {!currentUser ? (
            <div className="p-6 rounded-2xl bg-[#060a15] border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">
                Sign in with your Google account above to see and restore your personal DEV HQ backups from Google Drive.
              </p>
            </div>
          ) : backups.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#060a15] border border-slate-800 text-center space-y-2">
              <FileJson className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                No DEV HQ backups found on your Google Drive yet. Click "Save to My Drive" above to create your first snapshot.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {backups.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-2xl bg-[#0c162b] border border-sky-500/20 hover:border-sky-400/40 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                      <FileJson className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-white truncate font-mono text-xs">{file.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : 'Recent'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRestoreBackup(file)}
                      disabled={isLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold transition-all"
                      title="Restore workspace from this backup"
                    >
                      <CloudDownload className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>

                    {isConfirmingDelete === file.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in">
                        <button
                          onClick={() => handleDeleteBackup(file.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-500 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setIsConfirmingDelete(null)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsConfirmingDelete(file.id)}
                        className="p-1.5 rounded-xl hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete from Google Drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security / Privacy Footnote */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Uses official Google Drive API (<code className="text-cyan-300">drive.file</code> scope). DEV HQ only accesses files it created. Access tokens remain in-memory and are never stored on any server.
          </span>
        </div>
      </div>
    </div>
  );
};
