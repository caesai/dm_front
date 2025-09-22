const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  // testEnvironment: "node",
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
  preset: "ts-jest",
  globals: {
    'ts-jest': {
      // tsconfig: '<rootDir>/tsconfig.jest.json'
      tsconfig: './tsconfig.json',
      useESM: true
    }
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "identity-obj-proxy",
    "^.+\\.svg$": "jest-transformer-svg",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: [
    "<rootDir>/setupTests.ts"
  ],
};
