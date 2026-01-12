import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/test/**/*.test.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        'src/assets/js/login/auth.js',
        'src/assets/js/login/buttons-init.js',
        'src/assets/js/login/login-buttons.js',
        'src/assets/js/login/gate-core.js',
        'src/assets/js/login/gate-bootstrap.js',
        'src/assets/js/login/gate-content.js',
        'src/assets/js/blog-filter.js',
        'src/assets/js/widgets/widgets.js',
        'src/assets/js/widgets/pomodoro-core.js',
        'src/assets/js/widgets/pomodoro.js',
        'src/test/**/*.js',
      ],
      exclude: ['src/test/**/*.test.js'],
    },
  },
});
