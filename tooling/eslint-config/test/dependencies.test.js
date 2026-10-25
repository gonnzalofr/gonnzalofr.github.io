// No animation library is a dependency of any package in the workspace (README: motion is CSS only).
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { isAnimationPackage } from '../src/animation.js';

const root = fileURLToPath(new URL('../../..', import.meta.url)).replace(/[\\/]$/, '');
const manifests = ['package.json'];
for (const group of ['apps', 'packages', 'tooling']) {
  for (const dir of readdirSync(`${root}/${group}`, { withFileTypes: true })) {
    if (dir.isDirectory() && existsSync(`${root}/${group}/${dir.name}/package.json`)) manifests.push(`${group}/${dir.name}/package.json`);
  }
}

test('the workspace has no animation library as a dependency', () => {
  const found = [];
  for (const file of manifests) {
    const pkg = JSON.parse(readFileSync(`${root}/${file}`, 'utf8'));
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      for (const name of Object.keys(pkg[field] ?? {})) if (isAnimationPackage(name)) found.push(`${file}: ${name}`);
    }
  }
  assert.deepEqual(found, []);
});

test('every package of the workspace was looked at', () => {
  assert.ok(manifests.length >= 8, manifests.join(', '));
});
