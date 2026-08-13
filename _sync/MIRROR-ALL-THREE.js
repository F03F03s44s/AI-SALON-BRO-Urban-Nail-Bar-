#!/usr/bin/env node
/**
 * MIRROR-ALL-THREE
 * Keep Windows 11 / macOS High Sierra / macOS Big Sur identical:
 *   1) Backup shared data-store
 *   2) Sync appointment/client data (newest/richest wins)
 *   3) Mirror UI + server code (newest file mtime wins across packages)
 *
 * Safe skips: node_modules, .git, data stores, logs, OS-specific starters.
 * Run from START-SALON on any OS, or manually:
 *   node _sync/MIRROR-ALL-THREE.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const OS_PACKAGE_NAMES = [
  'Urban Nail Bar (Windows 11)',
  'Urban Nail Bar (macOS High Sierra)',
  'Urban Nail Bar (macOS Sierra)',
  'Urban Nail Bar (macOS Big Sur)',
];

const MIRROR_DIRS = ['pages', 'shared', 'assets', 'print', 'marketing', 'docs', 'scripts'];
const MIRROR_ROOT_FILES = [
  'index.html',
  'AI-SALON-PRO-GUIDE.html',
  'HOW-TO-START.txt',
  'package.json',
  'DEMO-SCRIPT.md',
  'static-server.js',
  'setup-assets.py',
  'requirements.txt',
  'START-SALON.bat',
];

/** Never overwrite these (path relative to package root, posix) */
const SKIP_EXACT = new Set([
  'START-SALON.command',
  'server/data-store.json',
  'server/data-store.json.bak',
  'server/salon-server.log',
  'server/salon-server.pid',
]);

function looksLikeSalonProRoot(dir) {
  try {
    if (!dir || !fs.existsSync(dir)) return false;
    if (fs.existsSync(path.join(dir, '_shared-salon-data'))) return true;
    let hits = 0;
    OS_PACKAGE_NAMES.forEach((name) => {
      if (fs.existsSync(path.join(dir, name, 'server', 'salon-server.js'))) hits += 1;
    });
    return hits >= 2;
  } catch (e) {
    return false;
  }
}

function findRoot() {
  if (process.env.SALON_PRO_ROOT && looksLikeSalonProRoot(process.env.SALON_PRO_ROOT)) {
    return path.resolve(process.env.SALON_PRO_ROOT);
  }
  const fromScript = path.resolve(__dirname, '..');
  if (looksLikeSalonProRoot(fromScript)) return fromScript;
  let cur = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (looksLikeSalonProRoot(cur)) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return fromScript;
}

function existingPackages(root) {
  return OS_PACKAGE_NAMES
    .map((name) => ({ name, dir: path.join(root, name) }))
    .filter((p) => fs.existsSync(path.join(p.dir, 'server', 'salon-server.js')));
}

function shouldSkipRel(relPosix) {
  const r = String(relPosix || '').replace(/\\/g, '/');
  if (!r) return true;
  if (SKIP_EXACT.has(r)) return true;
  if (r === '.git' || r.startsWith('.git/')) return true;
  if (r.includes('/.git/') || r.includes('/.git')) return true;
  if (r === 'server/node_modules' || r.startsWith('server/node_modules/')) return true;
  if (r === 'node_modules' || r.startsWith('node_modules/')) return true;
  if (/^server\/data-store/i.test(r)) return true;
  if (r.endsWith('.log') || r.endsWith('.pid')) return true;
  if (r.endsWith('.DS_Store') || r.endsWith('Thumbs.db')) return true;
  // Keep package-local git metadata out of the mirror
  if (r === '.gitattributes' || r === '.gitignore') return true;
  if (r.startsWith('.vscode/')) return true;
  return false;
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function dataStats(file) {
  try {
    if (!fs.existsSync(file)) return { savedAt: 0, clients: 0, appointments: 0, ok: false };
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    const d = (j && j.data) || {};
    return {
      savedAt: Number(j && j.savedAt) || 0,
      clients: Array.isArray(d.clients) ? d.clients.length : 0,
      appointments: Array.isArray(d.appointments) ? d.appointments.length : 0,
      ok: true,
    };
  } catch (e) {
    return { savedAt: 0, clients: 0, appointments: 0, ok: false };
  }
}

function backupHub(root) {
  const hubDir = path.join(root, '_shared-salon-data');
  const hub = path.join(hubDir, 'data-store.json');
  if (!fs.existsSync(hub)) {
    console.log('[backup] No hub data-store yet — skip');
    return null;
  }
  const backupDir = path.join(hubDir, 'backups');
  ensureDir(backupDir);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(backupDir, 'data-store.start.' + stamp + '.json');
  fs.copyFileSync(hub, dest);
  // Keep last ~30 start backups + any other snapshots
  try {
    const files = fs.readdirSync(backupDir)
      .filter((n) => /^data-store\./i.test(n))
      .map((n) => {
        const p = path.join(backupDir, n);
        let m = 0;
        try { m = fs.statSync(p).mtimeMs; } catch (e) { m = 0; }
        return { p, m };
      })
      .sort((a, b) => b.m - a.m);
    files.slice(30).forEach((f) => {
      try { fs.unlinkSync(f.p); } catch (e) { /* ignore */ }
    });
  } catch (e) { /* ignore */ }
  console.log('[backup] Saved', dest);
  return dest;
}

function syncDataStores(root) {
  const hubDir = path.join(root, '_shared-salon-data');
  const hub = path.join(hubDir, 'data-store.json');
  const candidates = [hub];
  existingPackages(root).forEach((p) => {
    candidates.push(path.join(p.dir, 'server', 'data-store.json'));
  });

  let best = null;
  let bestScore = -1;
  candidates.forEach((f) => {
    const st = dataStats(f);
    if (!st.ok) return;
    const score = st.savedAt * 1e6 + st.clients + st.appointments;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  });

  if (!best) {
    console.log('[data] No data-store.json found — nothing to sync');
    return;
  }

  const bestSt = dataStats(best);
  console.log('[data] Source:', best);
  console.log('       clients=' + bestSt.clients + ' appointments=' + bestSt.appointments + ' savedAt=' + bestSt.savedAt);

  ensureDir(hubDir);
  const targets = [hub];
  existingPackages(root).forEach((p) => {
    targets.push(path.join(p.dir, 'server', 'data-store.json'));
  });

  let n = 0;
  targets.forEach((dest) => {
    if (path.resolve(dest) === path.resolve(best)) {
      console.log('       keep', dest);
      return;
    }
    try {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(best, dest);
      n += 1;
      console.log('       mirrored →', dest);
    } catch (e) {
      console.log('       SKIP', dest, '(' + e.message + ')');
    }
  });
  console.log('[data] Mirrored to ' + n + ' location(s)');
}

function collectFiles(pkgDir, relBase, outMap) {
  const abs = path.join(pkgDir, relBase);
  if (!fs.existsSync(abs)) return;
  const st = fs.statSync(abs);
  const relPosix = relBase.replace(/\\/g, '/');
  if (shouldSkipRel(relPosix)) return;

  if (st.isFile()) {
    const prev = outMap.get(relPosix);
    const mtime = st.mtimeMs || 0;
    const size = st.size || 0;
    if (!prev || mtime > prev.mtime || (mtime === prev.mtime && size > prev.size)) {
      outMap.set(relPosix, { abs, mtime, size, pkgDir });
    }
    return;
  }

  if (!st.isDirectory()) return;
  let entries;
  try {
    entries = fs.readdirSync(abs, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const ent of entries) {
    const childRel = relPosix ? relPosix + '/' + ent.name : ent.name;
    if (shouldSkipRel(childRel)) continue;
    collectFiles(pkgDir, childRel, outMap);
  }
}

function mirrorUiNewestWins(root) {
  const pkgs = existingPackages(root);
  if (pkgs.length < 2) {
    console.log('[ui] Need at least 2 packages to mirror — found ' + pkgs.length);
    return { copied: 0 };
  }

  const winners = new Map();
  pkgs.forEach((p) => {
    MIRROR_DIRS.forEach((dir) => collectFiles(p.dir, dir, winners));
    MIRROR_ROOT_FILES.forEach((file) => collectFiles(p.dir, file, winners));
    // Server code (not data / node_modules)
    collectFiles(p.dir, 'server', winners);
  });

  let copied = 0;
  let skippedSame = 0;
  winners.forEach((src, rel) => {
    pkgs.forEach((p) => {
      if (path.resolve(p.dir) === path.resolve(src.pkgDir)) return;
      const dest = path.join(p.dir, rel);
      try {
        if (fs.existsSync(dest)) {
          const dstSt = fs.statSync(dest);
          if (dstSt.size === src.size && Math.abs((dstSt.mtimeMs || 0) - src.mtime) < 2) {
            skippedSame += 1;
            return;
          }
          // If dest is newer, leave it (another winner pass will prefer it next run)
          if ((dstSt.mtimeMs || 0) > src.mtime) {
            skippedSame += 1;
            return;
          }
        }
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src.abs, dest);
        try {
          const fd = fs.openSync(dest, 'r+');
          fs.futimesSync(fd, new Date(src.mtime), new Date(src.mtime));
          fs.closeSync(fd);
        } catch (e) { /* ignore mtime restore */ }
        copied += 1;
      } catch (e) {
        console.log('       SKIP UI', dest, '(' + e.message + ')');
      }
    });
  });

  console.log('[ui] Winner files tracked:', winners.size);
  console.log('[ui] Copied:', copied, '  already-in-sync skips:', skippedSame);
  return { copied, tracked: winners.size };
}

function main() {
  const root = findRoot();
  console.log('============================================');
  console.log('  Urban Nail Bar — MIRROR-ALL-THREE');
  console.log('  Backup + data sync + UI mirror');
  console.log('============================================');
  console.log('Salon root:', root);
  const pkgs = existingPackages(root);
  console.log('Packages:', pkgs.map((p) => p.name).join(' | ') || '(none)');
  console.log('');

  console.log('--- 1/3 Backup ---');
  backupHub(root);
  console.log('');

  console.log('--- 2/3 Data sync (appointments + clients) ---');
  syncDataStores(root);
  console.log('');

  console.log('--- 3/3 UI + server mirror (newest wins) ---');
  mirrorUiNewestWins(root);
  console.log('');

  console.log('Done. All OS packages share the same calendar data and matching pages.');
}

main();
