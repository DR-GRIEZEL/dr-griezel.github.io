import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        'assets/js/login-auth.js',
        'assets/js/login-page-init.js',
        'assets/js/login-page.js',
        'assets/js/widgets.js',
        'assets/js/pomodoro-core.js',
        'test/**/*.js',
      ],
      exclude: ['test/**/*.test.js'],
    },
  },
});
