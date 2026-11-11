/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// In-memory token cache (strictly adhering to memory-only token rule)
let inMemoryAccessToken: string | null = null;

export function getCachedGoogleToken(): string | null {
  return inMemoryAccessToken;
}

export function setCachedGoogleToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasDriveAccess: boolean;
}

/**
 * Sign in user with Google and request Google Drive file scope.
 * The access token is stored ONLY in memory and never persisted.
 */
export async function signInWithGoogleDrive(): Promise<{ user: User; accessToken: string }> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  if (!accessToken) {
    throw new Error('Google sign-in succeeded, but no Google Drive access token was returned.');
  }

  inMemoryAccessToken = accessToken;
  return { user: result.user, accessToken };
}

/**
 * Sign out user from Google and clear in-memory token
 */
export async function signOutGoogle(): Promise<void> {
  inMemoryAccessToken = null;
  await firebaseSignOut(auth);
}

/**
 * Subscribe to Firebase auth state changes
 */
export function onGoogleAuthStateChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      inMemoryAccessToken = null;
    }
    callback(user);
  });
}

/**
 * Search Google Drive for existing DEV HQ backups created by this application
 */
export async function listDriveBackups(token?: string): Promise<GoogleDriveFile[]> {
  const authToken = token || inMemoryAccessToken;
  if (!authToken) {
    throw new Error('Google Drive access token is required. Please sign in with your Google account.');
  }

  const query = encodeURIComponent("name contains 'DEV_HQ_Workspace' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to fetch Google Drive files (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Upload workspace backup JSON directly to Google Drive via multipart upload
 */
export async function uploadBackupToDrive(
  backupData: Record<string, unknown>,
  customName?: string,
  token?: string
): Promise<GoogleDriveFile> {
  const authToken = token || inMemoryAccessToken;
  if (!authToken) {
    throw new Error('Google Drive access token is required. Please sign in with your Google account.');
  }

  const fileName = customName || `DEV_HQ_Workspace_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  const boundary = '-------devhq_boundary_' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'DEV HQ developer workspace state backup (projects, drafts, settings, and lock-in history)',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(backupData, null, 2) +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to upload backup to Google Drive (${response.status})`);
  }

  return await response.json();
}

/**
 * Download and parse a backup file content from Google Drive
 */
export async function downloadBackupFromDrive(fileId: string, token?: string): Promise<any> {
  const authToken = token || inMemoryAccessToken;
  if (!authToken) {
    throw new Error('Google Drive access token is required. Please sign in with your Google account.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to download file from Google Drive (${response.status})`);
  }

  return await response.json();
}

/**
 * Delete a backup file from Google Drive with explicit user confirmation
 */
export async function deleteBackupFromDrive(fileId: string, token?: string): Promise<boolean> {
  const authToken = token || inMemoryAccessToken;
  if (!authToken) {
    throw new Error('Google Drive access token is required. Please sign in with your Google account.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to delete file from Google Drive (${response.status})`);
  }

  return true;
}
