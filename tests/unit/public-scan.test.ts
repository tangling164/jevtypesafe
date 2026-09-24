import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('public scan', () => {
  it('finds a token that exists only in Git history without printing its value', () => {
    const repository = mkdtempSync(join(tmpdir(), 'jev-public-scan-'));
    temporaryDirectories.push(repository);
    const git = (...args: string[]) => execFileSync('git', args, { cwd: repository, stdio: 'pipe' });
    git('init');
    git('config', 'user.email', 'scan-test@example.invalid');
    git('config', 'user.name', 'Scan Test');
    mkdirSync(join(repository, 'dist'));
    writeFileSync(join(repository, 'dist', 'index.html'), '<h1>Safe build</h1>');

    const token = `ghp_${'A'.repeat(30)}`;
    writeFileSync(join(repository, 'history-secret.txt'), token);
    git('add', '.');
    git('commit', '-m', 'add historical fixture');
    rmSync(join(repository, 'history-secret.txt'));
    git('add', '-A');
    git('commit', '-m', 'remove historical fixture');

    const scan = spawnSync(process.execPath, [
      '--import', import.meta.resolve('tsx'), resolve('scripts/scan-public.ts'),
    ], { cwd: repository, encoding: 'utf8' });
    expect(scan.status).toBe(1);
    const output = scan.stdout;
    const result = JSON.parse(output) as {
      history: string;
      findings: Array<{ file: string; rule: string }>;
    };

    expect(result.history).toBe('scanned');
    expect(result.findings).toContainEqual(expect.objectContaining({
      file: expect.stringContaining('history-secret.txt'),
      rule: 'github-token',
    }));
    expect(output).not.toContain(token);
  }, 15_000);
});
