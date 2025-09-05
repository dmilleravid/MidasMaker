// Extend jest-native matchers
import '@testing-library/jest-native/extend-expect';

// Mock expo-router to avoid importing Expo runtime during tests
jest.mock('expo-router', () => {
  return {
    Link: ({ children }: any) => children,
  };
});

// Mock expo runtime to avoid import meta registry issues under Jest
jest.mock('expo', () => ({
  __esModule: true,
}));


