import { describe, expect, it } from 'vitest';
import { en } from '../../src/i18n/en';
import { zh } from '../../src/i18n/zh';
import { pageDescription } from '../../src/lib/page-metadata';
import type { Route } from '../../src/lib/routes';

const route = (kind: Route['kind'], locale: Route['locale']): Route => ({
  path: locale === 'zh' ? `/zh/${kind}/` : `/${kind}/`,
  locale,
  kind,
  indexable: kind !== 'search',
  counterpart: null,
  projects: [],
  page: 1,
  pages: 1,
  total: 0,
});

describe('page metadata', () => {
  it.each([
    ['en', en],
    ['zh', zh],
  ] as const)(
    'gives core %s pages distinct descriptions',
    (locale, dictionary) => {
      const descriptions = [
        'home',
        'directory',
        'about',
        'privacy',
        'submit',
        'sponsor',
      ].map((kind) =>
        pageDescription(route(kind as Route['kind'], locale), dictionary),
      );
      expect(new Set(descriptions).size).toBe(descriptions.length);
    },
  );

  it('uses the locale-specific category description', () => {
    const categoryRoute: Route = {
      ...route('category', 'zh'),
      category: {
        id: 'developer',
        en: 'Developer Tools',
        zh: '开发工具',
        description: {
          en: 'English category description.',
          zh: '中文分类说明。',
        },
      },
    };
    expect(pageDescription(categoryRoute, zh)).toBe('中文分类说明。');
  });
});
