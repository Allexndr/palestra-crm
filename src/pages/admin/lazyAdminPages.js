import { lazy } from 'react';

/** Единая точка ленивой загрузки, чтобы /admin/* и публичные entry не дублировали чанк. */
export const SchedulePage = lazy(() => import('./Schedule').then((m) => ({ default: m.Schedule })));
export const LeaguePage = lazy(() => import('./League').then((m) => ({ default: m.League })));
