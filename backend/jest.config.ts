import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  roots: ['<rootDir>/tests'],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/tests/setup/setupEnv.ts'],
  
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/*.d.ts",
    "!src/config/**",
    "!src/app.ts",
    "!src/server.ts"
  ]
};

export default config;