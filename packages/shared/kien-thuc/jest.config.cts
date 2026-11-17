const { readFileSync } = require('fs');

const swcJestConfig = JSON.parse(readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8'));

swcJestConfig.swcrc = false;

module.exports = {
  displayName: 'shared-kien-thuc',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  passWithNoTests: true,
  coverageDirectory: 'test-output/jest/coverage',
};
