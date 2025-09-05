module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-clone-referenced-element|@react-native/polyfills|expo(nent)?|@expo(nent)?/.*|expo-router|@expo/.*|@unimodules/.*|unimodules|sentry-expo|nativewind|react-native-svg)/)'
  ],
};

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};


