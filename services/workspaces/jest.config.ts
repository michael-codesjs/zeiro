import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/application'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'application/**/*.ts',
    '!application/**/*.d.ts',
    '!application/**/__tests__/**',
    '!application/**/index.ts'
  ],
  moduleNameMapping: {
    '^@adapters/(.*)$': '<rootDir>/application/adapters/$1',
    '^@typings/(.*)$': '<rootDir>/application/types/$1',
    '^@repositories/(.*)$': '<rootDir>/application/repositories/$1',
    '^@use-cases/(.*)$': '<rootDir>/application/use-cases/$1',
    '^@interfaces/(.*)$': '<rootDir>/application/interfaces/$1'
  }
}

export default config
