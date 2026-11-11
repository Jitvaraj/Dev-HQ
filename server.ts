import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Initialize Gemini client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Chat endpoint using Gemini 3.8 Flash
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, projectContext, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    const systemInstruction = `You are JARVIS, an elite developer assistant embedded in DEV HQ.
You specialize in software architecture, clean code, debugging, modern web standards, TypeScript, React, and Google AI Studio workflows.
${projectContext ? `Current Active Project Context:\n- Project: ${projectContext.name}\n- Tech Stack: ${projectContext.techStack || 'TypeScript, React'}\n- Description: ${projectContext.description || ''}\n- Status: ${projectContext.status || 'Active'}\n` : ''}
Provide direct, concise, production-ready solutions, explanations, and code snippets. Keep responses developer-focused, well-formatted with markdown and syntax highlighting.`;

    const contents = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'No response generated.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Gemini Chat error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to process request with Gemini API',
    });
  }
});

// Project-Context Prompt Generator endpoint
app.post('/api/gemini/generate-prompt', async (req, res) => {
  try {
    const { project, category = 'architecture', extraInstructions = '' } = req.body;

    if (!project || !project.name) {
      return res.status(400).json({ error: 'Project data is required' });
    }

    const promptRequest = `Generate an optimized, high-yield system prompt and developer instructions for Google AI Studio or an LLM for the following project:
Project Name: ${project.name}
Description: ${project.description || 'N/A'}
Tech Stack: ${project.techStack || 'React, TypeScript'}
Current Status: ${project.status || 'In Progress'}
Target Goal: ${category}
User Custom Guidance: ${extraInstructions}

Format the response into:
1. Target System Instruction (to paste into Google AI Studio System Instructions)
2. Starter Test Prompts (3 bullet points)
3. Recommended Model & Configuration Settings (e.g. Gemini 3.8 Flash, thinking level, temperature)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptRequest,
      config: {
        systemInstruction: 'You are a prompt engineering specialist for Google AI Studio and developer tools.',
      },
    });

    return res.json({ prompt: response.text || '' });
  } catch (err: any) {
    console.error('Prompt Generator error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate prompt',
    });
  }
});

// Public GitHub Repo metadata fetch proxy
app.get('/api/github/repo', async (req, res) => {
  try {
    const { repo } = req.query; // format: owner/repo
    if (!repo || typeof repo !== 'string') {
      return res.status(400).json({ error: 'repo query param required (e.g. owner/repo)' });
    }

    const cleanRepo = repo.replace(/^(https?:\/\/github\.com\/)?/, '').replace(/\.git$/, '');
    const ghRes = await fetch(`https://api.github.com/repos/${cleanRepo}`, {
      headers: {
        'User-Agent': 'DEV-HQ-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!ghRes.ok) {
      return res.status(ghRes.status).json({ error: `GitHub API returned ${ghRes.status}` });
    }

    const data = await ghRes.json();
    return res.json({
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      language: data.language,
      defaultBranch: data.default_branch,
      htmlUrl: data.html_url,
      updatedAt: data.updated_at,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to fetch GitHub repo' });
  }
});

// Git status and repository health
app.get('/api/git/status', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const [statusRes, branchRes, logRes, remoteRes] = await Promise.all([
      execAsync('git status --porcelain').catch(() => ({ stdout: '' })),
      execAsync('git rev-parse --abbrev-ref HEAD').catch(() => ({ stdout: 'main' })),
      execAsync('git log -n 5 --pretty=format:"%h|%s|%cr"').catch(() => ({ stdout: '' })),
      execAsync('git remote get-url origin').catch(() => ({ stdout: 'https://github.com/Jitvaraj/Dev-HQ.git' })),
    ]);

    const commits = logRes.stdout
      ? logRes.stdout.trim().split('\n').map((line) => {
          const [hash, subject, time] = line.split('|');
          return { hash, subject, time };
        })
      : [];

    const changedFiles = statusRes.stdout
      ? statusRes.stdout.trim().split('\n').filter(Boolean)
      : [];

    return res.json({
      branch: branchRes.stdout.trim() || 'main',
      remote: remoteRes.stdout.trim() || 'https://github.com/Jitvaraj/Dev-HQ.git',
      targetRepo: 'Jitvaraj/Dev-HQ',
      isClean: changedFiles.length === 0,
      changedFilesCount: changedFiles.length,
      recentCommits: commits,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to check git status' });
  }
});

// Git Commit local changes
app.post('/api/git/commit', async (req, res) => {
  try {
    const { message = 'Update DEV HQ codebase' } = req.body;
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync('git add -A');
    const commitRes = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`).catch((e) => {
      if (e.stdout && e.stdout.includes('nothing to commit')) {
        return { stdout: 'Working tree clean, nothing to commit.' };
      }
      throw e;
    });

    return res.json({
      success: true,
      output: commitRes.stdout.trim(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to commit changes' });
  }
});

// Push commits directly to https://github.com/Jitvaraj/Dev-HQ using GitHub Personal Access Token
app.post('/api/git/push', async (req, res) => {
  const { token, branch = 'main', force = false } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      error: 'GitHub Personal Access Token is required to push to https://github.com/Jitvaraj/Dev-HQ. Create a fine-grained or classic token with "repo" / "contents:write" scope on GitHub.',
    });
  }

  const cleanToken = token.trim();
  const repoTarget = `https://${cleanToken}@github.com/Jitvaraj/Dev-HQ.git`;

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Commit any pending changes first
    await execAsync('git add -A').catch(() => {});
    await execAsync('git commit -m "DEV HQ — Full Source Codebase update"').catch(() => {});

    // Execute authenticated push
    const pushCmd = `git push ${force ? '--force' : ''} ${repoTarget} ${branch}`;
    const pushRes = await execAsync(pushCmd, { timeout: 30000 });

    const sanitizedOutput = (pushRes.stdout + '\n' + pushRes.stderr)
      .replace(new RegExp(cleanToken, 'g'), '***TOKEN***')
      .trim();

    return res.json({
      success: true,
      message: 'Successfully pushed DEV HQ to https://github.com/Jitvaraj/Dev-HQ!',
      output: sanitizedOutput,
      repoUrl: 'https://github.com/Jitvaraj/Dev-HQ',
    });
  } catch (err: any) {
    const rawError = (err?.stderr || err?.stdout || err?.message || 'Git push failed');
    const sanitized = rawError.replace(new RegExp(cleanToken, 'g'), '***TOKEN***');
    return res.status(500).json({
      error: sanitized,
      help: 'Ensure your GitHub token has "repo" (or "Contents: Read and write") permissions on repository Jitvaraj/Dev-HQ.',
    });
  }
});

// Export full project repository archive (.tar.gz)
app.get('/api/git/export', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', 'attachment; filename="Dev-HQ-complete-source.tar.gz"');

    const proc = exec('git archive --format=tar.gz HEAD');
    proc.stdout?.pipe(res);
    proc.stderr?.on('data', (data) => console.error('Git archive error:', data));
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create archive' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In dev, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DEV HQ server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
