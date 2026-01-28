const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343]
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta',  // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
              options: { metaObjectReplacement: { env: { MODE: 'development' } } },
            }
          ]
        }
      }
    ]
  },
  preset: "ts-jest",
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.jest.json',
      useESM: true,
    }
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/__mocks__/fileMock.js",
    // "^.+\\.svg$": "jest-transformer-svg",
    "^@/(.*)$": "<rootDir>/src/$1",
    '^/img/(.*)$': '<rootDir>/public/img/$1',
    '^swiper/react$': '<rootDir>/src/__mocks__/swiper/react.js',
    '^swiper/modules$': '<rootDir>/src/__mocks__/swiper/modules.js',
    'swiper/css': '<rootDir>/src/__mocks__/styleMock.js',
    '^swiper/css/bundle$': '<rootDir>/src/__mocks__/styleMock.js',
    'swiper/css/pagination': '<rootDir>/src/__mocks__/styleMock.js',
    'swiper/react': '<rootDir>/src/__mocks__/swiper/react.js',
    'swiper/modules': '<rootDir>/src/__mocks__/swiper/modules.js',
  },
  setupFilesAfterEnv: [
    "<rootDir>/setupTests.ts"
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(swiper|ssr-window|dom7)/)', // Include Swiper and its dependencies
  ],
};
