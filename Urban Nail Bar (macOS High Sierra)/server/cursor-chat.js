'use strict';

/**
 * In-app salon AI via Cursor SDK (optional).
 * Not required to run the salon. On Node 14 / Sierra the SDK is omitted from package.json;
 * callers fall back to local FAQ when CURSOR_API_KEY / SDK are unavailable.
 */

const fs = require('fs');
const path = require('path');

const CWD = path.join(__dirname, 'cursor-chat-cwd');
if (!fs.existsSync(CWD)) {
  fs.mkdirSync(CWD, { recursive: true });
}

function getApiKey() {
  return String(process.env.CURSOR_API_KEY || '').trim();
}

function getModelId() {
  return String(process.env.CURSOR_MODEL || 'composer-2.5-fast').trim();
}

function loadAgent() {
  try {
    return require('@cursor/sdk').Agent;
  } catch (e) {
    const err = new Error(
      '@cursor/sdk not available (install it, and use Node 22.13+). ' + (e && e.message ? e.message : '')
    );
    err.code = 'NO_SDK';
    throw err;
  }
}

function buildPrompt(messages) {
  const lines = [
    'CRITICAL RULES: Reply with assistant text only.',
    'Do NOT call tools, edit files, run shell commands, or explore the workspace.',
    'You are the Urban Nail Bar in-app AI assistant.',
    ''
  ];
  for (const m of messages || []) {
    const role = String((m && m.role) || 'user').toUpperCase();
    lines.push(role + ': ' + String((m && m.content) || ''));
  }
  lines.push('', 'ASSISTANT:');
  return lines.join('\n');
}

/**
 * @param {{ messages: Array<{role:string,content:string}> }} opts
 * @returns {Promise<{ choices: Array<{ message: { role: string, content: string } }>, model: string, provider: string }>}
 */
async function chatCompletions(opts) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error('CURSOR_API_KEY not configured');
    err.code = 'NO_KEY';
    throw err;
  }

  const Agent = loadAgent();
  const modelId = getModelId();
  const prompt = buildPrompt(opts && opts.messages);

  const baseOpts = {
    apiKey,
    model: { id: modelId },
    local: { cwd: CWD }
  };

  let result;
  try {
    result = await Agent.prompt(prompt, {
      ...baseOpts,
      local: { cwd: CWD, sandboxOptions: { enabled: true } }
    });
  } catch (sandboxErr) {
    // Windows hosts may lack sandbox helpers — retry without sandbox.
    result = await Agent.prompt(prompt, baseOpts);
  }

  if (!result || result.status !== 'finished' || !result.result) {
    const msg =
      (result && result.error && result.error.message) ||
      'Cursor agent run failed (status=' + ((result && result.status) || 'unknown') + ')';
    const err = new Error(msg);
    err.code = 'RUN_FAILED';
    throw err;
  }

  return {
    choices: [{ message: { role: 'assistant', content: String(result.result) } }],
    model: modelId,
    provider: 'cursor'
  };
}

module.exports = {
  chatCompletions,
  getApiKey,
  getModelId
};
