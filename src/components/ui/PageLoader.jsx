import React from 'react';

/**
 * Full-route loading shell for React.lazy; minimal motion for perceived speed.
 */
export const PageLoader = () => (
  <div
    className="page-loader"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="page-loader__inner" />
    <span className="visually-hidden">Загрузка…</span>
  </div>
);
