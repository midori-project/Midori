/**
 * Jest Setup for Frontend-V2 Agent Tests
 */

// Type definitions for Jest (if not available in build context)
declare const beforeAll: (fn: () => void) => void;
declare const afterAll: (fn: () => void) => void;
declare const jest: {
  fn: () => any;
  setTimeout: (ms: number) => void;
};

// Mock console methods to reduce noise in tests
const originalConsole = console;

if (typeof beforeAll !== 'undefined') {
  beforeAll(() => {
    // Suppress console.log in tests unless explicitly enabled
    if (!process.env.DEBUG_TESTS) {
      console.log = jest.fn();
      console.warn = jest.fn();
      console.error = jest.fn();
    }
  });

  afterAll(() => {
    // Restore original console
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  // Global test timeout
  jest.setTimeout(30000);
}

// Mock environment variables (only in test context)
if (process.env.NODE_ENV !== 'production') {
  (process.env as any).NODE_ENV = 'test';
  (process.env as any).OPENAI_API_KEY = 'test-api-key';
}

// Global test utilities
(global as any).testUtils = {
  createMockTask: (overrides = {}) => ({
    taskId: 'test-task-001',
    taskType: 'generate_website',
    businessCategory: 'restaurant',
    keywords: ['restaurant', 'food', 'thai'],
    includePreview: false,
    ...overrides
  }),
  
  createMockResult: (overrides = {}) => ({
    success: true,
    result: {
      businessCategory: 'restaurant',
      templateUsed: 'template-system-v2',
      blocksGenerated: ['hero-basic', 'navbar-basic'],
      aiContentGenerated: true,
      customizationsApplied: [],
      overridesApplied: []
    },
    files: [],
    performance: {
      generationTime: 1000,
      templateRenderingTime: 500,
      aiGenerationTime: 500,
      totalFiles: 0,
      totalSize: '0B'
    },
    validation: {
      isValid: true,
      errors: [],
      warnings: [],
      accessibilityScore: 95,
      typescriptErrors: 0
    },
    metadata: {
      executionTime: 1000,
      timestamp: new Date().toISOString(),
      agent: 'frontend-v2',
      version: '2.0.0'
    },
    ...overrides
  })
};
