import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'F:/perfume';
const exts = new Set(['.jsx', '.js', '.css', '.html']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
      walk(full, out);
    } else if (exts.has(entry.slice(entry.lastIndexOf('.')))) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(join(root, 'src')).concat(
  readdirSync(join(root)).filter((e) => e.endsWith('.html')).map((e) => join(root, e)),
);

let changed = 0;
for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const next = raw
    .split('BOIRE')
    .join('NOIRE')
    .split('Boire')
    .join('Noire')
    .split('boire')
    .join('noire');
  if (next !== raw) {
    writeFileSync(file, next);
    changed++;
    console.log('updated', file);
  }
}
console.log('files updated:', changed);
