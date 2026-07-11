#!/usr/bin/env node
// Secret guard: fails the build if server-only secrets appear in client app code.
// Scans apps/website + apps/admin source (and built .next output when present).
// Rationale: only NEXT_PUBLIC_* env vars and publishable keys may reach the browser.
// See AGENT_ACTIVITY_LOG.md (2026-07-11) for the security plan this enforces.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();

// Source dirs: full ruleset (hard secrets + non-public process.env heuristic).
const SOURCE_TARGETS = [
  'apps/website/src',
  'apps/admin/src',
];

// Built browser assets: hard-secret rules only (minified vendor code legitimately
// references Next internals via process.env, so the env heuristic would false-positive).
const STATIC_TARGETS = [
  'apps/website/.next/static',
  'apps/admin/.next/static',
];

const SCAN_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.env', '',
]);

const IGNORE_DIRS = new Set(['node_modules', '.git', 'cache']);

// Each rule: name + regex. A match anywhere in scanned client code fails CI.
const RULES = [
  { name: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'Service account private_key', re: /"private_key"\s*:/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Postgres URL with credentials', re: /postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/ },
  { name: 'Server secret env name', re: /\b(?:JWT_SECRET|RAZORPAY_KEY_SECRET|RESEND_API_KEY|UPSTASH_REDIS_REST_TOKEN|FIREBASE_SERVICE_ACCOUNT_KEY|DATABASE_URL)\b/ },
];

// process.env references that are NOT NEXT_PUBLIC_* and not the safe allowlist.
const SAFE_ENV = new Set(['NODE_ENV']);
const NON_PUBLIC_ENV = /process\.env\.([A-Z0-9_]+)/g;

/** @param {string} dir @param {string[]} out */
function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (SCAN_EXTENSIONS.has(extname(entry))) {
      out.push(full);
    }
  }
}

const sourceFiles = [];
for (const target of SOURCE_TARGETS) {
  const abs = join(ROOT, target);
  if (existsSync(abs)) walk(abs, sourceFiles);
}

const staticFiles = [];
for (const target of STATIC_TARGETS) {
  const abs = join(ROOT, target);
  if (existsSync(abs)) walk(abs, staticFiles);
}

/** @type {{file:string, line:number, rule:string, text:string}[]} */
const findings = [];

/** @param {string} file @param {boolean} envHeuristic */
function scanFile(file, envHeuristic) {
  const rel = file.replace(ROOT + '\\', '').replace(ROOT + '/', '').replaceAll('\\', '/');
  const isServerRouteHandler = /\/(route|middleware)\.[tj]sx?$/.test(rel) || /\/api\//.test(rel);
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    return;
  }
  const lines = content.split(/\r?\n/);
  lines.forEach((text, i) => {
    for (const rule of RULES) {
      if (rule.re.test(text)) {
        findings.push({ file: rel, line: i + 1, rule: rule.name, text: text.trim().slice(0, 120) });
      }
    }
    // Non-public env references are only allowed in server route handlers/middleware.
    if (envHeuristic && !isServerRouteHandler) {
      let m;
      NON_PUBLIC_ENV.lastIndex = 0;
      while ((m = NON_PUBLIC_ENV.exec(text)) !== null) {
        const name = m[1];
        if (name.startsWith('NEXT_PUBLIC_') || SAFE_ENV.has(name)) continue;
        findings.push({
          file: rel,
          line: i + 1,
          rule: `Non-public env in client code (process.env.${name})`,
          text: text.trim().slice(0, 120),
        });
      }
    }
  });
}

for (const file of sourceFiles) scanFile(file, true);
for (const file of staticFiles) scanFile(file, false);
const files = [...sourceFiles, ...staticFiles];

if (findings.length > 0) {
  console.error('\n❌ Secret guard FAILED — server secrets must never reach client bundles.\n');
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  [${f.rule}]`);
    console.error(`    ${f.text}`);
  }
  console.error(`\n${findings.length} issue(s) found. Move secrets server-side (API only) or use NEXT_PUBLIC_* for safe values.\n`);
  process.exit(1);
}

console.log(`✅ Secret guard passed — scanned ${files.length} client file(s), no leaks found.`);
