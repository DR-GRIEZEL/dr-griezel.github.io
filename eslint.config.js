import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,

  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.browser }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  },

  prettier
];
