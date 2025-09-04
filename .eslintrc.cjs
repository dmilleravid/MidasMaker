module.exports = {
  root: true,
  ignorePatterns: ["**/node_modules/**", "**/dist/**"],
  overrides: [
    {
      files: ["apps/api/**/*.{ts,tsx}"]
    },
    {
      files: ["apps/web/**/*.{ts,tsx,js,jsx}"]
    },
    {
      files: ["apps/mobile/**/*.{ts,tsx,js,jsx}"]
    }
  ]
};

