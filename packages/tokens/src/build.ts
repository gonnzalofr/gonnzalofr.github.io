// pnpm build: write dist/tokens.css from src/tokens.ts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { tokensCss } from './css.ts';

const out = new URL('../dist/tokens.css', import.meta.url);
mkdirSync(new URL('./', out), { recursive: true });
writeFileSync(out, tokensCss());
console.log(`wrote ${out.pathname.replace(/^\/([A-Z]:)/, '$1')}`);
