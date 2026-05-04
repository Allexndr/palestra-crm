import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Polyfill Response.prototype.clone if it's missing or broken in the test environment
if (global.Response && !global.Response.prototype.clone) {
  global.Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    });
  };
}
