/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CI tool. */
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const files = execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const findings = [];
for (const file of files) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('\0')) continue;
  content.split(/\r?\n/).forEach((line, index) => {
    let secret = /sb_secret_[A-Za-z0-9_-]{20,}/.test(line) || /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(line);
    for (const token of line.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
      try { secret ||= JSON.parse(Buffer.from(token[0].split('.')[1], 'base64url').toString()).role === 'service_role'; } catch { /* Not a JWT. */ }
    }
    if (secret) findings.push(`${file}:${index + 1}`);
  });
}
if (findings.length) {
  console.error(`Possible server credentials found (values deliberately omitted):\n${findings.join('\n')}`);
  process.exitCode = 1;
} else console.log('Working-tree credential check passed. This does not scan or clean Git history.');
