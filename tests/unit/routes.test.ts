import { describe, expect, it } from 'vitest';
import { pagePath, paginate, buildManifest } from '../../src/lib/routes';

describe('static routes', () => {
  it('uses stable slug and English default path', () => {
    expect(pagePath('en', 'projects/example/')).toBe('/projects/example/');
    expect(pagePath('zh', 'projects/example/')).toBe('/zh/projects/example/');
  });
  it('builds actual pages only and keeps all records reachable', () => {
    const records = Array.from({ length: 49 }, (_, id) => id);
    expect(paginate(records).map((x) => x.length)).toEqual([24, 24, 1]);
    expect(paginate([])).toEqual([[]]);
  });
  it('does not fabricate projects or empty category routes', () => {
    const routes = buildManifest([], []);
    expect(routes.some((route) => route.kind === 'category')).toBe(false);
    expect(routes.filter((route) => route.kind === 'home').map((route) => route.path)).toEqual(['/', '/zh/']);
    expect(routes.find((route) => route.path === '/search/')?.indexable).toBe(false);
  });
});
