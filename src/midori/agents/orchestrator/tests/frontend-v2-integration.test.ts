/**
 * Frontend-V2 Integration Tests
 * ทดสอบการเชื่อมต่อระหว่าง Frontend-V2 และ Project Context
 */

import { FrontendV2ProjectContextMapper } from '../mappers/frontendV2ProjectContextMapper';
import { ProjectContextService } from '../services/projectContextService';
import { ComponentResultV2 } from '../../frontend-v2/schemas/types';

describe('Frontend-V2 Project Context Integration', () => {
  let mockFrontendResult: ComponentResultV2;

  beforeEach(() => {
    mockFrontendResult = {
      success: true,
      result: {
        businessCategory: 'restaurant',
        projectType: 'restaurant_website',
        templateUsed: 'template-system-v2',
        blocksGenerated: ['hero-basic', 'navbar-basic', 'footer-basic'],
        aiContentGenerated: true,
        customizationsApplied: ['colors', 'layout'],
        overridesApplied: ['hero-content', 'navbar-brand']
      },
      files: [
        {
          path: 'src/components/Hero.tsx',
          content: 'import React from "react";\nexport const Hero = () => <div>Hero Component</div>;',
          type: 'component',
          size: 150,
          blockId: 'hero-basic',
          customized: false
        },
        {
          path: 'src/components/Navbar.tsx',
          content: 'import React from "react";\nexport const Navbar = () => <nav>Navbar Component</nav>;',
          type: 'component',
          size: 120,
          blockId: 'navbar-basic',
          customized: false
        },
        {
          path: 'src/App.tsx',
          content: 'import React from "react";\nexport const App = () => <div>App Component</div>;',
          type: 'component',
          size: 100,
          blockId: 'app-basic',
          customized: false
        }
      ],
      projectStructure: {
        projectStructure: {
          name: 'restaurant-website',
          type: 'vite-react-typescript',
          description: 'Modern restaurant website'
        },
        files: [
          {
            path: 'src/App.tsx',
            content: 'App content',
            type: 'typescript',
            language: 'typescript'
          },
          {
            path: 'src/pages/Home.tsx',
            content: 'Home page content',
            type: 'typescript',
            language: 'typescript'
          }
        ]
      },
      preview: {
        url: 'https://preview.example.com',
        sandboxId: 'sandbox-123',
        status: 'ready',
        createdAt: '2024-01-01T00:00:00Z'
      },
      performance: {
        generationTime: 5000,
        templateRenderingTime: 2000,
        aiGenerationTime: 3000,
        totalFiles: 10,
        totalSize: '2.5MB'
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        accessibilityScore: 95,
        typescriptErrors: 0
      },
      metadata: {
        executionTime: 5000,
        timestamp: '2024-01-01T00:00:00Z',
        agent: 'frontend-v2',
        version: '2.0.0',
        templateSystemVersion: '1.0.0',
        aiModelUsed: 'gpt-5-nano',
        aiGeneratedData: { test: 'data' }
      }
    };
  });

  describe('FrontendV2ProjectContextMapper', () => {
    it('should map Frontend-V2 result to Project Context format', () => {
      const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(mockFrontendResult);

      expect(mappedData.frontendV2Data).toBeDefined();
      expect(mappedData.frontendV2Data.businessCategory).toBe('restaurant');
      expect(mappedData.frontendV2Data.projectType).toBe('restaurant_website');
      expect(mappedData.frontendV2Data.files).toHaveLength(3);
    });

    it('should map files to components correctly', () => {
      const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(mockFrontendResult);

      expect(mappedData.components).toHaveLength(3);
      expect(mappedData.components[0].componentId).toBe('hero-basic');
      expect(mappedData.components[0].name).toBe('Hero');
      expect(mappedData.components[0].type).toBe('hero');
    });

    it('should map project structure to pages correctly', () => {
      const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(mockFrontendResult);

      expect(mappedData.pages).toHaveLength(2);
      expect(mappedData.pages[0].name).toBe('App');
      expect(mappedData.pages[0].path).toBe('/');
      expect(mappedData.pages[0].type).toBe('home');
    });

    it('should map preview data correctly', () => {
      const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(mockFrontendResult);

      expect(mappedData.preview).toBeDefined();
      expect(mappedData.preview?.sandboxId).toBe('sandbox-123');
      expect(mappedData.preview?.previewUrl).toBe('https://preview.example.com');
      expect(mappedData.preview?.status).toBe('running');
    });

    it('should handle missing preview data', () => {
      const resultWithoutPreview = { ...mockFrontendResult, preview: undefined };
      const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(resultWithoutPreview);

      expect(mappedData.preview).toBeNull();
    });

    it('should handle missing project structure', () => {
      const resultWithoutStructure = { ...mockFrontendResult, projectStructure: undefined };
      const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(resultWithoutStructure);

      expect(mappedData.pages).toHaveLength(0);
    });
  });

  describe('Component Type Mapping', () => {
    it('should map block IDs to component types correctly', () => {
      const testCases = [
        { blockId: 'hero-basic', expectedType: 'hero' },
        { blockId: 'navbar-basic', expectedType: 'header' },
        { blockId: 'footer-basic', expectedType: 'footer' },
        { blockId: 'card-basic', expectedType: 'card' },
        { blockId: 'menu-basic', expectedType: 'menu' },
        { blockId: 'unknown-block', expectedType: 'custom' }
      ];

      testCases.forEach(({ blockId, expectedType }) => {
        const mockFile = {
          path: 'src/components/Test.tsx',
          content: 'test',
          type: 'component' as const,
          size: 100,
          blockId,
          customized: false
        };

        const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext({
          ...mockFrontendResult,
          files: [mockFile]
        });

        expect(mappedData.components[0].type).toBe(expectedType);
      });
    });
  });

  describe('Page Type Mapping', () => {
    it('should map file paths to page types correctly', () => {
      const testCases = [
        { path: 'src/App.tsx', expectedType: 'home' },
        { path: 'src/pages/About.tsx', expectedType: 'about' },
        { path: 'src/pages/Contact.tsx', expectedType: 'contact' },
        { path: 'src/pages/Menu.tsx', expectedType: 'menu' },
        { path: 'src/pages/Products.tsx', expectedType: 'products' },
        { path: 'src/pages/Unknown.tsx', expectedType: 'custom' }
      ];

      testCases.forEach(({ path, expectedType }) => {
        const mockStructure = {
          projectStructure: {
            name: 'test',
            type: 'vite-react-typescript',
            description: 'test'
          },
          files: [{
            path,
            content: 'test',
            type: 'typescript',
            language: 'typescript'
          }]
        };

        const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext({
          ...mockFrontendResult,
          projectStructure: mockStructure
        });

        if (mappedData.pages.length > 0) {
          expect(mappedData.pages[0].type).toBe(expectedType);
        }
      });
    });
  });

  describe('Preview Status Mapping', () => {
    it('should map preview status correctly', () => {
      const testCases = [
        { frontendStatus: 'pending', expectedStatus: 'creating' },
        { frontendStatus: 'ready', expectedStatus: 'running' },
        { frontendStatus: 'error', expectedStatus: 'error' }
      ];

      testCases.forEach(({ frontendStatus, expectedStatus }) => {
        const mockPreview = {
          url: 'https://preview.example.com',
          sandboxId: 'sandbox-123',
          status: frontendStatus as 'pending' | 'ready' | 'error',
          createdAt: '2024-01-01T00:00:00Z'
        };

        const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext({
          ...mockFrontendResult,
          preview: mockPreview
        });

        expect(mappedData.preview?.status).toBe(expectedStatus);
      });
    });
  });
});
