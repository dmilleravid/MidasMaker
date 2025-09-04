module.exports = {
  root: true,
  env: { node: true, es2022: true, jest: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { project: null, ecmaVersion: 2022, sourceType: "module" },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "import/order": ["warn", { "newlines-between": "always" }],
  },
};
