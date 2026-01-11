import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        'assets/js/login/auth.js',
        'assets/js/login/buttons-init.js',
        'assets/js/login/login-buttons.js',
        'assets/js/login/gate-core.js',
        'assets/js/blog-filter.js',
        'assets/js/widgets/widgets.js',
        'assets/js/widgets/pomodoro-core.js',
        'assets/js/widgets/pomodoro.js',
        'test/**/*.js',
      ],
      exclude: ['test/**/*.test.js'],
    },
  },
});
