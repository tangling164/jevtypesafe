import type { en } from '../i18n/en';
import type { Route } from './routes';

type Dictionary = Record<keyof typeof en, string>;

export function pageDescription(route: Route, t: Dictionary) {
  const description =
    route.kind === 'project'
      ? ((route.project?.locales[route.locale] ?? route.project?.locales.en)
          ?.summary ?? t.intro)
      : route.kind === 'directory'
        ? t.projectsDescription
        : route.kind === 'search'
          ? t.searchDescription
          : route.kind === 'sponsor'
            ? `${t.cooperation} ${t.cooperationBody}`
            : route.kind === 'submit'
              ? t.free
              : route.kind === 'category'
                ? (route.category?.description[route.locale] ??
                  t.categoryIntro.replace(
                    '{category}',
                    route.category?.[route.locale] ?? '',
                  ))
                : route.kind === 'about'
                  ? t.aboutDescription
                  : route.kind === 'privacy'
                    ? t.privacyDescription
                    : t.intro;

  if (route.pages <= 1) return description;
  return `${description} ${t.paginationStatus.replace('{page}', String(route.page)).replace('{pages}', String(route.pages))}.`;
}
